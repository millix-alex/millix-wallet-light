import * as format from './format';

export function required(field_name, value, error_list) {
    if (typeof value === 'string') {
        value = value.trim();
    }
    if (!value) {
        error_list.push({
            name   : get_error_name('required', field_name),
            message: `${field_name} is required`
        });
    }

    return value;
}

export function amount(field_name, value, error_list, allow_zero = false) {
    return integerPositive(field_name, value, error_list, allow_zero);
}

export function integerPositive(field_name, value, error_list, allow_zero = false) {
    let value_escaped = value.toString().trim();
    value_escaped     = parseInt(value_escaped.replace(/\D/g, ''));

    if (!allow_zero && value_escaped <= 0) {
        error_list.push({
            name   : get_error_name('amount_is_lt_zero', field_name),
            message: `${field_name} must be bigger than 0`
        });
    }
    else if (allow_zero && value_escaped < 0) {
        error_list.push({
            name   : get_error_name('amount_is_lte_zero', field_name),
            message: `${field_name} must be bigger than or equal to 0`
        });
    }
    else if (format.millix(value_escaped, false) !== value) {
        error_list.push({
            name   : get_error_name('amount_format_is_wrong', field_name),
            message: `${field_name} must be a valid amount`
        });

    }

    return value_escaped;
}

export function ipAddress(field_name, value, error_list) {
    let ipAddressArray = value.split('.');
    if (ipAddressArray.length !== 4) {
        error_list.push({
            name   : get_error_name('amount_format_is_wrong', field_name),
            message: `${field_name} must be a valid ip address`
        });
    }
    ipAddressArray.forEach(element => {
        if (isNaN(Number(element)) || element > 255 || element < 0 || element === '') {
            error_list.push({
                name   : get_error_name('amount_format_is_wrong', field_name),
                message: `${field_name} must be a valid ip address`
            });
            return false;
        }
    });
}

export function string(field_name, value, error_list, length) {
    let is_alphabetical_string = /^[a-zA-Z0-9]+$/.test(value);
    if (typeof value !== 'string' || !is_alphabetical_string) {
        error_list.push({
            name   : get_error_name('amount_format_is_wrong', field_name),
            message: `${field_name} must be alphanumeric string`
        });
    }
    if (value.length > length) {
        error_list.push({
            name   : get_error_name('amount_format_is_wrong', field_name),
            message: `${field_name} max length is ${length} `
        });
    }
}

export function json(field_name, value, error_list) {
    let validJson = false;
    try {
        validJson = JSON.parse(value);
    }
    catch (e) {
        error_list.push({
            name   : 'validationError',
            message: `${field_name} nodes should contain valid json`
        });

        return value;
    }

    return validJson;
}


function get_error_name(prefix, field_name) {
    return `${prefix}_${field_name.replaceAll(' ', '_')}`;
}

export function handleInputChangeInteger(e, allow_negative = true, formatter = 'number') {
    if (e.target.value.length === 0) {
        return;
    }

    let cursorStart = e.target.selectionStart,
        cursorEnd   = e.target.selectionEnd;
    let amount      = e.target.value.replace(/[,.]/g, '');
    if (!allow_negative) {
        amount = amount.replace(/-/g, '');
    }

    let offset = 0;
    if ((amount.length - 1) % 3 === 0) {
        offset = 1;
    }

    amount = parseInt(amount);

    let value = 0;
    if (!isNaN(amount)) {
        if (formatter === 'millix') {
            value = format.millix(amount, false);
        }
        else {
            value = format.number(amount);
        }
    }

    e.target.value = value;
    e.target.setSelectionRange(cursorStart + offset, cursorEnd + offset);
}


export function handleAmountInputChange(e) {
    handleInputChangeInteger(e, false, 'millix');
}
