import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {Button, Col, Row, Table} from 'react-bootstrap';
import {connect} from 'react-redux';
import {updateNetworkState} from '../redux/actions';
import HelpIconView from './utils/help-icon-view';
import * as format from '../helper/format';
import API from '../api';

class SummaryAdView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ads_counters:{
                total   :0,
                active  :0,
                paused  :0
            }
        };        
    }

    componentDidMount(){
        API.adsCounters().then(res => {
            this.setState({
                ads_counters:{
                    total   :res.counters.total,
                    active  :res.counters.active,
                    paused  :res.counters.paused
                }
            });
        });
    }

    render() {
        return (
                <Col md="12">
                    <div className={'panel panel-filled'}>
                        <div className={'panel-heading bordered'}>advertisement summary
                        </div>
                        <div className={'panel-body'}>
                        <Row>
                        <Col>
                            <div className={'section_subtitle'}>
                                counters
                            </div>
                            <Table striped bordered hover>
                                <tbody>                                  
                                <tr>
                                    <td className={'w-20'}>
                                        active
                                    </td>
                                    <td>
                                      {this.state.ads_counters.active}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={'w-20'}>
                                        paused
                                    </td>
                                    <td>
                                      {this.state.ads_counters.paused}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={'w-20'}>
                                        total
                                    </td>
                                    <td>
                                      {this.state.ads_counters.total}
                                    </td>
                                </tr>                              
                                </tbody>
                            </Table>
                        </Col>
                    </Row>
                    </div>    
                </div>
            </Col>
        );
    }
}


export default withRouter(SummaryAdView);