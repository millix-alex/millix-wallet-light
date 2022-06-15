import React from 'react';
import HelpIconView from '../components/utils/help-icon-view';
import * as format from './format';
import Translation from '../common/translation';

export function get_confirmation_modal_question() {
    return <div>{Translation.getPhrase('7f91be78d')}</div>;
}

export function get_ui_error(api_message) {
    let error = '';
    let api_error_name = 'unknown';

    if (typeof (api_message) === 'object') {
        let result_error = api_message.error;
        if (typeof (result_error?.error) !== 'undefined') {
            api_error_name = result_error.error;
        }
        else {
            api_error_name = result_error;
        }

        switch (api_error_name) {
            case 'transaction_input_max_error':
                error = <>
                    {Translation.getPhrase('2bc667914', {
                        help_icon        : <HelpIconView help_item_name={'transaction_max_input_number'}/>,
                        action_link      : <a className={''} onClick={() => this.props.history.push('/actions')}>here</a>,
                        millix_amount_max: format.millix(api_message.data.amount_max)
                    })}
                </>;
                break;
            case 'insufficient_balance':
                error = <>{Translation.getPhrase('0a97488e4', {balance_stable: format.millix(api_message.data.balance_stable)})}</>;
                break;
            case 'transaction_send_interrupt':
                error = <>{Translation.getPhrase('a8e96f47c')}</>;
                break;
            case 'proxy_not_found':
                error = <>{Translation.getPhrase('279141684')}</>;
                break;
            case 'transaction_proxy_rejected':
                error = <>{Translation.getPhrase('2ecd6cff3')}</>;
                break;
            case 'aggregation_not_required':
                error = <>{Translation.getPhrase('9b335fb11')}</>;
                break;
            case 'aggregation_not_possible':
                error = <>{Translation.getPhrase('61b3e2502')}</>;
                break;
            default:
                error = <>{Translation.getPhrase('8db383be9')} ({api_message?.error?.error || api_message?.error || api_message || Translation.getPhrase('77f7e59cd')})</>;
                break;
        }
    }
    else if (typeof (api_message) === 'string') {
        const match = /unexpected generic api error: \((?<message>.*)\)/.exec(api_message);
        error       = `${Translation.getPhrase('e408955c6')} (${match.groups.message})`;
    }

    return error;
}
