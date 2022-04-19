import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Row} from 'react-bootstrap';
import API from '../api';
import * as format from '../helper/format';
import DatatableView from './utils/datatable-view';
import _ from 'lodash';
import DatatableActionButtonView from './utils/datatable-action-button-view';


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
        clearTimeout(this.datatable_reload_interval);
    }

    reloadDatatable() {
        this.setState({
            datatable_loading: true
        });

        return API.listTransactionWithDataSent(this.props.wallet.address_key_identifier).then(data => {
            const rows = [];
            let idx    = 0;
            data.forEach((transaction, idx) => {
                transaction?.transaction_output_attribute.forEach(attribute => {
                    if (attribute?.value) {
                        const outputAttributeValue = attribute.value;
                        if (!outputAttributeValue.file_data) {
                            return;
                        }
                        for (const fileHash of _.keys(outputAttributeValue.file_data)) {
                            const message = outputAttributeValue.file_data[fileHash];
                            if (!_.isNil(message.subject) && !_.isNil(message.message)) {
                                const newRow     = {
                                    idx    : idx,
                                    date   : format.date(transaction.transaction_date),
                                    txid   : transaction.transaction_id,
                                    amount : format.number(transaction.amount),
                                    subject: message.subject,
                                    address: transaction.address_to,
                                    message: message.message,
                                    sent   : true
                                };
                                newRow['action'] = <>
                                    <DatatableActionButtonView
                                        history_path={'/message-view/' + encodeURIComponent(transaction.transaction_id)}
                                        history_state={{...newRow}}
                                        icon={'eye'}/>
                                </>;
                                rows.push(newRow);
                                idx++;
                                break;
                            }
                        }
                    }
                });
            });

            this.setState({
                message_list              : rows,
                datatable_reload_timestamp: new Date(),
                datatable_loading         : false
            });
        });
    }

    render() {
        return (
            <div className={'panel panel-filled'}>
                <div className={'panel-heading bordered'}>messages sent
                </div>
                <div className={'panel-body'}>
                    <Row>
                        <DatatableView
                            reload_datatable={() => this.reloadDatatable()}
                            datatable_reload_timestamp={this.state.datatable_reload_timestamp}
                            value={this.state.message_list}
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
