import _ from 'lodash';
import store from '../redux/store';


class Translation {
    constructor() {
        this.language_name_list       = new Intl.DisplayNames(['en'], {
            type: 'language'
        });
        this.language_list            = require('../../ui_language.json');
        this.current_language_guid    = '';
        this.current_translation_data = [];
        this.new_language_list_loaded = false;
    }

    getPhrase(phrase_guid, replace_data = {}) {
        const phrase_data = this.getCurrentTranslationList().find(element => element.phrase_guid === phrase_guid && element.language_guid === this.getCurrentLanguageGuid());
        let phrase        = phrase_data?.phrase;
        phrase            = phrase.split('***').join('').replace(/&quot;/g, '\\"').replace(/\\/g, '');

        if (!_.isEmpty(replace_data)) {
            _.forOwn(replace_data, function(value, key) {
                let replace_key = `[${key}]`;

                let result_phrase = phrase.split(replace_key);
                phrase            = <>{result_phrase.shift()}{value}{result_phrase.join('')}</>;
            });
        }
        else {
            phrase = <>{phrase}</>;
        }

        return phrase;
    }

    getCurrentTranslationList() {
        if (this.current_translation_data.length === 0 || !this.new_language_list_loaded) {
            this.new_language_list_loaded = true;
            let translation_list          = require('../../wallet_ui_page_phrase_list.json');
            this.current_translation_data = translation_list.filter(element => element.language_guid === this.getCurrentLanguageGuid());
        }

        return this.current_translation_data;
    }

    getCurrentLanguageGuid() {
        if (this.current_language_guid === '') {
            if (store.getState().config.ACTIVE_LANGUAGE_GUID) {
                this.current_language_guid = store.getState().config.ACTIVE_LANGUAGE_GUID;
            }
            else {
                let language_short_code    = navigator.language.split('-')[0];
                this.current_language_guid = this.language_list.find(element => element.language_name === this.language_name_list.of(language_short_code).toLowerCase()).language_guid;
            }
        }

        return this.current_language_guid;
    }

    setCurrentLanguageGuid(language_guid) {
        this.new_language_list_loaded = false;
        this.current_language_guid    = language_guid;
    }

    replaceJSX = function(str, find, replace) {
        let parts  = str.split(find);
        let result = [];
        for (let i = 0, result; i < parts.length; i++) {
            result.push(parts[i]);
            result.push(replace);
        }
        return result;
    };
}


const _Translation = new Translation();
export default _Translation;
