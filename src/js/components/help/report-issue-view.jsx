import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import os from 'os';
import API from '../../api';
import {updateNetworkState} from '../../redux/actions';
import * as format from '../../helper/format';
import {Col, Row} from 'react-bootstrap';
import MessageComposeForm from '../message/message-compose-form';


class ReportIssueView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: 'loading'
        };
    }

    componentDidMount() {
        API.getNodeOsInfo().then(node_os_info => {
            this.setReportMessage(node_os_info);
        });
    }

    setReportMessage(node_os_info) {
        this.setState({
            message: `node:
    node id - ${this.props.network.node_id};
    key identifier - ${this.props.wallet.address_key_identifier}
    build - ${node_os_info.node_millix_version}
    build date - ${format.date(node_os_info.node_millix_build_date)}
    browser - ${os.release()}
os:
    platform - ${node_os_info.platform}
    type - ${node_os_info.type}
    release - ${node_os_info.release}
hardware:
    architecture - ${node_os_info.arch}
    memory total - ${node_os_info.memory.total}
    memory free - ${node_os_info.memory.free} (${node_os_info.memory.freePercent})
    cpu - ${node_os_info.cpu.model}
    cpu load average - ${node_os_info.cpu.loadavg.join(' ')}
        `
        });
    }

    render() {
        return (

            <div>
                <Row>
                    <Col md={12}>
                        <div className={'panel panel-filled'}>
                            <div className={'panel-heading bordered'}>report issue</div>
                            <div className={'panel-body'}>
                                <p>
                                    to report about an issue please describe it in the message below.
                                    it already contain your system info for your convenience.
                                    if you can't send us a message for any reason please send it to us on <a href={'https://discord.gg/HgZqav7v66'} target={'_blank'}>discord</a>
                                </p>
                                <MessageComposeForm
                                    message={this.state.message}
                                    subject={'issue report:'}
                                    destination_address={this.props.config.REPORT_ISSUE_ADDRESS}
                                />
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
        network: state.network,
        wallet : state.wallet,
        config : state.config
    }), {
        updateNetworkState
    })(withRouter(ReportIssueView));
