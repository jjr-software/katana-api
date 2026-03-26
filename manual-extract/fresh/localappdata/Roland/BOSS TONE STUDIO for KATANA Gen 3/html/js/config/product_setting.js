//
//	product_setting.js
//
//	Copyright 2016 Roland Corporation. All rights reserved.
//

(function(window) {
	const modelUuid = '34ea9a27dd767be7'; /* 公開前のモデル表現 */

	var _ = {

		name:			'KATANA Gen3',
		version:		'1.1.0',
		build:			'26',
		copyright:		'Copyright 2024 Roland Corporation.',

		modelId:		'010507',
		deviceId:		'10',
		lengthOfAddr:	4,		/* length of dt1/rq1 address size */
		lengthOfSize:	4,		/* length of rq1 size */
		interval :		20,		/* to adjust interval for midi transmition before (msec) */
		timeout :		15,		/* RQ1 timeout (seconds) */
		waitStart:		0,		/* wait for DT1 start (msec) */
		waitStop:		0,		/* wait for DT1 end (msec) */
		waitVariable:	0,		/* wait for valiable length DT1(msec) */
		waitVariable0:	0,		/* wait for clearing valiable length DT1 (msec) */
		communicationLevel:	1,
		appName:		'BOSS TONE STUDIO for KATANA Gen 3',
		modelNameForAlb: "KATANA3",

		livesetFile: {
			formatRev:	'0000',
			extension:	'tsl',
		},

		backupFile: {
			formatRev:	'0000',
			extension:	'alb',
		},

		extension: {
			iconSetting: ['jpg', 'gif', 'png', 'bmp']
		},

		toneCentral: {
			devMode:      false,
			pub: {
				url:	'http://api.roland.com/app/btc/define/katana_gen_3.json',
				urlSubstitute: 'http://api.roland.com/app/btc/define/'+ modelUuid + '.json',
				models: ['KATANA MkII', 'KATANA Gen3']
			},
			dev: {
				url:	'http://dev-api.roland.com/app/btc/define/katana_gen_3.json',
				// url:	'http://dev-api.roland.com/app/btc/define/katana_gen_3_v110.json',
				models: ['KATANA MkII', 'KATANA Gen3']
			},
			tips_dev: {
				url: 'http://dev-api.roland.com/app/btc/define/tips/katana_gen_3/',
				models: ['KATANA MkII', 'KATANA Gen3']
			},
			tips_dev_local: {
				url: './document/tips/sample/',
				models: ['KATANA MkII', 'KATANA Gen3']
			},
			info: function() {
				if (this.devMode)	return this.dev;
				return this.pub;
			}
		},

		btx: {
			gear: 'gear/katana_gen_3',
			prod: {
				url:	'https://bosstoneexchange.com/',
				systemGearUrl: 'https://rcpsvc.roland.com/btc/system/gears'
			},
			dev: {
				url:	'https://test.bosstoneexchange.com/',
				systemGearUrl: 'https://test-rcpsvc.roland.com/btc/system/gears'
			},
			info: function() {
				if (_.developmentMode) {
					return {
						url: this.dev.url + this.gear,
						systemGearUrl: this.dev.systemGearUrl
					}
				}
				return {
					url: this.prod.url + this.gear,
					systemGearUrl: this.prod.systemGearUrl
				}
			}
		},

		targetSlug: 'katana_gen_3',

		editor: [
			{ name: 'TempPatch', config: new EditorSettingPatch },
			{ name: 'System', config: new EditorSettingSystem },
			{ name: 'PatchName', config: new EditorSettingPatchName },
			{ name: 'Status', config: new EditorSettingStatus },
			{ name: 'Setup', config: new EditorSettingSetup },
		],

		librarian: [
			{ name: 'UserPatch', config: new LibrarianSettingUserPatch },
		],

		manual: {
			en: '',
			ja: ''
		},

	};

	if (typeof addPropertyNotifyWhenChanged === 'function') {
		addPropertyNotifyWhenChanged(_, 'developmentMode', EVENT_SYSTEM.developModeChanged,
			EventTargetFactory.getEventTarget(EVENT_TARGET_NAME.SYSTEM));
			_.developmentMode = false;	/* FALSE WHEN RELEASE */
	}

	if (typeof addPropertyNotifyWhenChanged === 'function') {
		addPropertyNotifyWhenChanged(_, 'dialogOpeningCount', EVENT_SYSTEM.dialogOpeningCountChanged,
			EventTargetFactory.getEventTarget(EVENT_TARGET_NAME.SYSTEM));
		_.dialogOpeningCount = 0;
	}

	window.ProductSetting = _; /* export window object */

	var lang = (navigator.userLanguage || navigator.language).substr(0, 2);
	if (lang != 'ja') lang = 'en';

	window.readme = function() {
		var url = ProductSetting.manual[lang];
		if (url.lastIndexOf('http') < 0) {
			var path = decodeURIComponent(window.location.href.replace('file://', ''));
			if (path.match(/^\/[a-zA-Z]:\//)) { path = path.substr(1); }
			var str = path.substring(0, path.lastIndexOf('/') + 1) + url;
			url = str.replace(/\//g, $native.fs.separator());
		}
		$native.fs.exec(url);
	}

})(window);
