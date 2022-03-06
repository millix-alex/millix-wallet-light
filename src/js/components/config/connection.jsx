import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Button, Col, Form, Row} from 'react-bootstrap';
import {addWalletAddressVersion, removeWalletAddressVersion, walletUpdateConfig} from '../../redux/actions';
import _ from 'lodash';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import DatatableView from '../utils/datatable-view';
import ModalView from '../utils/modal-view';


class Connection extends Component {

    constructor(props) {
        super(props);
        this.state = {
            node_public_ip    : '',
            datatables        : {
                connection_inbound : [],
                connection_outbound: [],
                connection_static  : []
            },
            modalAddConnection:
                {
                    status: false,
                    body  : ''
                }
        };
    }

    changeModalAddConnection(value = true, callback) {
        this.setState({
            modalAddConnection: {
                status: value,
                body  : callback()
            }
        });
        if (value === false) {

        }
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

    addToConfigList(configName, stateName) {
        let value        = this.state[stateName];
        const configList = this.props.config[configName];
        if (!value || configList.includes(value)) {
            return;
        }
        value = value.trim();
        configList.push(value);
        this.setState({[stateName]: ''});
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
                ref={(c) => this._connection_whitelist_inbound_node = c}
                onChange={() => {
                    this.setState({connection_whitelist_inbound_node: this._connection_whitelist_inbound_node.value});
                }}
                value={this.state.connection_whitelist_inbound_node}/>
        </Form>;
    }


    getConnectionDeleteButton(nodeID, configName) {
        return <Button
            variant="outline-default"
            onClick={() => this.removeFromConfigList(configName, nodeID)}
            className={'btn-xs icon_only ms-auto'}>
            <FontAwesomeIcon
                icon={'trash'}
                size="1x"/>
        </Button>;
    }

    render() {
        return <div>
            <ModalView
                show={this.state.modalAddConnection.status}
                size={'lg'}
                on_close={() => this.changeModalAddConnection(false)}
                on_accept={() => this.sendTransaction()}
                heading={'success'}
                body={this.state.modalAddConnection.body}/>
            <Form>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>inbound connection
                        whitelist
                    </div>
                    <div className={'panel-body'}>
                        <Col>
                            <Form.Group className="form-group">
                                {/*<Row>
                                 <Col sm="10"
                                 md="11">
                                 <Form.Control
                                 type="text"
                                 placeholder="node id"
                                 ref={(c) => this._connection_whitelist_inbound_node = c}
                                 onChange={() => {
                                 this.setState({connection_whitelist_inbound_node: this._connection_whitelist_inbound_node.value});
                                 }}
                                 value={this.state.connection_whitelist_inbound_node}/>
                                 </Col>
                                 <Col sm="2"
                                 md="1">
                                 <Button
                                 variant="outline-primary"
                                 size={'sm'}
                                 onClick={() => this.addToConfigList('NODE_CONNECTION_INBOUND_WHITELIST', 'connection_whitelist_inbound_node')}>
                                 <FontAwesomeIcon
                                 icon="plus"
                                 size="1x"/>
                                 </Button>
                                 </Col>
                                 </Row>*/}
                            </Form.Group>
                        </Col>
                        <Col>
                            <DatatableView
                                reload_datatable={() => this.reloadDatatable()}
                                datatable_reload_timestamp={this.state.datatable_reload_timestamp}
                                action_button_label={'add inbound connection'}
                                action_button_on_click={() => this.addToConfigList('NODE_CONNECTION_INBOUND_WHITELIST', 'connection_whitelist_inbound_node')}
                                value={this.state.datatables.connection_inbound}
                                sortOrder={1}
                                showActionColumn={true}
                                resultColumn={[
                                    {
                                        field: 'node_id'
                                    }
                                ]}/>
                        </Col>
                    </div>
                </div>

                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>outbound
                        connection
                        whitelist
                    </div>
                    <div className={'panel-body'}>
                        <Col>
                            <DatatableView
                                reload_datatable={() => this.reloadDatatable()}
                                datatable_reload_timestamp={this.state.datatable_reload_timestamp}
                                action_button={{
                                    label   : 'add outbound connection',
                                    on_click: () => this.generateAddress()
                                }}
                                value={this.state.datatables.connection_outbound}
                                sortOrder={1}
                                showActionColumn={true}
                                resultColumn={[
                                    {
                                        field: 'node_id'
                                    }
                                ]}/>
                        </Col>
                    </div>
                </div>

                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>static
                        connection
                    </div>
                    <div className={'panel-body'}>
                        {/*<Col>
                            <Form.Group className="form-group">
                                <label>add
                                    static
                                    connection
                                </label>
                                <Row>
                                    <Col sm="10"
                                         md="11">
                                        <Form.Control
                                            type="text"
                                            placeholder="node id"
                                            ref={(c) => this._connection_static_node = c}
                                            onChange={() => {
                                                this.setState({connection_static_node: this._connection_static_node.value});
                                            }}
                                            value={this.state.connection_static_node}/>
                                    </Col>
                                    <Col sm="2"
                                         md="1">
                                        <Button
                                            variant="outline-primary"
                                            size={'sm'}
                                            onClick={() => this.addToConfigList('NODE_CONNECTION_STATIC', 'connection_static_node')}>
                                            <FontAwesomeIcon
                                                icon="plus"
                                                size="1x"/>
                                        </Button>
                                    </Col>
                                </Row>
                            </Form.Group>
                        </Col>*/}
                        <Col>
                            <DatatableView
                                reload_datatable={() => this.reloadDatatable()}
                                datatable_reload_timestamp={this.state.datatable_reload_timestamp}
                                action_button={{
                                    label   : 'add static connection',
                                    on_click: () => ''/*this.generateAddress()*/
                                }}
                                value={this.state.datatables.connection_static}
                                sortOrder={1}
                                showActionColumn={true}
                                resultColumn={[
                                    {
                                        field: 'node_id'
                                    }
                                ]}/>
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
        addWalletAddressVersion,
        removeWalletAddressVersion
    })(withRouter(Connection));
