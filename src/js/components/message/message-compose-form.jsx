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
import Transaction from '../../common/transaction';
import HelpIconView from '../utils/help-icon-view';
import {changeLoaderState} from '../loader';
import ReactChipInput from 'react-chip-input';


class MessageComposeForm extends Component {
    constructor(props) {
        super(props);
        const propsState    = props.location.state || {};
        const address_value = propsState.sent ? propsState.address_to : propsState.address_from;

        let message_body = '';
        if (propsState.message) {
            let reply_to_message_body = propsState.message;
            message_body              = `\n\n______________________________\nOn ${propsState.date} ${address_value} wrote:\n\n${reply_to_message_body}`;
        }

        this.state = {
            dns_valid               : false,
            dns_validating          : false,
            fee_input_locked        : true,
            error_list              : [],
            modal_show_confirmation : false,
            modal_show_send_result  : false,
            modal_body_send_result  : [],
            address_base            : '',
            address_version         : '',
            address_key_identifier  : '',
            amount                  : '',
            fee                     : '',
            destination_address_list: address_value ? [address_value] : [],
            subject                 : propsState.subject ? this.getReplySubjectText(propsState.subject) : '',
            message                 : message_body,
            txid                    : propsState.txid
        };

        this.send = this.send.bind(this);
    }

    componentWillUnmount() {
        clearTimeout(this.checkDNSHandler);
        if (this.state.sending) {
            API.interruptTransaction().then(_ => _);
        }
    }

    componentWillReceiveProps(nextProps, nextContext) {
        if (this.props.message && this.state.message === 'loading') {
            this.populateFormFromProps();
        }
    }

    componentDidMount() {
        this.amount.value = format.millix(10000, false);
        if (this.props.message) {
            this.populateFormFromProps();
        }
    }

    populateFormFromProps() {
        this.setState({
            message                 : this.props.message,
            subject                 : this.props.subject,
            destination_address_list: [this.props.destination_address]
        });
    }

    getReplySubjectText(subject) {
        if (subject.indexOf('re:') !== 0) {
            subject = `re: ${subject}`;
        }
        return subject;
    }

    verifySenderDomainName(domain_name, error_list = []) {
        if (!domain_name) {
            this.setState({dns_valid: true});
            return Promise.resolve(true);
        }

        const error = {
            name   : 'verified_sender_not_valid',
            message: `verified sender must be a valid domain name`
        };

        domain_name = validate.domain_name('domain_name', domain_name, []);
        if (domain_name === null) {
            error_list.push(error);

            return Promise.resolve(false);
        }
        else {
            return API.isDNSVerified(domain_name, this.props.wallet.address_key_identifier)
                      .then(data => {
                          if (!data.is_address_verified) {
                              error_list.push({
                                  name   : 'verified_sender_not_valid',
                                  message: <>domain name verification failed. click<HelpIconView help_item_name={'verified_sender'}/> for instructions</>
                              });
                          }

                          return data.is_address_verified;
                      })
                      .catch(() => {
                          error_list.push(error);

                          return false;
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
        const transaction_param = {
            addresses: validate.required('address', this.state.destination_address_list, error_list),
            amount   : validate.amount('amount', this.amount.value, error_list),
            fee      : validate.amount('fee', this.fee.value, error_list),
            subject  : this.subject.value,
            message  : this.message.value,
            dns      : validate.domain_name('verified sender', this.dns.value, error_list)
        };

        if (error_list.length === 0) {
            this.verifySenderDomainName(transaction_param.dns, error_list).then(_ => {
                if (error_list.length === 0) {
                    Transaction.verifyAddress(transaction_param).then((data) => {
                        this.setState(data);
                        this.changeModalShowConfirmation();
                    }).catch((error) => {
                        error_list.push(error);
                    });
                }
            });
        }

        this.setState({
            error_list: error_list
        });
    }

    validateDns(e) {
        const error_list = [];
        validate.handleInputChangeDNSString(e);
        this.setState({
            dns_valid     : false,
            dns_validating: true,
            error_list    : error_list
        });
        clearTimeout(this.checkDNSHandler);
        this.checkDNSHandler = setTimeout(() => {
            this.verifySenderDomainName(e.target.value, error_list).then((result) => {
                this.setState({
                    error_list    : error_list,
                    dns_valid     : result,
                    dns_validating: false
                });
            }).catch(() => {
                this.setState({
                    error_list    : error_list,
                    dns_validating: false,
                    dns_valid     : false
                });
            });
        }, 500);
    }

    sendTransaction() {
        changeLoaderState(true);
        this.setState({
            sending: true
        });
        let transaction_output_payload = this.prepareTransactionOutputPayload();
        Transaction.sendTransaction(transaction_output_payload, true).then((data) => {
            this.clearSendForm();
            this.changeModalShowConfirmation(false);
            this.changeModalShowSendResult();
            this.setState(data);
            changeLoaderState(false);
        }).catch((error) => {
            this.changeModalShowConfirmation(false);
            this.setState(error);
            changeLoaderState(false);
        });
    }

    clearSendForm() {
        this.destination_address_list = [];
        this.amount.value             = '';
        this.subject.value            = '';
        this.message.value            = '';

        if (this.props.config.TRANSACTION_FEE_DEFAULT !== undefined) {
            this.fee.value = format.millix(this.props.config.TRANSACTION_FEE_DEFAULT, false);
        }
    }

    prepareTransactionOutputPayload() {
        const transactionOutputAttribute = {};

        if (!!this.state.dns) {
            transactionOutputAttribute['dns'] = this.state.dns;
        }
        if (!!this.state.txid) {
            transactionOutputAttribute['parent_transaction_id'] = this.state.txid;
        }

        return {
            transaction_output_attribute: transactionOutputAttribute,
            transaction_data            : {
                subject: this.state.subject,
                message: this.state.message
            },
            transaction_output_list     : this.state.address_list.map(address => ({
                address_base          : address.address_base,
                address_version       : address.address_version,
                address_key_identifier: address.address_key_identifier,
                amount                : this.state.amount
            })),
            transaction_output_fee      : {
                fee_type: 'transaction_fee_default',
                amount  : this.state.fee
            }
        };
    }

    cancelSendTransaction() {
        this.setState({
            canceling: false,
            sending  : false
        });
        this.changeModalShowConfirmation(false);
    }

    changeModalShowConfirmation(value = true) {
        this.setState({
            modal_show_confirmation: value
        });
    }

    changeModalShowSendResult(value = true) {
        this.setState({
            modal_show_send_result: value
        });
    }

    render() {
        return (
            <>
                <ErrorList
                    error_list={this.state.error_list}/>
                <Row>
                    <Col>
                        <Form.Group className="form-group" role="form">
                            <label>recipients</label>
                            <ReactChipInput
                                ref={ref => {
                                    if (ref && !ref.state.focused && ref.formControlRef.current.value !== '') {
                                        this.addDestinationAddress(ref.formControlRef.current.value);
                                        ref.formControlRef.current.value = '';
                                    }
                                    if (!this.chipInputAddress) {
                                        ref.formControlRef.current.placeholder = 'recipients';
                                        this.chipInputAddress                  = ref;
                                    }
                                }}
                                classes="chip_input form-control"
                                chips={this.state.destination_address_list}
                                onSubmit={value => this.addDestinationAddress(value)}
                                onRemove={index => this.removeDestinationAddress(index)}
                            />
                        </Form.Group>
                    </Col>
                    <Form>
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
                                              autoFocus
                                              ref={c => {
                                                  this.message = c;
                                              }}/>
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group className="form-group">
                                <label>payment<HelpIconView help_item_name={'message_payment'}/></label>
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
                                                  disabled={this.state.fee_input_locked}/>
                                    <button
                                        className="btn btn-outline-input-group-addon icon_only"
                                        type="button"
                                        onClick={() => this.setState({fee_input_locked: !this.state.fee_input_locked})}>
                                        <FontAwesomeIcon
                                            icon={this.state.fee_input_locked ? 'lock' : 'lock-open'}
                                            size="sm"/>
                                    </button>
                                </Col>
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group className="form-group"
                                        as={Row}>
                                <label>verified sender (optional)<HelpIconView help_item_name={'verified_sender'}/></label>
                                <Col className={'input-group'}>
                                    <Form.Control type="text"
                                                  placeholder="domain name"
                                                  pattern="^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$"
                                                  ref={c => this.dns = c}
                                                  onChange={e => this.validateDns(e)}/>
                                    {this.state.dns_validating ?
                                     <button
                                         className="btn btn-outline-input-group-addon icon_only"
                                         type="button"
                                         style={{opacity: '1!important'}}
                                         disabled={true}>
                                         <div className="loader-spin"/>
                                     </button>
                                                               : ''}
                                </Col>
                                {this.state.dns_valid && this.dns?.value !== '' ?
                                 <div className={'text-success labeled form-group'}>
                                     <FontAwesomeIcon
                                         icon={'check-circle'}
                                         size="1x"/>
                                     <span>{this.dns.value}</span>
                                 </div>
                                                                                : ''}

                            </Form.Group>
                        </Col>
                        <Col
                            className={'d-flex justify-content-center'}>
                            <ModalView
                                show={this.state.modal_show_confirmation}
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
                                show={this.state.modal_show_send_result}
                                size={'lg'}
                                on_close={() => this.changeModalShowSendResult(false)}
                                heading={'message has been sent'}
                                body={this.state.modal_body_send_result}/>
                            <Form.Group as={Row}>
                                <Button
                                    variant="outline-primary"
                                    onClick={() => this.send()}
                                    disabled={this.state.canceling || this.state.dns_validating}>
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
            </>
        );
    }
}


export default connect(
    state => ({
        wallet: state.wallet,
        config: state.config
    })
)(withRouter(MessageComposeForm));
