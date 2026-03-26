(function() {
    window.initializeTou = async function () {
        $(TERMS_OF_USE.ID.ACCEPT_BTN).on(pointer.click, function (e) {
            e.preventDefault();
            window.tou.isAgreed = true;
            // window.tou.updateTouView();
            popup_close(TERMS_OF_USE.ID.VIEW.slice(1));
            midiConnectionController.startInitSetting();
        });
    }

    window.tou = {
        get isAgreed() {
            const storage = util.readStorage();
            const agreedTouISO8601Str = storage[TERMS_OF_USE.KEY_AgreedTOU_ISO8601Str];
            if (agreedTouISO8601Str === undefined) return false;

            agreedDate = new Date(agreedTouISO8601Str);
            return (agreedDate >= TERMS_OF_USE.UPDATE_DATE);
        },
        set isAgreed(val) {
            if (val == true) {
                util.writeStorage(TERMS_OF_USE.KEY_AgreedTOU_ISO8601Str, TERMS_OF_USE.UPDATE_DATE.toISOString());
            }
        },

        updateTouView: async () => {
            const touTxt = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', './js/businesslogic/terms_of_use/app_terms_of_use.txt');
                xhr.addEventListener('load', (e) => resolve(xhr.responseText));
                xhr.send();
            });
            $(TERMS_OF_USE.ID.TXT).html(touTxt.replace(/\n/g, '<br>').replace(/KATANA:GO/g, ProductSetting.name)); /* 文字列全体の改行文字をHTTP改行タグに変換 */

            return window.tou.isAgreed;
            // (window.tou.isAgreed) ? $(TERMS_OF_USE.ID.VIEW).hide() : $(TERMS_OF_USE.ID.VIEW).show();
            // (window.tou.isAgreed) ? popup_close(TERMS_OF_USE.ID.VIEW.slice(1)) : popup_open(TERMS_OF_USE.ID.VIEW.slice(1));
        },
    };
})();