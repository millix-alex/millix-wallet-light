import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {Col, Row, Table} from 'react-bootstrap';
import {connect} from 'react-redux';
import {updateNetworkState} from '../../redux/actions';
import os from 'os';
import API from '../../api';
import * as format from '../../helper/format';
import HelpIconView from './../utils/help-icon-view';


class ReportIssueView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            nodeOsInfo    : {
                arch                  : '',
                memory                : {
                    free       : '',
                    freePercent: '',
                    total      : '',
                    freemem    : ''
                },
                cpu                   : {
                    model  : '',
                    speed  : '',
                    loadavg: []
                },
                platform              : '',
                release               : '',
                type                  : '',
                node_millix_version   : '',
                node_millix_build_date: ''
            },
            browserRelease: os.release()
        };
    }

    componentDidMount() {
        API.getNodeOsInfo().then(response => {
            this.setState({
                nodeOsInfo: response
            });
        });
    }

    render() {
        const props = this.props;

        return (<Col md="12">
            <div className={'panel panel-filled'}>
                <div className={'panel-heading bordered'}>
                    report problem
                </div>
                <div className={'panel-body'}>
                    <Row>
                        <Col>
                            <div className={'section_subtitle'}>
                                instructions
                            </div>
                            <div className={'form-group'}>
                                <div>to report about a problem please follow
                                    these steps:
                                </div>
                                <ul>
                                    <li>describe current behavior</li>
                                    <li>describe expected behavior</li>
                                    <li>add information provided on this page
                                    </li>
                                    <li>send it to us on <a
                                        href={'https://discord.com/invite/nb5uaKq4yX'}
                                        target={'_blank'}>discord</a></li>
                                </ul>
                            </div>
                            <hr/>

                            <Row>
                                <Col>
                                    <div className={'section_subtitle'}>
                                        node
                                    </div>
                                    <Table striped bordered hover>
                                        <tbody>
                                        <tr>
                                            <td className={'w-20'}>
                                                node id
                                            </td>
                                            <td>
                                                {props.network.node_id}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className={'w-20'}>
                                                key identifier<HelpIconView
                                                help_item_name={'key_identifier'}/>
                                            </td>
                                            <td>
                                                {props.wallet.address_key_identifier}
                                            </td>
                                        </tr>
                                        </tbody>
                                    </Table>
                                </Col>
                            </Row>

                            <Row>
                                <Col>
                                    <div className={'section_subtitle'}>
                                        version
                                    </div>
                                    <Table striped bordered hover>
                                        <tbody>
                                        <tr>
                                            <td className={'w-20'}>
                                                build
                                            </td>
                                            <td>
                                                {this.state.nodeOsInfo.node_millix_version}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className={'w-20'}>
                                                build date
                                            </td>
                                            <td>
                                                {format.date(this.state.nodeOsInfo.node_millix_build_date)}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className={'w-20'}>
                                                browser
                                            </td>
                                            <td>
                                                {this.state.browserRelease}
                                            </td>
                                        </tr>
                                        </tbody>
                                    </Table>
                                </Col>
                            </Row>

                            <Row>
                                <Col>
                                    <div className={'section_subtitle'}>
                                        os
                                    </div>
                                    <Table striped bordered hover>
                                        <tbody>
                                        <tr>
                                            <td className={'w-20'}>
                                                platform
                                            </td>
                                            <td>
                                                {this.state.nodeOsInfo.platform}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className={'w-20'}>
                                                type
                                            </td>
                                            <td>
                                                {this.state.nodeOsInfo.type}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className={'w-20'}>
                                                release
                                            </td>
                                            <td>
                                                {this.state.nodeOsInfo.release}
                                            </td>
                                        </tr>
                                        </tbody>
                                    </Table>
                                </Col>
                            </Row>


                            <Row>
                                <Col>
                                    <div className={'section_subtitle'}>
                                        hardware
                                    </div>
                                    <Table striped bordered hover
                                           className={'mb-0'}>
                                        <tbody>
                                        <tr>
                                            <td className={'w-20'}>
                                                architecture
                                            </td>
                                            <td>
                                                {this.state.nodeOsInfo.arch}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className={'w-20'}>
                                                memory total
                                            </td>
                                            <td>
                                                {this.state.nodeOsInfo.memory.total}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className={'w-20'}>
                                                memory free
                                            </td>
                                            <td>
                                                {this.state.nodeOsInfo.memory.free} ({this.state.nodeOsInfo.memory.freePercent})
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className={'w-20'}>
                                                cpu
                                            </td>
                                            <td>
                                                {this.state.nodeOsInfo.cpu.model}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className={'w-20'}>
                                                cpu load average
                                            </td>
                                            <td>
                                                {this.state.nodeOsInfo.cpu.loadavg.join(' ')}
                                            </td>
                                        </tr>
                                        </tbody>
                                    </Table>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </div>
            </div>
        </Col>);
    }
}


export default connect(
    state => ({
        clock  : state.clock,
        config : state.config,
        log    : state.log,
        network: state.network,
        wallet : state.wallet,
        backlog: state.backlog,
        node   : state.node
    }), {
        updateNetworkState
    })(withRouter(ReportIssueView));
