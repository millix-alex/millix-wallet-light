export function millix(amount, append_name = true) {
    let result = amount.toLocaleString('en-US');
    if (append_name) {
        result += ' millix';
    }

    return result;
}

export function fiat(amount) {
    return amount.toLocaleString('en-US');
}

export function number(number) {
    return number.toLocaleString('en-US');
}

