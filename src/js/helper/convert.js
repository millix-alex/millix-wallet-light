import store from '../redux/store';
import {fiat as format_fiat} from './format';
import {CURRENCY_PAIR_SUMMARY_REFRESH_INTERVAL_MS} from '../../config';

export function fiat(amount, append_ticker = true) {
    let currency_pair_summary = store.getState().currency_pair_summary;
    let fiat_value            = format_fiat(amount * currency_pair_summary.price);
    if (append_ticker) {
        fiat_value += ' ' + currency_pair_summary.ticker;
    }

    return fiat_value;
}

export function is_currency_pair_summary_available() {
    let actualDate  = new Date();
    let dateUpdated = store.getState().currency_pair_summary.date_updated;

    let result = false;
    if (dateUpdated) {
        let update = new Date(dateUpdated.getTime() + CURRENCY_PAIR_SUMMARY_REFRESH_INTERVAL_MS + 1000);

        if (update > actualDate) {
            result = true;
        }
    }

    return result;
}
