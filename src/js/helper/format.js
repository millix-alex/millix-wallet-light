import moment from 'moment';
import store from '../redux/store';
import {MILLIX_VALUE_REFRESH_INTERVAL_MS} from '../../config';

export function millix(amount, append_name = true) {
    let result = amount.toLocaleString('en-US');
    if (append_name) {
        result += ' millix';
    }
    return result;
}

export function is_currency_price_available(){
   	
    let actualDate = new Date()
    let dateUpdated = store.getState().currency_price.date_updated
   
   if(!dateUpdated){
       return false
    }   

    let update = new Date(dateUpdated.getTime() + MILLIX_VALUE_REFRESH_INTERVAL_MS + 1000);

    if(update > actualDate){
        return true;
    }
    return false;
}

export function usd(amount, append_name = true) {
    let currency_prices = store.getState().currency_price;
    let millix_usd_value =  amount * currency_prices.usd_value;
    let result = millix_usd_value.toLocaleString('en-US');
    if (append_name) {
        result += ' usd';
    }
    return result;
}

export function fiat(amount) {
    return amount.toLocaleString('en-US');
}

export function number(number) {
    return number.toLocaleString('en-US');
}

export function date(timestamp) {
    let result = '';
    if (timestamp) {
        if (moment.utc(timestamp).format('YYYY') === '1970') {
            timestamp = timestamp * 1000;
        }

        result = moment.utc(timestamp).format('YYYY-MM-DD HH:mm:ss');
    }

    return result;
}

export function status_label(status) {
    return status ? 'active' : 'inactive';
}

export function bool_label(value) {
    return value ? 'yes' : 'no';
}

export function transaction_status_label(status) {
    const result_status = {
        1: 'pending hibernation',
        2: 'hibernated',
        3: 'invalid'
    };

    let label = '';
    if (status && Object.keys(result_status).includes(status.toString())) {
        label = result_status[status];
    }

    return label;
}
