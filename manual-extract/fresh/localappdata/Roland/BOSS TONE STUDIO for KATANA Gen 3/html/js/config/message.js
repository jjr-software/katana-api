//
//	message.js
//
//	Copyright 2016 Roland Corporation. All rights reserved.
//

function Message_en() {
	this.terminologies = {
		Patch:	'Tone setting',	// 'Patch'
		patch:	'tone setting',	// 'patch'
	};
}
function Message_ja() {
	Message_en.call(this);
}
Message_ja.prototype = new Message_en();

language = 'en';
messageSet = {
	en: new Message_en,
	ja: new Message_ja,
};

(function(window) {
	language = (navigator.userLanguage || navigator.language).substr(0, 2);
	if (language != 'ja') language = 'en';
	window.MSG = function(id) { return messageSet[language][id]; }
})(window);

/* ProductSetting.nameがプログラムの評価用途に使われたり表示文字列に使われたりしている。
   リリース直前にプログラムの挙動を変えたくないので、表示文字列で使用している箇所を以下で置き換える。 */
const expressionModelName = "KATANA Gen 3";

/* for ENGLISH */
Message_en.prototype.IDM_CHECK_BOX_MESSAGE = "Do not show this screen next time"
Message_en.prototype.IDM_OK					= "OK"
Message_en.prototype.IDM_CANCEL				= "CANCEL"
Message_en.prototype.IDM_CLOSE				= "CLOSE"
Message_en.prototype.IDM_LANGUAGE			= "Language"
Message_en.prototype.IDM_LANGUAGE_EN		= "English"
Message_en.prototype.IDM_LANGUAGE_JP		= "Japanese"
Message_en.prototype.IDM_MANUAL				= "Owner's Manual"
Message_en.prototype.IDM_DEVICE_SETTING		= "Device Setting"
Message_en.prototype.IDM_VERSION			= "Version"

Message_en.prototype.IDM_INVALID_FILE		= "Invalid file data."
Message_en.prototype.IDM_READ_TIMEOUT		= "Unable to read data. Make sure the connection with MIDI devices."

/* for JAPANESE */
Message_ja.prototype.IDM_CLOSE				= "閉じる"
Message_ja.prototype.IDM_LANGUAGE			= "言語設定"
Message_ja.prototype.IDM_LANGUAGE_EN		= "英語 (English)"
Message_ja.prototype.IDM_LANGUAGE_JP		= "日本語"
Message_ja.prototype.IDM_MANUAL				= "操作マニュアル"
Message_ja.prototype.IDM_DEVICE_SETTING		= "デバイス設定"
Message_ja.prototype.IDM_VERSION			= "バージョン"

Message_ja.prototype.IDM_INVALID_FILE		= "無効なファイル形式です。"
Message_ja.prototype.IDM_READ_TIMEOUT		= "データの読み込みに失敗しました。MIDI機器との接続を確認してください。"

/* Model name */
Message_en.prototype.IDM_MODEL_NAME = ProductSetting.name
Message_en.prototype.IDM_APP_NAME = ProductSetting.appName

/* License */
Message_en.prototype.IDM_LICENSE_COPYRIGHT_ROLAND = ProductSetting.copyright + " All rights reserved."
// [ Third Party Licenses
Message_en.prototype.IDM_LICENSE = license_div + "<br><hr> Build:" + ProductSetting.build + "<br>";
// ]

/* Error */
Message_en.prototype.IDM_ERROR_MIDI_DEVICE_CONNECTION_TITLE = "MIDI DEVICE CONNECTION ERROR"
Message_en.prototype.IDM_ERROR_MIDI_DEVICE_CONNECTION_MESSAGE = "Try again."
Message_en.prototype.IDM_ERROR_WRONG_DEVICE_TITLE = "WRONG DEVICE"
Message_en.prototype.IDM_ERROR_WRONG_DEVICE_MESSAGE = "Check the pairing device and connecting device again."
Message_en.prototype.IDM_ERROR_DISCONNECTED_TITLE = "DISCONNECTED"
Message_en.prototype.IDM_ERROR_DISCONNECTED_MESSAGE = "Check the pairing device and connecting device again."
Message_en.prototype.IDM_ERROR_COMMUNICATION_TITLE = "COMMUNICATION ERROR"
Message_en.prototype.IDM_ERROR_COMMUNICATION_MESSAGE = "Try again."
Message_en.prototype.IDM_ERROR_COMMUNICATION_MESSAGE_1 = "Writing of the following patches failed. Try again."
Message_en.prototype.IDM_ERROR_FILE_TITLE = "FILE ERROR"
Message_en.prototype.IDM_ERROR_FILE_MESSAGE = "Operation failed."
Message_en.prototype.IDM_ERROR_INTERNET_TITLE = "NO INTERNET ACCESS"
Message_en.prototype.IDM_ERROR_INTERNET_MESSAGE = "Check the network connection."
Message_en.prototype.IDM_ERROR_LIBRARY_TITLE = "LIBRARY FULL"
Message_en.prototype.IDM_ERROR_LIBRARY_MESSAGE = "The liveset is full."

/* specific to PC version */
Message_en.prototype.IDM_ERROR_DEVICE_CONNECT_SELECT_TITLE = "Choose a device to connect with."
Message_en.prototype.IDM_ERROR_DEVICE_NOT_FOUND_TITLE = "DEVICE NOT FOUND"
Message_en.prototype.IDM_ERROR_DEVICE_NOT_FOUND_MESSAGE_1 = "Please confirm that the USB driver is installed and the USB cable between the " + expressionModelName + " and the computer is connected, then click the \"Refresh\" button."
Message_en.prototype.IDM_ERROR_DEVICE_NOT_FOUND_MESSAGE_2 = "Driver software must be installed on the computer to complete the connection to the " + expressionModelName + "."
Message_en.prototype.IDM_ERROR_DEVICE_NOT_FOUND_MESSAGE_3 = "When the [OFFLINE MODE] button is pressed, the editor can be tested even when the " + expressionModelName + " is not connected to a computer. LIBRARIAN and TONE EXCHANGE are available, however, " + window.MSG('terminologies').patch +" data can not be saved."

/* Error with Model Name */
Message_en.prototype.IDM_ERROR_UNSUPPORTED_TITLE = "UNSUPPORTED DATA"
Message_en.prototype.IDM_ERROR_UNSUPPORTED_MESSAGE = "The file is not supported on " + expressionModelName + "."
Message_en.prototype.IDM_ERROR_OLD_BTS_TITLE = "OLD VERSION OF " + ProductSetting.appName.toUpperCase()
Message_en.prototype.IDM_ERROR_OLD_BTS_MESSAGE = "You are using an older version of " + ProductSetting.appName.toUpperCase() + ".<br>Update to the latest version."
Message_en.prototype.IDM_ERROR_OLD_FIRM_TITLE = "OLD VERSION OF " + expressionModelName.toUpperCase()
Message_en.prototype.IDM_ERROR_OLD_FIRM_MESSAGE = "You are using an older version of " + expressionModelName + ".<br>Update to the latest version."
Message_en.prototype.IDM_ERROR_OFFLINE_MODE_TITLE = "OFFLINE MODE"
Message_en.prototype.IDM_ERROR_OFFLINE_MODE_MESSAGE = expressionModelName + " is not connected to a computer.<br>LIBRARIAN and TONE EXCHANGE are available, however, " + window.MSG('terminologies').patch + " data can't be saved."

Message_en.prototype.IDM_FULL_VERSION_OF_BTX_IS_UNDER_CONSTRUCTION_T = "INFORMATION"
Message_en.prototype.IDM_FULL_VERSION_OF_BTX_IS_UNDER_CONSTRUCTION_M = "You can access the BOSS TONE EXCHANGE at the following URL.<br><a href='https://bosstoneexchange.com/'  class='open-link-external-app'>https://bosstoneexchange.com/</a><br>Currently, only livesets created by BOSS can be downloaded within the BOSS TONE STUDIO app.<br>Support for downloading and sharing user content will be updated.";
Message_en.prototype.IDM_LEADING_TO_UPDATE_FOR_BTX_FULLVERSION_T = "INFORMATION"
Message_en.prototype.IDM_LEADING_TO_UPDATE_FOR_BTX_FULLVERSION_M     = "Available to use full functionality of BOSS TONE EXCHANGE including upload or download liveset directly via BOSS TONE STUDIO app."
Message_en.prototype.IDM_ERROR_EXPORTING_TO_BTX_COMMON_SCREEN_TITLE = "ERROR EXPORTING TO BTX"
Message_en.prototype.IDM_ERROR_EXPORTING_TO_BTX_COMMON_SCREEN_MESSAGE = "An error occurred during the export process to BTX. "

/* System */
Message_en.prototype.IDM_OWNERS_MANUAL = "OWNER'S MANUAL"
Message_en.prototype.IDM_MANUAL_DOWNLOAD_PAGE = "Manual Download Page"
Message_en.prototype.IDM_VERSION = "VERSION:"
Message_en.prototype.IDM_SOFTWARE_LICENSE = "SOFTWARE LICENSE:"
Message_en.prototype.IDM_CONFIRM_EXIT = "CONFIRM EXIT"

/* Patch Write/Clear */
Message_en.prototype.IDM_WRITE = "WRITE"
Message_en.prototype.IDM_CLEAR = "CLEAR"
Message_en.prototype.IDM_PATCH = "PATCH"
Message_en.prototype.IDM_PATCH_NAME = "PATCH NAME"
Message_en.prototype.IDM_CLEAR_MSG = "The temporary tone setting will be initialized."

/* Librarian */
Message_en.prototype.IDM_CREATE_LIVESET = "CREATE LIVESET"
Message_en.prototype.IDM_SELECT_LIVESET = "SELECT LIVESET"
Message_en.prototype.IDM_DELETE_LIVESET = "DELETE LIVESET"
Message_en.prototype.IDM_LIVESET_NAME = "LIVESET NAME"
Message_en.prototype.IDM_DELETE_LIVESET_MSG = "The Liveset will be deleted."
Message_en.prototype.IDM_DELETE_PATCH_MSG = "The " + window.MSG('terminologies').Patch + " will be deleted."
Message_en.prototype.IDM_OVERWRITE_MSG_1 = "Overwrite " + window.MSG('terminologies').patch + "?"
Message_en.prototype.IDM_OVERWRITE_MSG_2 = "Do not display this message again."
Message_en.prototype.IDM_DELETE_PATCH = "DELETE PATCH"
Message_en.prototype.IDM_EXPORT = "EXPORT"
Message_en.prototype.IDM_FILE = "FILE"
Message_en.prototype.IDM_IMPORT_FROM_PRODUCT = "IMPORT FROM " + expressionModelName
Message_en.prototype.IDM_EXPORT_TO_PRODUCT = "EXPORT TO " + expressionModelName
Message_en.prototype.IDM_IMPORT_TO_LIBRARIAN = "IMPORT TO LIBRARIAN"
Message_en.prototype.IDM_EXPORT_FROM_LIBRARIAN = "EXPORT FROM LIBRARIAN"
Message_en.prototype.IDM_EXPORT_TO_FILE = "EXPORT TO FILE"
Message_en.prototype.IDM_ALL_BACKUP = "All Backup"

/* Edit */
Message_en.prototype.IDM_AMPLIFIER = "AMPLIFIER"
Message_en.prototype.IDM_EQUALIZER = "EQUALIZER"
Message_en.prototype.IDM_EFFECTS = "EFFECTS"
Message_en.prototype.IDM_EDIT = "EDIT"
Message_en.prototype.IDM_ADD = "ADD"
Message_en.prototype.IDM_SYSTEM = "SYSTEM"
Message_en.prototype.IDM_EFFECTS_SETTING = "EFFECTS SETTING"
Message_en.prototype.IDM_BOOSTER = "BOOSTER"
Message_en.prototype.IDM_MOD = "MOD"
Message_en.prototype.IDM_DELAY = "DELAY"
Message_en.prototype.IDM_FX = "FX"
Message_en.prototype.IDM_MODE = "MODE"
Message_en.prototype.IDM_DELAY2 = "DELAY2"
Message_en.prototype.IDM_REVERB = "REVERB"
Message_en.prototype.IDM_TAP = "TAP"
Message_en.prototype.IDM_EQ = "EQ"
Message_en.prototype.IDM_NS = "NS"

