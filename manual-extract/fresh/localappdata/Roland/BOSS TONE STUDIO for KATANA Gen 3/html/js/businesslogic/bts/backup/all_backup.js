/**
 *  [概要]
 *  All Data Backupの処理
 *
 *  [使用箇所]
 *  ALL DATA BACKUP画面
 * 
 */

var allBackupController = (function() {
  /**
   *  実機との通信に用いるobserver。ALL DATAオブジェクトに登録して用いるが、
   *  登録しているobserverは常に一つでなければならない。
   */
  var observer = {
    forBackupToFile: {
      fileName: '',
      notify: function(msg, arg) {
        if (msg !== 'all_data_read') {
          return;
        }
        if (arg === 'timeout' || arg === 'end') {
          if (arg === 'end') {
            allBackupController.allData.removeObserver(this); // observerを破棄
            if (this.fileName !== '' && this.fileName !== undefined) {
              var allData = new AllDataModel();
              try {
                $native.fs.writeString(this.fileName, allData.toJSON());
                PROGRESS_DIALOG_MAP.backup.close(function() {
                  COMPLETE_DIALOG_MAP.backup.open();
                });
              } catch (e) {
                PROGRESS_DIALOG_MAP.backup.close(function() {
                  ERROR_DIALOG_MAP.fileError.open();
                });
              }
            }
          } else {
            var self = this;
            allBackupController.allData.removeObserver(this); // observerを破棄
            PROGRESS_DIALOG_MAP.backup.close();
            ERROR_DIALOG_MAP.communicationError.open(
              function() { }, // CANCEL
              function() { // RETRY
                PROGRESS_DIALOG_MAP.backup.init();
                // openするときにcancell時の処理を登録しておく
                PROGRESS_DIALOG_MAP.backup.open(function() {
                  // cancelメソッドの実行とobserverの破棄
                  allBackupController.allData.cancel();
                  allBackupController.allData.removeObserver(self);
                });
                allBackupController.allData.addObserver(self);
                allBackupController.allData.read();
              }
            );
          }
        } else {
          PROGRESS_DIALOG_MAP.backup.update(arg);
        }
      }
    },
    forBackupToCloud: {
      notify: function(msg, arg) {
        if (msg !== 'all_data_read') {
          return;
        }
        if (arg === 'timeout' || arg === 'end') {
          if (arg === 'end') {
            allBackupController.allData.removeObserver(this); // observerを破棄
            PROGRESS_DIALOG_MAP.backup.close(function() {
              fileManager.exportCloud(
                function(name) {
                  var allData = new AllDataModel();
                  $native.fs.writeString(name, allData.toJSON());
                },
                function() { },
                ProductSetting.name,
                ProductSetting.backupFile.extension
              );
            });
          } else {
            var self = this;
            allBackupController.allData.removeObserver(this); // observerを破棄
            PROGRESS_DIALOG_MAP.backup.close();
            ERROR_DIALOG_MAP.communicationError.open(
              function() { }, // CANCEL
              function() { // RETRY
                PROGRESS_DIALOG_MAP.backup.init();
                // openするときにcancell時の処理を登録しておく
                PROGRESS_DIALOG_MAP.backup.open(function() {
                  // cancelメソッドの実行とobserverの破棄
                  allBackupController.allData.cancel();
                  allBackupController.allData.removeObserver(self);
                });
                allBackupController.allData.addObserver(self);
                allBackupController.allData.read();
              }
            );
          }
        } else {
          PROGRESS_DIALOG_MAP.backup.update(arg);
        }
      }
    },
    forRestore: {
      notify: function(msg, arg) {
        if (msg !== 'all_data_write') {
          return;
        }
        var self = this;
        const _errorFunc = function() {
          allBackupController.allData.removeObserver(self); // observerを破棄
            PROGRESS_DIALOG_MAP.restore.close();
            ERROR_DIALOG_MAP.communicationError.open(
              function() { }, // CANCEL
              function() { // RETRY
                PROGRESS_DIALOG_MAP.restore.init();
                // openするときにcancell時の処理を登録しておく
                PROGRESS_DIALOG_MAP.restore.open(function() {
                  // cancelメソッドの実行とobserverの破棄
                  allBackupController.allData.cancel();
                  allBackupController.allData.removeObserver(self);
                });
                allBackupController.allData.addObserver(self);
                allBackupController.allData.write();
              }
            );
        }
        if (arg === 'timeout' || arg === 'end') {
          if (arg === 'end') {
            allBackupController.allData.removeObserver(self); // observerを破棄
            var finishFunc = function(index) {
              PROGRESS_DIALOG_MAP.restore.close(function() {
                COMPLETE_DIALOG_MAP.restore.open();
              });
              processingController.finish(index);
              var info = allBackupController.allData.paramSets['setup']['SETUP%COM'];
              if (info) {
                patchMIDIController.updateCurrentPatch(parseInt('0x' + info.join(''), 16));
              }
            };
              function delayAfterReadAlb() {
              return new Promise(resolve => {
                let count = 0;
                let interval = setInterval(function() {
                  count += 1;
                  PROGRESS_DIALOG_MAP.restore.update(50 + (count / 100) * 50);
                  if (count >= 100) {
                    clearInterval(interval);
                    resolve();
                  }
                }, 100);
              })
            }
            delayAfterReadAlb().then(function () {
              processingController.start(function (index) {
                const wait = (seconds) => {
                  return new Promise((resolve) => {
                    setTimeout(() => {
                      resolve();
                    }, seconds * 1000);
                  });
                };
                wait(0.1).then(function () {
                  var clearFunc = patchMIDIController.sendCommandExport(true, true, true, undefined, function () {
                    clearFunc = midiConnectionController.readEditor([1], function () {
                      clearFunc = patchMIDIController.fetchPatchNames(function () {
                        finishFunc(index);
                      }, function () {
                        // finishFunc(index);
                        processingController.finish(index);
                        _errorFunc();
                      });
                    }, function () {
                      // finishFunc(index);
                      processingController.finish(index);
                      _errorFunc();
                    });
                  }, function () {
                    allBackupController.allData.removeObserver(self); // observerを破棄
                    PROGRESS_DIALOG_MAP.restore.close();
                    window.patchFailure = [];
                    const rows = librarianCommonInfo.export.getTargetInstPatches(patchModelController.numOfUserPatchTotal());
                    for (let i = 0; i < rows.length; i++) {
                      window.patchFailure.push(patchModelController.getPrefix(rows[i]));
                    }
                    ERROR_DIALOG_MAP.communicationErrorOther.open(function () {
                    }, function () {
                    })
                  });
                  return function() {
                    clearFunc();
                  };
                })
              });
            });
          } else {
            _errorFunc();
          }
        } else {
          PROGRESS_DIALOG_MAP.restore.update(arg / 2);
        }
      }
    }
  };
  var obj = {
    // AllData Object
    allData: null,
    // Methods
    backupToFile: function() {
      var self = this;
      this.allData = new AllData();
      fileManager.exportFile(
        function(name) {
          PROGRESS_DIALOG_MAP.backup.init();
          // openするときにcancell時の処理を登録しておく
          PROGRESS_DIALOG_MAP.backup.open(function() {
            // cancelメソッドの実行とobserverの破棄
            self.allData.cancel();
            self.allData.removeObserver(observer.forBackupToFile);
          });
          observer.forBackupToFile.fileName = name;
          self.allData.addObserver(observer.forBackupToFile);
          self.allData.read();
        },
        function() { },
        ProductSetting.name,
        ProductSetting.backupFile.extension
      );
    },
    backupToCloud: function() {
      var self = this;
      this.allData = new AllData();
      PROGRESS_DIALOG_MAP.backup.init();
      // openするときにcancell時の処理を登録しておく
      PROGRESS_DIALOG_MAP.backup.open(function() {
        // cancelメソッドの実行とobserverの破棄
        self.allData.cancel();
        self.allData.removeObserver(observer.forBackupToCloud);
      });
      this.allData.addObserver(observer.forBackupToCloud);
      this.allData.read();
    },
    restoreFromFile: function() {
      var self = this;
      this.allData = new AllData();
      fileManager.importFile(
        function(backupData) {
          var model = new AllDataModel();
          model.load(backupData);
          PROGRESS_DIALOG_MAP.restore.init();
          // openするときにcancell時の処理を登録しておく
          PROGRESS_DIALOG_MAP.restore.open(function() {
            // cancelメソッドの実行とobserverの破棄
            self.allData.cancel();
            self.allData.removeObserver(observer.forRestore);
          });
          self.allData.addObserver(observer.forRestore);
          self.allData.write();
        },
        function() { },
        ProductSetting.backupFile.extension
      );
    },
    restoreFromCloud: function() {
      var self = this;
      var filter = {
        uti: ['jp.co.roland.BossKatana3Editor-editor.data.alb']
      };
      this.allData = new AllData();
      fileManager.importCloud(
        function(backupData) {
          var model = new AllDataModel();
          model.load(backupData);
          PROGRESS_DIALOG_MAP.restore.init();
          // openするときにcancell時の処理を登録しておく
          PROGRESS_DIALOG_MAP.restore.open(function() {
            // cancelメソッドの実行とobserverの破棄
            self.allData.cancel();
            self.allData.removeObserver(observer.forRestore);
          });
          self.allData.addObserver(observer.forRestore);
          self.allData.write();
        },
        function() {
          PROGRESS_DIALOG_MAP.restore.close();
        },
        ProductSetting.backupFile.extension,
        filter
      );
    },
    /**
     *  Disable時の処理
     *  PROGRESS BARを閉じるかつ行っていた処理のCancell処理
     */
    forceTermination: function() {
      PROGRESS_DIALOG_MAP.restore.close();
      PROGRESS_DIALOG_MAP.backup.close();
      // cancelメソッドの実行とobserverの破棄
      if (this.allData != null) {
        this.allData.cancel();
        this.allData.observers = []; // observerの破棄
      }
    }
  };
  return obj;
}());
