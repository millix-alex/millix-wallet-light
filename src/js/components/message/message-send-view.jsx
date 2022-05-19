import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Button, Col, Form, Row} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import * as format from '../../helper/format';
import * as validate from '../../helper/validate';
import ModalView from './../utils/modal-view';
import * as text from '../../helper/text';
import API from '../../api';
import ErrorList from './../utils/error-list-view';

class MessageNewView extends Component {
    constructor(props) {
        super(props);
        const propsState = props.location.state || {};
        this.state       = {
            dnsValidated          : false,
            feeInputLocked        : true,
            error_list            : [],
            modalShow             : false,
            modalShowSendResult   : false,
            modalBodySendResult   : [],
            address_base          : '',
            address_version       : '',
            address_key_identifier: '',
            amount                : '',
            fee                   : '',
            destinationAddress    : propsState.address || '',
            subject               : propsState.subject ? `re: ${propsState.subject}` : '',
            message               : propsState.message ? `\n______________________________\n${propsState.message}` : '',
            txid                  : propsState.txid
        };

        this.send = this.send.bind(this);
    }

    componentWillUnmount() {
        if (this.state.sending) {
            API.interruptTransaction().then(_ => _);
        }
    }

    verifyDNS() {
        const dns = validate.dns('dns', this.dns.value, []);
        if (dns === null) {
            this.setState({dnsValidated: false});
        }
        else {
            API.isDNSVerified(dns, this.props.wallet.address_key_identifier)
               .then(data => {
                   this.setState({dnsValidated: data.is_address_verified});
               })
               .catch(() => {
                   this.setState({dnsValidated: false});
               });
        }
    }

    send() {
        let error_list = [];
        if (this.state.sending) {
            API.interruptTransaction().then(_ => _);
            this.setState({
                canceling: true
            });
            return;
        }

        this.setState({
            sendTransactionError       : false,
            sendTransactionErrorMessage: null
        });

        const address = validate.required('address', this.destinationAddress.value, error_list);
        const subject = validate.required('subject', this.subject.value, error_list);
        const message = validate.required('message', this.message.value, error_list);
        const amount  = validate.amount('amount', this.amount.value, error_list);
        const fee     = validate.amount('fee', this.fee.value, error_list);
        const dns     = validate.dns('dns', this.dns.value, error_list);

        this.setState({
            error_list: error_list
        });

        if (error_list.length === 0) {
            API.verifyAddress(address)
               .then(data => {
                   if (!data.is_valid) {
                       error_list.push({
                           name   : 'address_invalid',
                           message: 'valid address is required'
                       });
                       this.setState({error_list: error_list});
                   }
                   else {
                       const {
                                 address_base          : destinationAddress,
                                 address_key_identifier: destinationAddressIdentifier,
                                 address_version       : destinationAddressVersion
                             } = data;

                       this.setState({
                           error_list            : [],
                           address_base          : destinationAddress,
                           address_version       : destinationAddressVersion,
                           address_key_identifier: destinationAddressIdentifier,
                           subject               : subject,
                           message               : message,
                           amount                : amount,
                           dns                   : dns,
                           fee                   : fee
                       });

                       this.changeModalShow();
                   }
               });
        }
    }

    sendTransaction() {
        this.setState({
            sending: true
        });

        const transactionOutputAttribute = {};

        if (!!this.state.dns) {
            transactionOutputAttribute['dns'] = this.state.dns;
        }
        if(!!this.state.txid){
            transactionOutputAttribute['parent_transaction_id'] = this.state.txid;
        }

        const amount = this.state.amount;
        API.sendTransactionWithData({
            transaction_output_attribute: transactionOutputAttribute,
            transaction_data            : {
                subject: this.state.subject,
                message: this.state.message
            },
            transaction_output_list     : [
                {
                    address_base          : this.state.address_base,
                    address_version       : this.state.address_version,
                    address_key_identifier: this.state.address_key_identifier,
                    amount
                }
            ],
            transaction_output_fee      : {
                fee_type: 'transaction_fee_default',
                amount  : this.state.fee
            }
        }).then(data => {
            if (data.api_status === 'fail') {
                this.changeModalShow(false);

                return Promise.reject(data);
            }

            return data;
        }).then(data => {
            this.destinationAddress.value = '';
            this.amount.value             = '';
            this.subject.value            = '';
            this.message.value            = '';

            if (this.props.config.TRANSACTION_FEE_DEFAULT !== undefined) {
                this.fee.value = format.millix(this.props.config.TRANSACTION_FEE_DEFAULT, false);
            }

            const transaction = data.transaction.find(item => {
                return item.version.indexOf('0a') !== -1;
            });

            const modalBodySendResult = <div>
                <div>
                    transaction id
                </div>
                <div>
                    {transaction.transaction_id}
                </div>
            </div>;

            this.setState({
                amount             : '',
                subject            : '',
                message            : '',
                destinationAddress : '',
                sending            : false,
                feeInputLocked     : true,
                modalBodySendResult: modalBodySendResult
            });
            this.changeModalShow(false);
            this.changeModalShowSendResult();
        }).catch((e) => {
            let sendTransactionErrorMessage;
            let error_list = [];
            if (e !== 'validation_error') {
                if (e && e.api_message) {
                    sendTransactionErrorMessage = text.get_ui_error(e.api_message);
                }
                else {
                    sendTransactionErrorMessage = `your transaction could not be sent: (${e?.api_message?.error.error || e?.api_message?.error || e?.message || e?.api_message || e || 'undefined behaviour'})`;
                }

                error_list.push({
                    name   : 'sendTransactionError',
                    message: sendTransactionErrorMessage
                });
            }
            this.setState({
                error_list: error_list,
                sending   : false,
                canceling : false
            });
            this.changeModalShow(false);
        });
    }

    cancelSendTransaction() {
        this.setState({
            canceling: false,
            sending  : false
        });
        this.changeModalShow(false);
    }

    changeModalShow(value = true) {
        this.setState({
            modalShow: value
        });
    }

    changeModalShowSendResult(value = true) {
        this.setState({
            modalShowSendResult: value
        });
    }

    render() {
        return (
            <div>
                <Row>
                    <Col md={12}>
                        <div className={'panel panel-filled'}>
                            <div className={'panel-heading bordered'}>send message</div>
                            <div className={'panel-body'}>
                                <p>
                                    send an encrypted message to any tangled browser user. the message will be stored on your device and the recipients device.
                                    to allow the message to reach the recipient, the message is stored on the millix network for up to 90 days. only you and the
                                    recipient can read your messages.
                                </p>
                                <ErrorList
                                    error_list={this.state.error_list}/>
                                <Row>
                                    <Form>
                                        <Col
                                            className={'d-flex justify-content-center'}>
                                            {this.state.sendTransactionError && (
                                                <div className={'form-error'}>
                                                    <span>{this.state.sendTransactionErrorMessage}</span>
                                                </div>)}
                                        </Col>
                                        <Col>
                                            <Form.Group className="form-group">
                                                <label>to</label>
                                                <Form.Control type="text"
                                                              value={this.state.destinationAddress}
                                                              onChange={c => this.setState({destinationAddress: c.target.value})}
                                                              placeholder="address"
                                                              ref={c => this.destinationAddress = c}/>
                                            </Form.Group>
                                        </Col>
                                        <Col>
                                            <Form.Group className="form-group">
                                                <label>subject</label>
                                                <Form.Control type="text"
                                                              value={this.state.subject}
                                                              onChange={c => this.setState({subject: c.target.value})}
                                                              placeholder="subject"
                                                              ref={c => this.subject = c}/>
                                            </Form.Group>
                                        </Col>
                                        <Col>
                                            <Form.Group className="form-group">
                                                <label>message</label>
                                                <Form.Control as="textarea" rows={10}
                                                              value={this.state.message}
                                                              onChange={c => this.setState({message: c.target.value})}
                                                              placeholder="message"
                                                              ref={c => this.message = c}/>
                                            </Form.Group>
                                        </Col>
                                        <Col>
                                            <Form.Group className="form-group">
                                                <label>payment</label>
                                                <Form.Control type="text"
                                                              placeholder="amount"
                                                              pattern="[0-9]+([,][0-9]{1,2})?"
                                                              ref={c => this.amount = c}
                                                              onChange={validate.handleAmountInputChange.bind(this)}/>
                                            </Form.Group>
                                        </Col>
                                        <Col>
                                            <Form.Group className="form-group"
                                                        as={Row}>
                                                <label>fee</label>
                                                <Col className={'input-group'}>
                                                    <Form.Control type="text"
                                                                  placeholder="fee"
                                                                  pattern="[0-9]+([,][0-9]{1,2})?"
                                                                  ref={c => {
                                                                      this.fee = c;
                                                                      if (this.fee && !this.feeInitialized && this.props.config.TRANSACTION_FEE_DEFAULT !== undefined) {
                                                                          this.feeInitialized = true;
                                                                          this.fee.value      = format.millix(this.props.config.TRANSACTION_FEE_DEFAULT, false);
                                                                      }
                                                                  }}
                                                                  onChange={validate.handleAmountInputChange.bind(this)}
                                                                  disabled={this.state.feeInputLocked}/>
                                                    <button
                                                        className="btn btn-outline-input-group-addon icon_only"
                                                        type="button"
                                                        onClick={() => this.setState({feeInputLocked: !this.state.feeInputLocked})}>
                                                        <FontAwesomeIcon
                                                            icon={this.state.feeInputLocked ? 'lock' : 'lock-open'}
                                                            size="sm"/>
                                                    </button>
                                                </Col>
                                            </Form.Group>
                                        </Col>
                                        <Col>
                                            <Form.Group className="form-group"
                                                        as={Row}>
                                                <label>verified sender</label>
                                                <Col className={'input-group'}>
                                                    <Form.Control type="text"
                                                                  placeholder="dns"
                                                                  pattern="^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$"
                                                                  ref={c => this.dns = c}
                                                                  onChange={e => {
                                                                      validate.handleInputChangeDNSString(e);
                                                                      this.setState({dnsValidated: undefined});
                                                                      clearTimeout(this.checkDNSHandler);
                                                                      this.checkDNSHandler = setTimeout(() => this.verifyDNS(), 800);
                                                                  }}/>
                                                    <button
                                                        className="btn btn-outline-input-group-addon icon_only"
                                                        type="button"
                                                        style={{opacity: '1!important'}}
                                                        disabled={true}>
                                                        {this.state.dnsValidated === undefined ? <div style={{
                                                                                                   margin: 0,
                                                                                                   width : '0.9rem',
                                                                                                   height: '0.9rem'
                                                                                               }} className="loader-spin"/> :
                                                         <FontAwesomeIcon
                                                             color={this.state.dnsValidated ? '#42a5f5' : '#a9a9a9'}
                                                             icon={this.state.dnsValidated ? 'check-circle' : 'question-circle'}
                                                             size="sm"/>}
                                                    </button>
                                                </Col>
                                                <div>
                                                    anyone with a domain name can be a verified sender. this allows the recipient of your message to trust your
                                                    identity. <a href="#">click to lear more</a>
                                                </div>
                                            </Form.Group>
                                        </Col>
                                        <Col
                                            className={'d-flex justify-content-center'}>
                                            <ModalView
                                                show={this.state.modalShow}
                                                size={'lg'}
                                                heading={'send confirmation'}
                                                on_accept={() => this.sendTransaction()}
                                                on_close={() => this.cancelSendTransaction()}
                                                body={<div>
                                                    <div>you are about to send a message and {format.millix(this.state.amount)} to</div>
                                                    <div>{this.state.address_base}{this.state.address_version}{this.state.address_key_identifier}</div>
                                                    {text.get_confirmation_modal_question()}
                                                </div>}/>

                                            <ModalView
                                                show={this.state.modalShowSendResult}
                                                size={'lg'}
                                                on_close={() => this.changeModalShowSendResult(false)}
                                                heading={'payment has been sent'}
                                                body={this.state.modalBodySendResult}/>
                                            <Form.Group as={Row}>
                                                <Button
                                                    variant="outline-primary"
                                                    onClick={() => this.send()}
                                                    disabled={this.state.canceling}>
                                                    {this.state.sending ?
                                                     <>
                                                         <div style={{
                                                             float      : 'left',
                                                             marginRight: 10
                                                         }}
                                                              className="loader-spin"/>
                                                         {this.state.canceling ? 'canceling' : 'cancel transaction'}
                                                     </> : <>send</>}
                                                </Button>
                                            </Form.Group>
                                        </Col>
                                    </Form>
                                </Row>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}


export default connect(
    state => ({
        wallet: state.wallet,
        config: state.config
    })
)(withRouter(MessageNewView));
