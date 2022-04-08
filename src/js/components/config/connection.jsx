import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Button, Col, Form} from 'react-bootstrap';
import {addWalletConfig, removeWalletAddressVersion, walletUpdateConfig} from '../../redux/actions';
import _ from 'lodash';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import DatatableView from '../utils/datatable-view';
import ModalView from '../utils/modal-view';
import ErrorList from '../utils/error-list-view';
import * as validate from '../../helper/validate';
import API from '../../api';
import store from '../../redux/store';


class Connection extends Component {

    constructor(props) {
        super(props);
        this.state                      = {
            datatables                         : {
                connection_inbound : [],
                connection_outbound: [],
                connection_static  : []
            },
            sending                            : false,
            node_connection_inbound_whitelist  : '',
            node_connection_outbound_whitelist : '',
            node_connection_static_whitelist   : '',
            datatable_reload_timestamp_inbound : new Date(),
            datatable_reload_timestamp_outbound: new Date(),
            datatable_reload_timestamp_static  : new Date(),
            current_connections                : {},
            error_list                         : [],
            modalAddConnection                 :
                {
                    status: false,
                    body  : '',
                    title : ''
                }
        };
        this.getInboundConnectionModal  = this.getInboundConnectionModal.bind(this);
        this.getOutboundConnectionModal = this.getOutboundConnectionModal.bind(this);
        this.getStaticConnectionModal   = this.getStaticConnectionModal.bind(this);
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
            },
            error_list        : []
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
        let success = false;
        Object.entries(this.state.current_connections).forEach(([key]) => {
            success = this.addToConfigList(key);
        });

        if (!success) {
            return;
        }
        this.setState({current_connections: {}});
        this.hideModalAddConnection();
    }

    addToConfigList(configName) {
        let value      = this.state.current_connections[configName];
        let error_list = [];

        validate.required('node id', value, error_list);
        validate.string('node id', value, error_list, 34);
        if (error_list.length > 0) {
            this.setState({
                error_list: error_list
            }, () => {
                switch (configName) {
                    case 'NODE_CONNECTION_INBOUND_WHITELIST':
                        this.showModalAddConnection(this.getInboundConnectionModal, 'add inbound connection');
                        break;
                    case 'NODE_CONNECTION_OUTBOUND_WHITELIST':
                        this.showModalAddConnection(this.getOutboundConnectionModal, 'add outbound connection');
                        break;
                    case 'NODE_CONNECTION_STATIC':
                        this.showModalAddConnection(this.getStaticConnectionModal, 'add static connection');
                        break;
                    default:
                        this.showModalAddConnection(this.getInboundConnectionModal, 'add inbound connection');
                        break;
                }
            });
            return false;
        }
        const configList = this.props.config[configName];
        value            = value.trim();
        configList.push(value);
        this.setState({[configName]: ''});
        this.setConfig({[configName]: configList});
        this.setConfigToState();
        return true;
    }


    removeFromConfigList(configName, value) {
        _.pull(this.props.config[configName], value);
        this.setConfig({[configName]: this.props.config[configName]});
        this.setConfigToState();
    }

    reloadConfig(datatable_name) {
        let datatable_reload_time = {};
        datatable_reload_time[datatable_name] = new Date();
            this.setState({
            ...datatable_reload_time
        })
        API.getNodeConfig()
           .then(configList => {
               const newConfig = {
                   config    : {},
                   configType: {}
               };
               configList.forEach(config => {
                   newConfig.config[config.config_name]     = config.type !== 'string' ? JSON.parse(config.value) : config.value;
                   newConfig.configType[config.config_name] = config.type;
               });
               store.dispatch(addWalletConfig(newConfig));
               this.setConfigToState();
           });
    }

    setConfigToState() {
        this.setState({
            datatables                : {
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
            <ErrorList
                error_list={this.state.error_list}/>
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
            <ErrorList
                error_list={this.state.error_list}/>
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
            <ErrorList
                error_list={this.state.error_list}/>
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
                prevent_close_after_accept={true}
                on_close={() => this.hideModalAddConnection()}
                on_accept={() => {
                    this.sendCurrentConnections();
                }}
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
                                reload_datatable={() => this.reloadConfig('datatable_reload_timestamp_inbound')}
                                datatable_reload_timestamp={this.state.datatable_reload_timestamp_inbound}
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
                                reload_datatable={() => this.reloadConfig('datatable_reload_timestamp_outbound')}
                                datatable_reload_timestamp={this.state.datatable_reload_timestamp_outbound}
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
                                reload_datatable={() => this.reloadConfig('datatable_reload_timestamp_static')}
                                datatable_reload_timestamp={this.state.datatable_reload_timestamp_static}
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
