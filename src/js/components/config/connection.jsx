import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Button, Col, Form} from 'react-bootstrap';
import {removeWalletAddressVersion, walletUpdateConfig} from '../../redux/actions';
import _ from 'lodash';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import DatatableView from '../utils/datatable-view';
import ModalView from '../utils/modal-view';


class Connection extends Component {

    constructor(props) {
        super(props);
        this.state = {
            datatables        : {
                connection_inbound : [],
                connection_outbound: [],
                connection_static  : []
            },
            sending: false,
            node_connection_inbound_whitelist : '',
            node_connection_outbound_whitelist: '',
            node_connection_static_whitelist  : '',
            datatable_reload_timestamp: new Date(),
            current_connections: {},
            modalAddConnection:
                {
                    status: false,
                    body  : '',
                    title : ''
                }
        };
        this.getInboundConnectionModal = this.getInboundConnectionModal.bind(this);
        this.getOutboundConnectionModal = this.getOutboundConnectionModal.bind(this);
        this.getStaticConnectionModal = this.getStaticConnectionModal.bind(this);
    }

    showModalAddConnection(callback, title) {
        this.setState({
            modalAddConnection: {
                status: true,
                body  : callback(),
                title : title
            }
        });
    }

    hideModalAddConnection() {
        this.setState({
            modalAddConnection: {
                status: false,
                body  : ''
            }
        });
    }

    componentDidMount() {
        this.setConfigToState();
    }

    setConfig(data) {
        _.each(_.keys(data), key => {
            switch (this.props.configType[key]) {
                case 'number':
                    data[key] = JSON.parse(data[key]);
            }
        });

        return this.props.walletUpdateConfig(data);
    }

    sendCurrentConnections() {
        Object.entries(this.state.current_connections).forEach(([key]) => {
            this.addToConfigList(key);
        });

        this.setState({current_connections: {}})
        this.hideModalAddConnection();
    }

    addToConfigList(configName) {
        let value        = this.state.current_connections[configName];
        const configList = this.props.config[configName];
        if (!value || configList.includes(value)) {
            return;
        }
        value = value.trim();
        configList.push(value);
        this.setState({[configName]: ''});
        this.setConfig({[configName]: configList});
        this.setConfigToState();
    }


    removeFromConfigList(configName, value) {
        _.pull(this.props.config[configName], value);
        this.setConfig({[configName]: this.props.config[configName]});
        this.setConfigToState();
    }

    setConfigToState() {
        this.setState({
            datatable_reload_timestamp: new Date(),
            datatables: {
                connection_inbound : this.props.config.NODE_CONNECTION_INBOUND_WHITELIST.map((input) => ({
                    node_id: input,
                    action : this.getConnectionDeleteButton(input, 'NODE_CONNECTION_INBOUND_WHITELIST')
                })),
                connection_outbound: this.props.config.NODE_CONNECTION_OUTBOUND_WHITELIST.map((input) => ({
                    node_id: input,
                    action : this.getConnectionDeleteButton(input, 'NODE_CONNECTION_OUTBOUND_WHITELIST')
                })),
                connection_static  : this.props.config.NODE_CONNECTION_STATIC.map((input) => ({
                    node_id: input,
                    action : this.getConnectionDeleteButton(input, 'NODE_CONNECTION_STATIC')
                }))
            }
        });
    }

    getInboundConnectionModal() {
        return <Form>
            <Form.Control
                type="text"
                placeholder="node id"
                onChange={(e) => {
                    this.setState({current_connections: {NODE_CONNECTION_INBOUND_WHITELIST: e.target.value}});
                }}/>
        </Form>;
    }

    getOutboundConnectionModal() {
        return <Form>
            <Form.Control
                type="text"
                placeholder="node id"
                onChange={(e) => {
                    this.setState({current_connections: {NODE_CONNECTION_OUTBOUND_WHITELIST: e.target.value}});
                }}/>
        </Form>;
    }

    getStaticConnectionModal() {
        return <Form>
            <Form.Control
                type="text"
                placeholder="node id"
                onChange={(e) => {
                    this.setState({current_connections: {NODE_CONNECTION_STATIC: e.target.value}});
                }}/>
        </Form>;
    }


    getConnectionDeleteButton(nodeID, configName) {
        return <Button
            variant="outline-default"
            onClick={() => this.removeFromConfigList(configName, nodeID)}
            className={'btn-xs icon_only ms-auto'}>
            <FontAwesomeIcon icon={'trash'} size="1x"/>
        </Button>;
    }

    render() {
        return <div>
            <ModalView
                show={this.state.modalAddConnection.status}
                size={'lg'}
                on_close={() => this.hideModalAddConnection()}
                on_accept={() => this.sendCurrentConnections()}
                heading={this.state.modalAddConnection.title}
                body={this.state.modalAddConnection.body}/>
            <Form>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>
                        inbound connection whitelist
                    </div>
                    <div className={'panel-body'}>
                        <Col>
                            <DatatableView
                                reload_datatable={() => this.setConfigToState()}
                                datatable_reload_timestamp={this.state.datatable_reload_timestamp}
                                action_button_label={'add inbound connection'}
                                action_button={{
                                    label   : 'add inbound connection',
                                    on_click: () => this.showModalAddConnection(this.getInboundConnectionModal, 'add inbound connection')
                                }}
                                value={this.state.datatables.connection_inbound}
                                sortOrder={1}
                                showActionColumn={true}
                                resultColumn={[
                                    {
                                        field: 'node_id'
                                    }
                                ]}
                                actionColumnClass={'action-col-width'}
                            />
                        </Col>
                    </div>
                </div>

                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>
                        outbound connection whitelist
                    </div>
                    <div className={'panel-body'}>
                        <Col>
                            <DatatableView
                                reload_datatable={() => this.setConfigToState()}
                                datatable_reload_timestamp={this.state.datatable_reload_timestamp}
                                action_button={{
                                    label   : 'add outbound connection',
                                    on_click: () => this.showModalAddConnection(this.getOutboundConnectionModal, 'add outbound connection')
                                }}
                                value={this.state.datatables.connection_outbound}
                                sortOrder={1}
                                showActionColumn={true}
                                resultColumn={[
                                    {
                                        field: 'node_id'
                                    }
                                ]}
                                actionColumnClass={'action-col-width'}
                            />
                        </Col>
                    </div>
                </div>

                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>
                        static connection
                    </div>
                    <div className={'panel-body'}>
                        <Col>
                            <DatatableView
                                reload_datatable={() => this.setConfigToState()}
                                datatable_reload_timestamp={this.state.datatable_reload_timestamp}
                                action_button={{
                                    label   : 'add static connection',
                                    on_click: () => this.showModalAddConnection(this.getStaticConnectionModal, 'add static connection')
                                }}
                                value={this.state.datatables.connection_static}
                                sortOrder={1}
                                showActionColumn={true}
                                resultColumn={[
                                    {
                                        field: 'node_id'
                                    }
                                ]}
                                actionColumnClass={'action-col-width'}
                            />
                        </Col>
                    </div>
                </div>
            </Form>
        </div>;
    }
}


export default connect(
    state => ({
        config    : state.config,
        configType: state.configType,
        wallet    : state.wallet
    }),
    {
        walletUpdateConfig,
        removeWalletAddressVersion
    })(withRouter(Connection));
