import _ from 'lodash';
import store from '../redux/store';


class Translation {
    constructor() {
        this.language_name_list       = new Intl.DisplayNames(['en'], {//remove multiples
            type: 'language'
        });
        this.language_list            = require('../../ui_language.json');
        this.current_language_guid    = '';
        this.current_translation_data = [];
    }

    getPhrase(phrase_guid, replace_data = []) {
        const phrase_data = this.getCurrentTranslationList().find(element => element.phrase_guid === phrase_guid && element.language_guid === this.getCurrentLanguageGuid());
        let phrase        = phrase_data?.phrase;

        if (!_.isEmpty(replace_data)) {
            _(replace_data).forEach((key, value) => {
                let replace_key = key === 0 ? '[key]' : `[key${value}]`;
                phrase.replace(replace_key, key);
            });
        }

        return phrase;
    }

    getCurrentTranslationList() {
        if (this.current_translation_data.length === 0 || this.current_language_guid !== store.getState().config.ACTIVE_LANGUAGE_GUID) {
            let translation_list          = require('../../ui_phrase.json');//todo: there should be name of corresponding lang file, not added to avoid error
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
                let language_short_code    = navigator.language.split('-')[0];//remove lang code
                this.current_language_guid = this.language_list.find(element => element.language_name === this.language_name_list.of(language_short_code).toLowerCase()).language_guid;
            }
        }

        return this.current_language_guid;
    }
}


const _Translation = new Translation();
export default _Translation;
