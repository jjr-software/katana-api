$(function() {
	
	// define URL
	urlDefinition.fetchUrlDefinition(function() {
		userLogManager.post();
		statusLogManager.post(0);
		util.checkAppVersion();
	});

	// initialize DOM
	initializeChain();
	initializeOtherDOM();
	initializeEffect();
	initializePatch();
	initializeMenuPage();
	initializeIconSetting();
	modelDOMController.initialize();

	assignMenuPageEvents();
	assignOtherEvents();
	assignPatchEvents();
	assignEffectEvents();
	
	//btc
	// tcLoadYoutubeApi();
	// tcLoadSCApi();

	/* btx */
	window.btxCommands.setViewPosition();
	window.btxCommands.loadBtx();

	// librarian
	assignCreateLivesetDialog();
	assignOverwritePatchDialog();
	initLibrarian();
	
	// start observing midi event
	$event.start();

	// init MIDI
	startMIDIObservation();
	assignMIDIEvent();
	
	/** terms of use */
	initializeTou();
	window.tou.updateTouView().then((isAgreed) => {
		$('#top').show();
		if (isAgreed) {
			// start indicator
			// $native.app.control('indicator start');
			// start MIDI connection
			midiConnectionController.startInitSetting();
		} else {
			popup_open(TERMS_OF_USE.ID.VIEW.slice(1));
		}
		// stop indicator
		$native.app.control('indicator stop');
	});

});
