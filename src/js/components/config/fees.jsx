import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Button, Col, Form} from 'react-bootstrap';
import {walletUpdateConfig} from '../../redux/actions';
import * as validate from '../../helper/validate';
import ModalView from '../utils/modal-view';
import ErrorList from '../utils/error-list-view';
import * as format from '../../helper/format';


class Fees extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sending            : false,
            error_list         : {},
            modalShowSendResult: false,
            reload             : false
        };
    }

    componentDidMount() {
        this.loadConfigToState();
    }

    loadConfigToState() {
        this.transaction_fee_proxy_input.value   = format.millix(this.props.config.TRANSACTION_FEE_PROXY, false);
        this.transaction_fee_default_input.value = format.millix(this.props.config.TRANSACTION_FEE_DEFAULT, false);
    }

    changeModalShowSendResult(value = true) {
        this.setState({
            modalShowSendResult: value
        });
        if (value === false) {
            this.loadConfigToState();
        }
    }

    save() {
        this.setState({
            sending   : true,
            error_list: []
        });

        const error_list = [];
        let fee_config   = {
            TRANSACTION_FEE_PROXY  : validate.integerPositive('transaction fee proxy', this.transaction_fee_proxy_input.value, error_list),
            TRANSACTION_FEE_DEFAULT: validate.integerPositive('transaction fee default', this.transaction_fee_default_input.value, error_list)
        };
        if (error_list.length === 0) {
            try {
                this.props.walletUpdateConfig(fee_config).then(() => {
                    this.setState({
                        sending: false
                    });
                    this.changeModalShowSendResult();
                });
            }
            catch (e) {
                error_list.push({
                    name   : 'save_error',
                    message: 'error while saving occurred, please try again later'
                });
            }
        }

        if (error_list.length > 0) {
            this.setState({
                sending   : false,
                error_list: error_list
            });
        }
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
                                <label>transaction proxy fee</label>
                                <Form.Control
                                    type="text"
                                    placeholder=""
                                    ref={(c) => this.transaction_fee_proxy_input = c}
                                    onChange={(e) => {
                                        return validate.handleInputChangeInteger(e, false);
                                    }}
                                />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group className="form-group">
                                <label>transaction fee</label>
                                <Form.Control
                                    type="text"
                                    placeholder=""
                                    ref={(c) => this.transaction_fee_default_input = c}
                                    onChange={(e) => {
                                        return validate.handleInputChangeInteger(e, false);
                                    }}
                                />
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group
                                className={'d-flex justify-content-center'}>
                                <Button
                                    variant="outline-primary"
                                    onClick={() => this.save()}
                                    disabled={this.state.sending}>
                                    {this.state.sending ?
                                     <>
                                         {'saving'}
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
        config: state.config
    }),
    {
        walletUpdateConfig
    })(withRouter(Fees));
