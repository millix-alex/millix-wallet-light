import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Row} from 'react-bootstrap';
import DatatableView from './utils/datatable-view';
import API from '../api';


class EventsLogView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            event_log_list: [],
            datatable     : {
                reload_timestamp: new Date(),
                loading         : false
            },
            update_handler: null
        };
    }

    componentDidMount() {
        this.loadEventLogToState();
        this.update_handler = setInterval(() => this.loadEventLogToState(), 20 * 1000);
    }

    componentWillUnmount() {
        clearTimeout(this.update_handler);
    }

    loadEventLogToState() {
        this.setState({
            datatable: {
                loading: true
            }
        });

        API.getEventLogList().then(response => {
            if (response.api_status === 'success') {
                this.setState({
                    event_log_list: response.event_log_list,
                    datatable     : {
                        reload_timestamp: new Date(),
                        loading         : false
                    }
                });
            }
        });
    }

    render() {
        return (
            <div>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>
                        event logs
                    </div>
                    <div className={'panel-body'}>
                        <DatatableView
                            reload_datatable={() => this.loadEventLogToState()}
                            datatable_reload_timestamp={this.state.datatable.reload_timestamp}
                            value={this.state.event_log_list}
                            loading={this.state.datatable.loading}
                            sortField={'timestamp'}
                            sortOrder={1}
                            resultColumn={[
                                {
                                    field : 'idx',
                                    header: 'id'
                                },
                                {
                                    field : 'timestamp',
                                    header: 'date'
                                },
                                {
                                    field : 'type',
                                    header: 'type'
                                },
                                {
                                    field : 'content',
                                    header: 'content'
                                }
                            ]}/>
                    </div>
                </div>
            </div>
        );
    }
}


export default connect(
    state => ({
        log: state.log
    }))(withRouter(EventsLogView));
