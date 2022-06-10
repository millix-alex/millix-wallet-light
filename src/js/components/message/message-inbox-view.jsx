import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {Row} from 'react-bootstrap';
import API from '../../api';
import * as helper_message from '../../helper/message';
import DatatableView from './../utils/datatable-view';
import {connect} from 'react-redux';


class MessageInboxView extends Component {
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

        return API.listTransactionWithDataReceived(this.props.wallet.address_key_identifier).then(data => {
            const message_list = helper_message.datatable_format(data);

            this.setState({
                message_list              : message_list,
                datatable_reload_timestamp: new Date(),
                datatable_loading         : false
            });
        });
    }

    render() {
        return (
            <>
                <div className={'panel panel-filled'}>
                    <div className={'panel-body'} style={{textAlign: 'center'}}>
                        <div>
                            <p>
                                use this address to receive messages
                            </p>
                        </div>
                        <div className={'primary_address'}>
                            {this.props.wallet.address_public_key}{this.props.wallet.address_key_identifier.startsWith('1') ? '0b0' : 'lb0l'}{this.props.wallet.address_key_identifier}
                        </div>
                    </div>
                </div>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>inbox
                    </div>
                    <div className={'panel-body'}>
                        <Row>
                            <DatatableView
                                action_button={{
                                    label   : 'compose',
                                    on_click: () => this.props.history.push('/message-compose'),
                                    icon    : 'envelope'
                                }}
                                loading={this.state.datatable_loading}
                                reload_datatable={() => this.reloadDatatable()}
                                datatable_reload_timestamp={this.state.datatable_reload_timestamp}
                                value={this.state.message_list}
                                sortField={'date'}
                                sortOrder={-1}
                                showActionColumn={true}
                                resultColumn={[
                                    {
                                        field     : 'date',
                                        class_name: 'w-10'
                                    },
                                    {
                                        field     : 'raw_date',
                                        class_name: 'hidden_data_search_column'
                                    },
                                    {
                                        field: 'subject'
                                    },
                                    {
                                        field : 'address_from',
                                        header: 'from'
                                    },
                                    {
                                        field: 'amount'
                                    }
                                ]}/>
                        </Row>
                    </div>
                </div>
            </>
        );
    }
}


export default connect(
    state => ({
        wallet: state.wallet
    })
)(withRouter(MessageInboxView));

