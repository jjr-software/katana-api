(function () {
	window.menuPageModelController = {
		openOwnerManualPage: function () {
			var lang = (navigator.userLanguage || navigator.language).substr(0, 2);
			function getURL()  {
				if (lang === 'ja') { 
					return urlDefinition.OWNERS_MANUALS_JA;
				} else {
					return urlDefinition.OWNERS_MANUALS_EN;
				}
			}

			urlDefinition.execURL(getURL());
		},
		openDriverDownloadPage: function () {
			var lang = (navigator.userLanguage || navigator.language).substr(0, 2);
			function getURL() {
				if (lang === 'ja') {
					return urlDefinition.UPDATES_DRIVERS_JA;
				} else {
					return urlDefinition.UPDATES_DRIVERS_EN;
				}
			}
			urlDefinition.execURL(getURL());
		},
		restoreAllDataFromFile: function () {
			allBackupController.restoreFromFile();
		},
		backupAllDataToFile: function () {
			allBackupController.backupToFile();
		},
	}

	window.initializeMenuPage = function () {
		var str = ""
		if (window.urlDefinition.TIPS_MODE == 2){
			str = 'Ver:' + ProductSetting.version
		} else {
			str = 'Ver.' + ProductSetting.version
		}
		if (ProductSetting.toneCentral.devMode) {
			str += ' (DEV)';
		}
		$('#app-version p').text(str);
	};

	window.assignMenuPageEvents = function () {
		$('.open-link-external-app').on(pointer.click, function (e) {
			e.preventDefault();
			var url = $(this).attr('href');
			if (url !== undefined) {
				$native.fs.exec(url);
			}
		});

		$('#old-version-of-bts-dialog-download-btn').on('click', function (e, v) {
			menuPageModelController.openDriverDownloadPage();
		});
		$('#device-not-found-dialog-driver-download-btn').on('click', function (e, v) {
			menuPageModelController.openDriverDownloadPage();
		});

		$('#owners-manual-btn').on('click', function (e, v) {
			menuPageModelController.openOwnerManualPage();
		});

		$('#all-data-backup-restore-from-file-btn').on(pointer.click, function (e) {
			e.preventDefault();
			menuPageModelController.restoreAllDataFromFile();
		});
		$('#all-data-backup-backup-to-file-btn').on(pointer.click, function (e) {
			e.preventDefault();
			menuPageModelController.backupAllDataToFile();
		});

		$('#app-version').on(pointer.click, function (e) {
			if (e.ctrlKey) {
				e.preventDefault();
				var v = ProductSetting.toneCentral.devMode;
				ProductSetting.toneCentral.devMode = (v !== true);

				var vMode = ProductSetting.developmentMode;
				ProductSetting.developmentMode = (vMode !== true);
				window.initializeMenuPage();
				//btsTipsController.isTipsReady = false;
				urlDefinition.fetchUrlDefinition(function () {});
			}
		});
	}
})();