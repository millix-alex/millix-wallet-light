import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Button, Col, Form, Row} from 'react-bootstrap';
import ModalView from '../utils/modal-view';
import ErrorList from '../utils/error-list-view';
import {millix, number} from '../../helper/format';
import * as text from '../../helper/text';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import API from '../../api';


class OutputAggregateView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sending                             : false,
            canceling                           : false,
            disableAggregateButton              : true,
            sendAggregateTransactionError       : false,
            sendAggregateTransactionErrorMessage: null,
            errorList                           : [],
            transactionOutputCount              : undefined,
            transactionMaxAmount                : undefined,
            transactionOutputToAggregate        : 0,
            modalShowAggregate                  : false,
            modalShowAggregateResult            : false,
            modalAggregateBodySendResult        : []
        };

        this.minTransactionOutputToAggregate = 2;
        this.maxTransactionOutputToAggregate = 120;
    }

    componentDidMount() {
        this.updateAggregationStats();
    }

    updateAggregationStats() {
        API.getUnspentOutputStat()
           .then(data => {
               if (data.api_status === 'fail') {
                   return Promise.reject(data);
               }

               let transactionOutputToAggregate = Math.min(data.transaction_output_count, this.maxTransactionOutputToAggregate);

               this.setState({
                   transactionOutputCount: data.transaction_output_count,
                   transactionMaxAmount  : data.transaction_max_amount,
                   disableAggregateButton: data.transaction_output_count < this.minTransactionOutputToAggregate,
                   transactionOutputToAggregate
               });
           })
           .catch(() => {
               this.setState({
                   errorList: [
                       {
                           name   : 'sendTransactionError',
                           message: 'cannot get information about the unspent deposits from the api'
                       }
                   ]
               });
           });
    }

    aggregateUnspentOutputs() {
        this.setState({sending: true});

        API.sendAggregationTransaction()
           .then(data => {
               if (data.api_status === 'fail') {
                   this.changeAggregateModalShow(false);
                   return Promise.reject(data);
               }
               return data;
           })
           .then(data => {
               const transaction = data.transaction.find(item => {
                   return item.version.indexOf('0a') !== -1;
               });

               const modalAggregateBodySendResult = <div>
                   <div>
                       transaction id
                   </div>
                   <div>
                       {transaction.transaction_id}
                   </div>
               </div>;

               this.setState({
                   sending                     : false,
                   feeInputLocked              : true,
                   transactionOutputCount      : undefined,
                   transactionMaxAmount        : undefined,
                   disableAggregateButton      : true,
                   transactionOutputToAggregate: 0,
                   modalAggregateBodySendResult
               }, () => setTimeout(() => this.updateAggregationStats(), 5000));
               this.changeAggregateModalShow(false);
               this.changeModalShowAggregateResult();
           }).catch((e) => {
            let sendTransactionErrorMessage;
            let errorList = [];

            if (e !== 'validation_error') {
                if (e && e.api_message) {
                    sendTransactionErrorMessage = text.get_ui_error(e.api_message);
                }
                else {
                    sendTransactionErrorMessage = `your transaction could not be sent: (${e?.api_message?.error.error || e?.api_message?.error || e?.message || e?.api_message || e || 'undefined behaviour'})`;
                }

                errorList.push({
                    name   : 'sendTransactionError',
                    message: sendTransactionErrorMessage
                });
            }
            this.setState({
                errorList,
                sending                     : false,
                canceling                   : false,
                transactionOutputCount      : undefined,
                transactionMaxAmount        : undefined,
                disableAggregateButton      : true,
                transactionOutputToAggregate: 0
            }, () => setTimeout(() => this.updateAggregationStats(), 5000));
            this.changeAggregateModalShow(false);
        });
    }

    doAggregation() {
        let errorList = [];
        if (this.state.sending) {
            API.interruptTransaction().then(_ => _);
            this.setState({canceling: true});
            return;
        }

        this.setState({
            sendAggregateTransactionError       : false,
            sendAggregateTransactionErrorMessage: null
        });

        this.setState({errorList});

        this.changeAggregateModalShow();
    }

    changeAggregateModalShow(value = true) {
        this.setState({
            modalShowAggregate: value
        });
    }

    cancelSendAggregateTransaction() {
        this.setState({
            canceling: false,
            sending  : false
        });
        this.changeAggregateModalShow(false);
    }

    changeModalShowAggregateResult(value = true) {
        this.setState({
            modalShowAggregateResult: value
        });
    }

    render() {
        return <div>
            <div className={'panel panel-filled'}>
                <div className={'panel-heading bordered'}>unspent aggregation
                </div>
                <div className={'panel-body'}>
                    <div>
                        your wallet has {this.state.transactionOutputCount === undefined ? <div style={{display: 'inline-block'}}
                                                                                                className="loader-spin-xs"/> : number(this.state.transactionOutputCount)} unspent
                        deposits. millix uses the smallest unspent deposits first, and there is a limit of 128 unspent deposits used to fund a
                        single payment. based on the value of your unspent deposits you can send a maximum
                        of {this.state.transactionMaxAmount === undefined ? <div style={{display: 'inline-block'}}
                                                                                 className="loader-spin-xs"/> : millix(this.state.transactionMaxAmount)} in
                        a single payment. aggregating your balance consumes the small unspent deposits by sending a payment to yourself.
                    </div>
                    <div>
                        each time you click aggregate you will see these numbers become more optimized. continue to click the aggregate button until
                        the maximum millix you can send in a single payment meets your needs. your balance and pending balance will change while
                        aggregation is processing.
                    </div>
                    <Row>
                        <Col
                            className={'d-flex justify-content-center'}>
                            <ModalView
                                show={this.state.modalShowAggregate}
                                size={'lg'}
                                heading={'aggregation confirmation'}
                                on_accept={() => this.aggregateUnspentOutputs()}
                                on_close={() => this.cancelSendAggregateTransaction()}
                                body={<div>
                                    <div>you are about to
                                        aggregate {this.state.transactionOutputToAggregate} unspent
                                        deposits.
                                    </div>
                                    {text.get_confirmation_modal_question()}
                                </div>}/>

                            <ModalView
                                show={this.state.modalShowAggregateResult}
                                size={'lg'}
                                on_close={() => this.changeModalShowAggregateResult(false)}
                                heading={'the transaction has been sent'}
                                body={this.state.modalAggregateBodySendResult}/>
                            <Form.Group as={Row}>
                                <Button
                                    variant="outline-primary"
                                    onClick={() => this.doAggregation()}
                                    disabled={this.state.canceling || this.state.disableAggregateButton}>
                                    {this.state.sending ?
                                     <>
                                         <div style={{
                                             float      : 'left',
                                             marginRight: 10
                                         }}
                                              className="loader-spin"/>
                                         {this.state.canceling ? 'canceling' : 'cancel transaction'}
                                     </> : <><FontAwesomeIcon
                                            icon="code-merge"
                                            size="1x"/>aggregate</>}
                                </Button>
                            </Form.Group>
                        </Col>
                    </Row>
                    {this.state.errorList.length > 0 && <Row className={'mt-3'}>
                        <Col
                            className={'d-flex justify-content-center'}>
                            <ErrorList
                                error_list={this.state.errorList}/>
                        </Col>
                    </Row>}
                </div>
            </div>
        </div>;
    }
}


export default connect(
    state => ({
        wallet: state.wallet
    }))(withRouter(OutputAggregateView));
