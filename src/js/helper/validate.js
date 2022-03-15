import * as format from './format';

export function required(field_name, value, error_list) {
    if(typeof value === "string"){
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
    let value_escaped = value.trim();
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

export function integer(field_name, value, error_list) {
    let value_escaped = value.trim();
    value_escaped     = parseInt(value_escaped.replace(/\D/g, ''));

    if (!Number.isInteger(value_escaped)) {
        error_list.push({
            name   : get_error_name('amount_is_not_integer', field_name),
            message: `${field_name} must be a number`
        });
    }

    return value_escaped;
}

export function positiveInteger(field_name, value, error_list, allow_zero = false) {
    let value_escaped;
    if (typeof value === 'string') {
        value_escaped = value.trim();
        value_escaped = parseInt(value_escaped.replace(/\D/g, ''));
    } else {
        value_escaped = value;
    }
    if (!Number.isInteger(value_escaped)) {
        error_list.push({
            name   : get_error_name('amount_is_not_integer', field_name),
            message: `${field_name} must be a number`
        });
        return false;
    }
    else if (!allow_zero && value_escaped <= 0) {
        error_list.push({
            name   : get_error_name('amount_is_lt_zero', field_name),
            message: `${field_name} must be bigger than 0`
        });
        return false;
    }
    else if (allow_zero && value_escaped < 0) {
        error_list.push({
            name   : get_error_name('amount_is_lte_zero', field_name),
            message: `${field_name} must be bigger than or equal to 0`
        });
        return false;
    }
}

export function ipAddress(field_name, value, error_list) {
    let ipAddressArray = value.split('.');
    if(ipAddressArray.length !== 4 ){
        error_list.push({
            name   : get_error_name('amount_format_is_wrong', field_name),
            message: `${field_name} must be a valid ip address`
        });
    }
    ipAddressArray.forEach(element => {
        if(element > 255 || element < 0 || element === ''){
            error_list.push({
                name   : get_error_name('amount_format_is_wrong', field_name),
                message: `${field_name} must be a valid ip address`
            });
            return false;
        }
    });
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

export function handleAmountInputChange(e) {
    if (e.target.value.length === 0) {
        return;
    }

    let cursorStart = e.target.selectionStart,
        cursorEnd   = e.target.selectionEnd;
    let amount      = e.target.value.replace(/[,.]/g, '');
    let offset      = 0;
    if ((amount.length - 1) % 3 === 0) {
        offset = 1;
    }

    amount         = parseInt(amount);
    e.target.value = !isNaN(amount) ? format.millix(amount, false) : 0;
    console.log(e.target.value)

    e.target.setSelectionRange(cursorStart + offset, cursorEnd + offset);
}

export function handleAmountInputChangeValue(inputAmount) {
    if (inputAmount === 0 || inputAmount === undefined) {
        return;
    }
    inputAmount = inputAmount.toString();
    let amount      = inputAmount.replace(/[,.]/g, '');
    amount         = parseInt(amount);
    return !isNaN(amount) ? format.millix(amount, false) : 0;
}
