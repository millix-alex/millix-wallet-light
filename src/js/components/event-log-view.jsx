import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Col, Row} from 'react-bootstrap';
import DatatableView from './utils/datatable-view';
import API from '../api';


class EventsLogView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            contentFilter             : '',
            events                    : [
                {}
            ],
            enableAutoUpdate          : true,
            modalShow                 : false,
            datatable_reload_timestamp: new Date()
        };
    }

    componentDidMount() {
        this.loadEventLog();
    }

    loadEventLog() {
        API.getEventLogList().then(response => {
            this.setState({
                events                    : response,
                datatable_reload_timestamp: new Date()
            });

        }).catch(() => {
            this.setState({
                events                    : [],
                datatable_reload_timestamp: new Date()
            });
        });
    }

    render() {
        return (
            <div>
                <Row>
                    <Col md={12}>
                        <div className={'panel panel-filled'}>
                            <div className={'panel-heading bordered'}>
                                event logs
                            </div>
                            <div className={'panel-body'}>
                                <Row>
                                    <DatatableView
                                        reload_datatable={() => this.loadEventLog()}
                                        datatable_reload_timestamp={this.state.datatable_reload_timestamp}
                                        value={this.state.events}
                                        sortField={'date'}
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
        log: state.log
    }))(withRouter(EventsLogView));
