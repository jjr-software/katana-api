/**
 * [概要]
 * 主にアドレスに関わる定数を定義
 *
 * [使用箇所]
 * 全体
 */

(function() {
  window.ADDRESS_CONST = Object.freeze({
    get IDENTITY_REQUEST() {
      return STX + '7E7F' + '0601' + EOX;
    },
    // Device Inquiryの応答チェックでは後半部分は無視するため、先頭部分のみを定義
    get PART_OF_IDENTITY_REPLY() {
      var modelId = ProductSetting.modelId;
      return STX + '7E' + ProductSetting.deviceId + '0602' + ROLAND + modelId.slice(-2) + hex2((modelId.length)/2 + 2);
    },
    ADDRESS: Object.freeze({
      CURRENT_PATCH_NAME: 0x20000000,
    }),
    COMMAND: Object.freeze({
      CURRENT_PATCH_NUMBER: 0x00000000,
      EDITOR_COMMUNICATION_LEVEL: 0x7f000000,
      EDITOR_COMMUNICATION_MODE: 0x7f000001,
      RUNNING_MODE: 0x7f000002,
      EDITOR_COMMUNICATION_REVISION: 0x7f000003,
      PATCH_WRITE: 0x7F000104,
      // PATCH_TEMP_CLEAR: 0x7F010003,
      PATCH_CLEAR: 0x7F00010E,
      PATCH_SELECT: 0x7F000100,
      GAFC_TYPE: 0x7F010202,
      CMDID_PREVIEW_MUTE: 0x7F010109,
      CMDID_EXPORT: 0x7F01010A,
    }),
    BID: Object.freeze({
      // TEMPORARY_COMMON: 'Temporary%PatchName',
      TEMPORARY_COMMON: 'PATCH%COM',
    }),
    RUNNING_MODE: Object.freeze({
      PLAY: 0x00,
    }),
    EDITOR_COMMUNICATION_MODE: Object.freeze({
      OFF: 0x00,
      ON: 0x01
    }),
    IS_RQ1_ACCEPT: Object.freeze({
      FORBID: 0x00,
      PERMIT: 0x01
    })
  });
})();
