import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import os from 'os';
import API from '../../api';
import MessageComposeView from '../message/message-compose-view';
import {updateNetworkState} from '../../redux/actions';
import * as format from '../../helper/format';


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
        return (<>
            <MessageComposeView
                message={this.state.message}
                subject={'issue report:'}
                composse_description={'send error report to our address'}
                compose_title={'report issue'}
                destination_address={this.props.config.REPORT_ISSUE_ADDRESS}
            />
        </>);
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
