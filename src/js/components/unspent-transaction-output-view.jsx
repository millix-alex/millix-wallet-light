import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {Button, Col, Row} from 'react-bootstrap';
import moment from 'moment';
import API from '../api/index';
import DatatableView from './utils/datatable-view';
import DatatableActionButtonView from './utils/datatable-action-button-view';
import * as format from '../helper/format';
import DatatableHeaderView from './utils/datatable-header-view';
import HelpIconView from './utils/help-icon-view';


class UnspentTransactionOutputView extends Component {
    constructor(props) {
        super(props);
        this.updaterHandler = undefined;
        this.state          = {
            transaction_output_list   : [],
            stable                    : 1,
            datatable_reload_timestamp: '',
            datatable_loading         : false
        };
    }

    componentDidMount() {
        const stable_value_new = this.getStableFromUrl();
        this.setState({
            stable: stable_value_new
        }, this.reloadDatatable);

        this.updaterHandler = setInterval(() => this.reloadDatatable(), 60000);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const stable_value_new     = this.getStableFromUrl();
        const stable_value_current = this.state.stable;
        if (stable_value_new !== stable_value_current || this.props.wallet.address_key_identifier !== prevProps.wallet.address_key_identifier) {
            this.setState({
                stable: stable_value_new
            }, this.reloadDatatable);
        }
    }

    getStableFromUrl() {
        const stable_filter  = this.props.location.pathname.split('/').pop();
        let stable_value_new = 1;
        if (stable_filter === 'pending') {
            stable_value_new = 0;
        }

        return stable_value_new;
    }

    reloadDatatable() {
        this.setState({
            datatable_loading: true
        });

        return API.getWalletUnspentTransactionOutputList(this.props.wallet.address_key_identifier, this.state.stable).then(data => {
            let rows = data.filter(output => output.status !== 3).map((output, idx) => ({
                idx             : data.length - idx,
                transaction_id  : output.transaction_id,
                address         : output.address,
                output_position : output.output_position,
                amount          : output.amount,
                transaction_date: format.date(output.transaction_date),
                stable_date     : format.date(output.stable_date),
                action          : <DatatableActionButtonView
                    history_path={'/transaction/' + encodeURIComponent(output.transaction_id)}
                    history_state={[output]}
                    icon={'eye'}/>
            }));
            this.setState({
                transaction_output_list   : rows,
                datatable_reload_timestamp: new Date(),
                datatable_loading         : false
            });
        });
    }

    componentWillUnmount() {
        clearTimeout(this.updaterHandler);
    }

    render() {
        let note  = '';
        let title = '';
        if (this.state.stable) {
            title = 'stable unspents';
            note =
                <span>unspents appear as stable and included in balance once they are validated by your node.
        </span>;
        }
        else {
            title = 'pending unspents'
            note =
                <span>unspents appear as pending and included in pending balance<HelpIconView
                    help_item_name={'pending_balance'}/> until they are validated by your node.
        </span>;
        }

        return (
            <div>
                <div className={'panel panel-filled'}>
                    <div
                        className={'panel-heading bordered'}>
                        {title}
                    </div>
                    <div className={'panel-body'}>
                        <div>
                            unspent is transaction output that you received and
                            did not use to fund any transaction yet. when you send
                            a transaction and an unspent bigger than you need
                            has been used, you receive the change as a new
                            output(unspent).
                        </div>
                        <div className={'form-group'}>
                            {note}
                        </div>
                        <DatatableHeaderView
                            reload_datatable={() => this.reloadDatatable()}
                            datatable_reload_timestamp={this.state.datatable_reload_timestamp}
                        />
                        <Row id={'txhistory'}>
                            <DatatableView
                                value={this.state.transaction_output_list}
                                sortField={'transaction_date'}
                                sortOrder={-1}
                                loading={this.state.datatable_loading}
                                showActionColumn={true}
                                resultColumn={[
                                    {
                                        field : 'transaction_date',
                                        header: 'date'
                                    },
                                    {
                                        field : 'amount',
                                        format: 'amount'
                                    },
                                    {
                                        field: 'address'
                                    },
                                    {
                                        field: 'transaction_id'
                                    },
                                    {
                                        field: 'output_position'
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
)(withRouter(UnspentTransactionOutputView));
