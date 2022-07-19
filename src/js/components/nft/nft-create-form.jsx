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
import ImageUploader from 'react-images-upload';
import {TRANSACTION_DATA_TYPE_NFT} from '../../../config';


class NftCreateForm extends Component {
    constructor(props) {
        super(props);
        const propsState = props.location.state || {};

        this.state = {
            sending                 : false,
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
            amount                  : propsState.amount || '',
            fee                     : '',
            image                   : undefined,
            destination_address_list: [],
            txid                    : propsState.txid,
            nft_src                 : propsState.src,
            nft_hash                : propsState.hash
        };

        this.send = this.send.bind(this);
    }

    componentWillUnmount() {
        clearTimeout(this.checkDNSHandler);
        if (this.state.sending) {
            API.interruptTransaction().then(_ => _);
        }
    }

    componentDidMount() {
        let amount_default = 10000;
        if (this.props.location?.state?.amount) {
            amount_default = this.props.location.state.amount;
        }
        this.amount.value = format.millix(amount_default, false);
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
            address_list: validate.required('address list', this.state.destination_address_list, error_list),
            amount      : validate.amount('amount', this.amount.value, error_list),
            fee         : validate.amount('fee', this.fee.value, error_list),
            // if this.state.txid is defined we should not verify this.state.image because it is not used. the image is not send back again to the server
            // this.state.txid is defined when the nft already exists and you want to sent it to someone else
            image       : !!this.state.txid || validate.required('image', this.state.image, error_list),
            dns         : validate.domain_name('verified sender', this.dns.value, error_list)
        };

        if (error_list.length === 0) {
            validate.verifySenderDomainName(transaction_param.dns, error_list).then(_ => {
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
        this.setState({
            dns_valid     : false,
            dns_validating: true
        });
        clearTimeout(this.checkDNSHandler);
        this.checkDNSHandler = setTimeout(() => {
            validate.verifySenderDomainName(e.target.value, this.props.wallet.address_key_identifier).then(result => {//verified sender domain name
                this.setState({
                    error_list    : result.error_list,
                    dns_valid     : result.valid,
                    dns_validating: false
                });
            });
        }, 500);
    }

    sendTransaction() {
        changeLoaderState(true);
        this.setState({
            sending: true
        });
        const transaction_output_payload = this.prepareTransactionOutputPayload();
        Transaction.sendTransaction(transaction_output_payload, true, !this.state.txid).then((data) => {
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

        if (this.props.config.TRANSACTION_FEE_DEFAULT !== undefined) {
            this.fee.value = format.millix(this.props.config.TRANSACTION_FEE_DEFAULT, false);
        }
    }

    prepareTransactionOutputPayload() {
        const transaction_output_attribute = {};

        if (!!this.state.dns) {
            transaction_output_attribute['dns'] = this.state.dns;
        }
        if (!!this.state.txid) {
            transaction_output_attribute['parent_transaction_id'] = this.state.txid;
        }

        return {
            transaction_output_attribute: transaction_output_attribute,
            transaction_data            : !this.state.txid ? this.state.image : {
                file_hash        : this.state.nft_hash,
                attribute_type_id: 'Adl87cz8kC190Nqc'
            },
            transaction_data_type       : TRANSACTION_DATA_TYPE_NFT,
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

        if (!value) {
            this.props.history.push('/nft-collection');
        }
    }

    addDestinationAddress(value) {
        const chips = this.state.destination_address_list.slice();
        if (chips.length !== 0) {
            return;
        }
        const address = value.split(/[\n ]/)[0];
        chips.push(address.trim());
        this.setState({destination_address_list: chips});
        this.chip_input_address.formControlRef.current.disabled    = true;
        this.chip_input_address.formControlRef.current.placeholder = '';
    };

    removeDestinationAddress(index) {
        const chips = this.state.destination_address_list.slice();
        chips.splice(index, 1);
        this.setState({destination_address_list: chips});
        this.chip_input_address.formControlRef.current.disabled    = false;
        this.chip_input_address.formControlRef.current.placeholder = 'recipient';
    };

    getFieldClassname(field) {
        return this.props.hidden_field_list?.includes(field) ? 'd-none' : '';
    }

    onChangeFile(file) {
        this.setState({image: file[0]});
    }

    render() {
        return (
            <>
                <ErrorList
                    error_list={this.state.error_list}/>
                <Row className={'message_compose'}>
                    <Col className={this.getFieldClassname('address')}>
                        <Form.Group className="form-group" role="form">
                            <label>recipient</label>
                            <ReactChipInput
                                ref={ref => {
                                    if (ref && !ref.state.focused && ref.formControlRef.current.value !== '') {
                                        this.addDestinationAddress(ref.formControlRef.current.value);
                                        ref.formControlRef.current.value = '';
                                    }
                                    if (!this.chip_input_address) {
                                        ref.formControlRef.current.placeholder = 'recipient';
                                        this.chip_input_address                = ref;
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
                            <Form.Group>
                                {this.state.nft_src ? (
                                    <div>
                                        <img src={this.state.nft_src} alt={'nft'}/>
                                    </div>) : (
                                     <ImageUploader
                                         withIcon={true}
                                         withPreview={true}
                                         withLabel={false}
                                         singleImage={true}
                                         buttonText="choose image"
                                         onChange={this.onChangeFile.bind(this)}
                                         fileContainerStyle={{backgroundColor: 'transparent'}}
                                         imgExtension={[
                                             '.jpg',
                                             '.jpeg',
                                             '.png'
                                         ]}
                                     />
                                 )}
                            </Form.Group>
                        </Col>
                        <Col className={this.getFieldClassname('amount')}>
                            <Form.Group className="form-group">
                                <label>value<HelpIconView help_item_name={'message_payment'}/></label>
                                <Form.Control type="text"
                                              placeholder="amount"
                                              pattern="[0-9]+([,][0-9]{1,2})?"
                                              ref={c => this.amount = c}
                                              onChange={validate.handleAmountInputChange.bind(this)}
                                              disabled={!!this.state.txid}/>
                            </Form.Group>
                        </Col>
                        <Col className={this.getFieldClassname('fee')}>
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
                                            icon={this.state.fee_input_locked ? 'lock' : 'lock-open'}/>
                                    </button>
                                </Col>
                            </Form.Group>
                        </Col>
                        <Col className={this.getFieldClassname('verified_sender')}>
                            <Form.Group className="form-group"
                                        as={Row}>
                                <label>verified creator (optional)<HelpIconView help_item_name={'verified_sender'}/></label>
                                <Col className={'input-group'}>
                                    <Form.Control type="text"
                                                  placeholder="domain name"
                                                  pattern="^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$"
                                                  ref={c => this.dns = c}
                                                  onChange={e => {
                                                      validate.handleDomainNameInputChange(e);
                                                      this.validateDns(e);
                                                  }}/>
                                    {this.state.dns_validating ?
                                     <button
                                         className="btn btn-outline-input-group-addon loader icon_only"
                                         type="button"
                                         disabled={true}>
                                         <div className="loader-spin"/>
                                     </button>
                                                               : ''}
                                </Col>
                                {this.state.dns_valid && this.dns?.value !== '' ?
                                 <div className={'text-success labeled verified_sender_mark'}>
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
                                body={this.state.address_list && (<div>
                                    <div>you are about to create an nft locking {format.millix(this.state.amount)} to</div>
                                    {this.state.address_list.length === 1 ?
                                     <div>{this.state.address_list[0].address_base}{this.state.address_list[0].address_version}{this.state.address_list[0].address_key_identifier}</div> :
                                     <div>{this.state.address_list.length} different address</div>}
                                    {text.get_confirmation_modal_question()}
                                </div>)}/>
                            <ModalView
                                show={this.state.modal_show_send_result}
                                size={'lg'}
                                on_close={() => this.changeModalShowSendResult(false)}
                                heading={'the nft was sent'}
                                body={this.state.modal_body_send_result}/>
                            <Form.Group as={Row}>
                                <Button
                                    variant="outline-primary"
                                    className={'btn_loader'}
                                    onClick={() => this.send()}
                                    disabled={this.state.canceling || this.state.dns_validating}>
                                    {this.state.sending ?
                                     <>
                                         <div className="loader-spin"/>
                                         {this.state.canceling ? 'canceling' : 'cancel transaction'}
                                     </> : <>{this.state.txid ? 'transfer' : 'create'}</>}
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
)(withRouter(NftCreateForm));
