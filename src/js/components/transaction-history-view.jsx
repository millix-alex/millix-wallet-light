import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter, Link} from 'react-router-dom';
import {Row} from 'react-bootstrap';
import DatatableView from './utils/datatable-view';
import DatatableActionButtonView from './utils/datatable-action-button-view';
import * as format from '../helper/format';
import API from '../api';
import DatatableHeaderView from './utils/datatable-header-view';
import ModalView from './utils/modal-view';


class TransactionHistoryView extends Component {
    constructor(props) {
        super(props);
        this.transactionHistoryUpdateHandler = undefined;
        this.state                           = {
            transaction_list          : [],
            datatable_reload_timestamp: '',
            datatable_loading         : false,
            modalShow                 : false,
            reset_transaction_id      : ''
        };
    }

    componentDidMount() {
        this.reloadDatatable();
        this.transactionHistoryUpdateHandler = setInterval(() => this.reloadDatatable, 60000);
    }

    componentWillUnmount() {
        clearTimeout(this.transactionHistoryUpdateHandler);
    }

    revalidateTransaction(props, transactionID) {
        API.resetTransactionValidationByGUID(transactionID).then(response => {
            if (typeof response.api_status === 'string') {
                props.callback_props.changeModalShow(true, transactionID);
            }
        });
    }

    changeModalShow(value = true, transactionID) {
        this.setState({
            modalShow           : value,
            reset_transaction_id: value ? transactionID : ''
        });
    }

    reloadDatatable() {
        let that = this;
        this.setState({
            datatable_loading: true
        });

        return API.getTransactionHistory(this.props.wallet.address_key_identifier).then(data => {
            const rows = data.map((transaction, idx) => ({
                idx        : data.length - idx,
                date       : format.date(transaction.transaction_date),
                amount     : transaction.amount,
                txid       : transaction.transaction_id,
                stable_date: format.date(transaction.stable_date),
                parent_date: format.date(transaction.parent_date),
                action: <><DatatableActionButtonView
                    history_path={'/transaction/' + encodeURIComponent(transaction.transaction_id)}
                    history_state={[transaction]}
                    icon={'eye'}/>
                    <DatatableActionButtonView
                        icon={'sync'}
                        title={'reset validation'}
                        callback={this.revalidateTransaction}
                        callback_props={that}
                        callback_args={transaction.transaction_id}
                    />
                </>
            }));

            this.setState({
                transaction_list          : rows,
                datatable_reload_timestamp: new Date(),
                datatable_loading         : false
            });
        });
    }

    render() {
        return (
            <div>
                <ModalView show={this.state.modalShow}
                           size={'lg'}
                           on_close={() => this.changeModalShow(false)}
                           heading={'transaction validation reset'}
                           body={<div>
                               <div>validation has been reset for
                                   transaction {this.state.reset_transaction_id}.
                                   click <Link
                                       to={'/unspent-transaction-output-list/pending'}>here</Link> to
                                   see all your pending transactions
                               </div>
                           </div>}
                />
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>transactions</div>
                    <div className={'panel-body'}>
                        <DatatableHeaderView
                            reload_datatable={() => this.reloadDatatable()}
                            datatable_reload_timestamp={this.state.datatable_reload_timestamp}
                        />
                        <Row id={'txhistory'}>
                            <DatatableView
                                value={this.state.transaction_list}
                                sortField={'date'}
                                sortOrder={-1}
                                loading={this.state.datatable_loading}
                                showActionColumn={true}
                                resultColumn={[
                                    {
                                        field: 'date'
                                    },
                                    {
                                        field : 'amount',
                                        format: 'amount'
                                    },
                                    {
                                        field : 'txid',
                                        header: 'transaction id'
                                    },
                                    {
                                        field: 'stable_date'
                                    }
                                ]}/>
                        </Row>
                    </div>
                </div>
            </div>
        );
    }
}


export default connect(
    state => ({
        wallet: state.wallet
    })
)(withRouter(TransactionHistoryView));
