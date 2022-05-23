import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Row, Spinner} from 'react-bootstrap';
import API from '../../api';
import * as format from '../../helper/format';
import DatatableView from './../utils/datatable-view';
import _ from 'lodash';
import DatatableActionButtonView from './../utils/datatable-action-button-view';


class MessageSentView extends Component {
    constructor(props) {
        super(props);
        this.datatable_reload_interval = undefined;
        this.state                     = {
            message_list              : [],
            datatable_reload_timestamp: '',
            datatable_loading         : false
        };
    }

    componentDidMount() {
        this.reloadDatatable();
        this.datatable_reload_interval = setInterval(() => this.reloadDatatable(), 60000);
    }

    componentWillUnmount() {
        clearInterval(this.datatable_reload_interval);
    }

    reloadDatatable() {
        this.setState({
            datatable_loading: true
        });

        return API.listTransactionWithDataSent(this.props.wallet.address_key_identifier).then(data => {
            const message_list = [];
            data.forEach((transaction) => {
                transaction?.transaction_output_attribute.forEach(attribute => {
                    if (attribute?.value) {
                        const outputAttributeValue = attribute.value;
                        if (!outputAttributeValue.file_data) {
                            return;
                        }
                        const fileHash   = _.keys(outputAttributeValue.file_data)[0];
                        const message    = !_.isNil(outputAttributeValue.file_data[fileHash]) ? outputAttributeValue.file_data[fileHash] : {};
                        let empty_tx     = _.isNil(message?.subject);
                        message.subject  = empty_tx ? this.getPendingTxMessage() : message.subject;
                        message.message  = empty_tx ? this.getPendingTxMessage() : message.message;
                        const newRow     = {
                            date       : format.date(transaction.transaction_date),
                            txid       : transaction.transaction_id,
                            txid_parent: outputAttributeValue.parent_transaction_id,
                            dns        : outputAttributeValue.dns,
                            amount     : format.number(transaction.amount),
                            subject    : message.subject,
                            address    : transaction.address_to,
                            message    : message.message,
                            sent       : true
                        };
                        newRow['action'] = <>
                            <DatatableActionButtonView
                                disabled={empty_tx}
                                history_path={'/message-view/' + encodeURIComponent(transaction.transaction_id)}
                                history_state={{...newRow}}
                                icon={'eye'}/>
                            <DatatableActionButtonView
                                disabled={empty_tx}
                                history_path={'/message-compose/' + encodeURIComponent(transaction.transaction_id)}
                                history_state={{...newRow}}
                                icon={'reply'}/>
                        </>;
                        message_list.push(newRow);
                    }
                });
            });

            this.setState({
                message_list              : message_list,
                datatable_reload_timestamp: new Date(),
                datatable_loading         : false
            });
        });
    }

    getPendingTxMessage() {
        return <>
            <Spinner size={'sm'} animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
            <span className="ms-2">waiting for message transaction to validate</span>
        </>;
    }

    render() {
        return (
            <div className={'panel panel-filled'}>
                <div className={'panel-heading bordered'}>sent
                </div>
                <div className={'panel-body'}>
                    <Row>
                        <DatatableView
                            action_button={{
                                label   : 'compose',
                                on_click: () => this.props.history.push('/message-compose'),
                                icon    : 'envelope'
                            }}
                            reload_datatable={() => this.reloadDatatable()}
                            datatable_reload_timestamp={this.state.datatable_reload_timestamp}
                            value={this.state.message_list}
                            loading={this.state.datatable_loading}
                            sortField={'date'}
                            sortOrder={-1}
                            showActionColumn={true}
                            resultColumn={[
                                {
                                    field: 'date'
                                },
                                {
                                    field: 'subject'
                                },
                                {
                                    field: 'address'
                                },
                                {
                                    field: 'amount'
                                }
                            ]}/>
                    </Row>
                </div>
            </div>
        );
    }
}


export default connect(
    state => ({
        wallet: state.wallet
    })
)(withRouter(MessageSentView));
