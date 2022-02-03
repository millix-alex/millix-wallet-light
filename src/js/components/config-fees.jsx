import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Button, Col, Form} from 'react-bootstrap';
import {addWalletAddressVersion, removeWalletAddressVersion, walletUpdateConfig} from '../redux/actions/index';
import _ from 'lodash';
import * as validate from '../helper/validate';
import ModalView from './utils/modal-view';
import ErrorList from './utils/error-list-view';

class ConfigFees extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sending            : false,
            fees_config_data   : {},
            error_list         : {},
            modalShowSendResult: false,
            reload             : false
        };
    }

    componentDidMount() {
        this.loadConfigToState();
    }

    loadConfigToState() {
        this.setState({
            fees_config_data: {
                TRANSACTION_FEE_PROXY  : this.props.config.TRANSACTION_FEE_PROXY,
                TRANSACTION_FEE_DEFAULT: this.props.config.TRANSACTION_FEE_DEFAULT
            }
        });
    }

    changeModalShowSendResult(value = true) {
        this.setState({
            modalShowSendResult: value
        });
        if (value === false) {
            this.refreshPage();
        }
    }

    refreshPage = () => {
        this.loadConfigToState();
    };

    setFeesConfig(data) {
        for (let key in data) {
            this.state.fees_config_data[key] = data[key];
        }

        this.setState({
            fees_config_data: this.state.fees_config_data
        });
    }

    send() {
        this.setState({
            sending   : true,
            error_list: []
        });

        if (!this.isValidFeesData()) {
            return;
        }

        try {
            this.props.walletUpdateConfig(this.state.fees_config_data).then(() => {
                this.setState({
                    sending: false
                });
                this.changeModalShowSendResult();
            });
        }
        catch (e) {
            this.state.error_list.push({
                name   : 'saveError',
                message: 'error while saving occurred, please try again later'
            });
            this.setState({
                error_list: this.state.error_list
            });
            return Promise.reject('server_error');
        }
    }

    isValidFeesData() {
        let data       = this.state.fees_config_data;
        let error_list = [];
        let valid = {isValid: true};

        data.TRANSACTION_FEE_PROXY = validate.required('transaction proxy fees', data.TRANSACTION_FEE_PROXY, error_list);
        if(data.TRANSACTION_FEE_PROXY) {
            validate.positiveInteger('min connections in', data.TRANSACTION_FEE_PROXY, error_list);
        }
        data.TRANSACTION_FEE_DEFAULT = validate.required('transaction fees', data.TRANSACTION_FEE_DEFAULT, error_list);
        if(data.TRANSACTION_FEE_DEFAULT) {
            validate.positiveInteger('transaction fees', data.TRANSACTION_FEE_DEFAULT, error_list);
        }

        if (error_list.length > 0) {
            this.setState({
                error_list: error_list,
                sending: false
            });
            return false;
        }

        return true;
    }

    render() {
        return <div>
            <ModalView
                show={this.state.modalShowSendResult}
                size={'lg'}
                on_close={() => this.changeModalShowSendResult(false)}
                heading={'success'}
                body={
                    <div className={'text-center'}>
                        <div>
                            successfully saved
                        </div>
                    </div>
                }/>
            <Form>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>fees</div>
                    <div className={'panel-body'}>
                        <ErrorList
                            error_list={this.state.error_list}/>
                        <Col>
                            <Form.Group className="form-group">
                                <label>transaction proxy
                                    fees</label>
                                <Form.Control
                                    type="text"
                                    placeholder=""
                                    ref={(c) => this._fee_proxy_fee = c}
                                    onChange={(e) => {
                                        this.setFeesConfig({TRANSACTION_FEE_PROXY: this._fee_proxy_fee.value});
                                    }}
                                    value={validate.handleAmountInputChangeValue(this.state.fees_config_data.TRANSACTION_FEE_PROXY)}/>
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
                                        this.setFeesConfig({TRANSACTION_FEE_DEFAULT: this._fee_transaction_default.value});
                                    }}
                                    value={validate.handleAmountInputChangeValue(this.state.fees_config_data.TRANSACTION_FEE_DEFAULT)}/>
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group
                                className={'d-flex justify-content-center'}>
                                <Button
                                    variant="outline-primary"
                                    onClick={() => this.send()}
                                    disabled={this.state.sending}>
                                    {this.state.sending ?
                                     <>
                                         <div style={{
                                             fontSize: '6px',
                                             float   : 'left'
                                         }}
                                              className="loader-spin"/>
                                         {'continue'}
                                     </> : <>continue</>}
                                </Button>
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
