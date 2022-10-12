import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Button} from 'react-bootstrap';
import ModalView from '../utils/modal-view';
import API from '../../api';
import MnemonicView from '../auth/mnemonic-view';
import Translation from '../../common/translation';


class MnemonicModalView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modalShowMnemonic: false,
            mnemonic         : []
        };
    }

    showMnemonicPhraseModal() {
        API.getMnemonicPhrase().then(phrase => {
            this.setState({
                mnemonic: phrase.mnemonic_phrase.split(' ')
            });
            this.changeModalShowMnemonic(true);
        });
    }

    changeModalShowMnemonic(value = true) {
        this.setState({
            modalShowMnemonic: value
        });
    }

    render() {
        return <ModalView show={this.state.modalShowMnemonic}
                          size={'xl'}
                          heading={Translation.getPhrase('ee9c80bf2')}
                          on_close={() => this.changeModalShowMnemonic(false)}
                          body={
                              <MnemonicView mnemonic={this.state.mnemonic}/>
                          }/>;
    }
}


export default connect(
    state => ({
        wallet: state.wallet
    }))(withRouter(MnemonicModalView));
