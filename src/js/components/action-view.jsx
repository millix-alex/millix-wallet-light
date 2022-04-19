import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import OutputAggregateView from './action/output-aggregate-view';
import ValidationResetView from './action/validation-reset-view';
import MnemonicPhraseView from './action/mnemonic-phrase-view';


class ActionView extends Component {
    render() {
        return (
            <>
                <ValidationResetView/>
                <MnemonicPhraseView/>
                <OutputAggregateView/>
            </>
        );
    }
}


export default withRouter(ActionView);
