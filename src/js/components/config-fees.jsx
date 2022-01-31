import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Col, Form} from 'react-bootstrap';
import {addWalletAddressVersion, removeWalletAddressVersion, walletUpdateConfig} from '../redux/actions/index';
import _ from 'lodash';

class ConfigFees extends Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    setConfig(data) {
        _.each(_.keys(data), key => {
            switch (this.props.configType[key]) {
                case 'number':
                    data[key] = JSON.parse(data[key]);
            }
        });

        return this.props.walletUpdateConfig(data);
    }

    removeFromConfigList(configName, value) {
        _.pull(this.props.config[configName], value);
        this.setConfig({[configName]: this.props.config[configName]});
        this.setConfigToState();
    }

    render() {
        return <div>
            <Form>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>fees</div>
                    <div className={'panel-body'}>
                        <Col>
                            <Form.Group className="form-group">
                                <label>transaction proxy
                                    fees</label>
                                <Form.Control
                                    type="text"
                                    placeholder=""
                                    ref={(c) => this._fee_proxy_fee = c}
                                    onChange={() => {
                                        this.setConfig({TRANSACTION_FEE_PROXY: this._fee_proxy_fee.value});
                                    }}
                                    value={this.props.config.TRANSACTION_FEE_PROXY}/>
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group className="form-group">
                                <label>transaction
                                    fees</label>
                                <Form.Control
                                    type="text"
                                    placeholder=""
                                    ref={(c) => this._fee_transaction_default = c}
                                    onChange={() => {
                                        this.setConfig({TRANSACTION_FEE_DEFAULT: this._fee_transaction_default.value});
                                    }}
                                    value={this.props.config.TRANSACTION_FEE_DEFAULT}/>
                            </Form.Group>
                        </Col>

                        <Col>
                            <Form.Group className="form-group">
                                <label>network fee
                                    (%)</label>
                                <Form.Control
                                    type="text"
                                    placeholder=""
                                    ref={(c) => this._fee_transaction_network = c}
                                    onChange={() => {
                                        this.setConfig({TRANSACTION_FEE_NETWORK: parseFloat(this._fee_transaction_network.value) / 100});
                                    }}
                                    value={this.props.config.TRANSACTION_FEE_NETWORK * 100}/>
                            </Form.Group>
                        </Col>
                    </div>
                </div>
            </Form>
        </div>;
    }
}


export default connect(
    state => ({
        config    : state.config,
        configType: state.configType,
        wallet    : state.wallet
    }),
    {
        walletUpdateConfig,
        addWalletAddressVersion,
        removeWalletAddressVersion
    })(withRouter(ConfigFees));
