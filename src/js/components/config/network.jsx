import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Button, Col, Form, Row} from 'react-bootstrap';
import {addWalletAddressVersion, removeWalletAddressVersion, walletUpdateConfig} from '../../redux/actions';
import API from '../../api';
import ErrorList from '../utils/error-list-view';
import ModalView from '../utils/modal-view';
import * as validate from '../../helper/validate';


class Network extends Component {
    constructor(props) {
        super(props);
        this.state = {
            node_public_ip       : '',
            sending              : false,
            network_config_data  : {},
            error_list           : {},
            modalShowSendResult  : false,
            reload               : false,
            prepared_network_data: {}
        };
    }

    async getNodePublicIP() {
        API.getNodePublicIP().then(data => {
            this.setState({
                node_public_ip: data.node_public_ip
            });
        });
    }

    componentDidMount() {
        this.getNodePublicIP();
        this.loadConfigToState();
    }

    loadConfigToState() {
        this.setState({
            network_config_data: {
                NODE_PORT                   : this.props.config.NODE_PORT,
                NODE_HOST                   : this.props.config.NODE_HOST,
                NODE_PORT_API               : this.props.config.NODE_PORT_API,
                NODE_CONNECTION_INBOUND_MAX : this.props.config.NODE_CONNECTION_INBOUND_MAX,
                NODE_CONNECTION_OUTBOUND_MAX: this.props.config.NODE_CONNECTION_OUTBOUND_MAX,
                NODE_INITIAL_LIST           : JSON.stringify(this.props.config.NODE_INITIAL_LIST)
            }
        });
    }

    changeModalShowSendResult(value = true) {
        this.setState({
            modalShowSendResult: value
        });
        if (value === false) {
            this.refreshPage();
        }
    }

    refreshPage = () => {
        this.loadConfigToState();
    };

    setNetworkConfig(data) {
        for (let key in data) {
            this.state.network_config_data[key] = data[key];
        }

        this.setState({
            network_config_data: this.state.network_config_data
        });
    }

    send() {
        this.setState({
            sending   : true,
            error_list: []
        });

        if (!this.isValidNetworkData()) {
            this.refreshPage();
            return;
        }

        try {
            this.props.walletUpdateConfig(this.state.prepared_network_data).then(() => {
                this.setState({
                    sending: false
                });
                this.changeModalShowSendResult();
            });
        }
        catch (e) {
            this.state.error_list.push({
                name   : 'saveError',
                message: 'error while saving occurred, please try again later'
            });
            this.setState({
                error_list: this.state.error_list
            });
            return Promise.reject('server_error');
        }
    }

    isValidNetworkData() {
        this.state.prepared_network_data     = {...this.state.network_config_data};
        let error_list = [];

        try {
            this.state.prepared_network_data.NODE_INITIAL_LIST = JSON.parse(this.state.prepared_network_data.NODE_INITIAL_LIST.split(','));
        }
        catch (e) {
            error_list.push({
                name   : 'validationError',
                message: 'nodes should contain valid json'
            });
        }
        this.state.prepared_network_data.NODE_PORT = validate.required('node port', this.state.prepared_network_data.NODE_PORT, error_list);
        if (this.state.prepared_network_data.NODE_PORT) {
            validate.positiveInteger('node port', this.state.prepared_network_data.NODE_PORT, error_list);
        }
        this.state.prepared_network_data.NODE_PORT_API = validate.required('rpc port', this.state.prepared_network_data.NODE_PORT_API, error_list);
        if (this.state.prepared_network_data.NODE_PORT_API) {
            validate.positiveInteger('rpc port', this.state.prepared_network_data.NODE_PORT_API, error_list);
        }
        this.state.prepared_network_data.NODE_CONNECTION_INBOUND_MAX = validate.required('max connections in', this.state.prepared_network_data.NODE_CONNECTION_INBOUND_MAX, error_list);
        if (this.state.prepared_network_data.NODE_CONNECTION_INBOUND_MAX) {
            validate.positiveInteger('max connections in', this.state.prepared_network_data.NODE_CONNECTION_INBOUND_MAX, error_list);
        }
        this.state.prepared_network_data.NODE_CONNECTION_OUTBOUND_MAX = validate.required('min connections in', this.state.prepared_network_data.NODE_CONNECTION_OUTBOUND_MAX, error_list);
        if (this.state.prepared_network_data.NODE_CONNECTION_OUTBOUND_MAX) {
            validate.positiveInteger('min connections in', this.state.prepared_network_data.NODE_CONNECTION_OUTBOUND_MAX, error_list);
        }
        validate.required('bind address', this.state.prepared_network_data.NODE_HOST, error_list);
        if (this.state.prepared_network_data.NODE_HOST) {
            validate.ipAddress('bind address', this.state.prepared_network_data.NODE_HOST, error_list);
        }


        if (error_list.length > 0) {
            this.setState({
                error_list: error_list,
                sending   : false
            });
            return false;
        }

        return true;
    }

    render() {
        return <div>
            <ModalView
                show={this.state.modalShowSendResult}
                size={'lg'}
                on_close={() => this.changeModalShowSendResult(false)}
                heading={'success'}
                body={
                    <div className={'text-center'}>
                        <div>
                            successfully saved
                        </div>
                    </div>
                }/>
            <div>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>network</div>
                    <div className={'panel-body'}>
                        <ErrorList
                            error_list={this.state.error_list}/>
                        <Row>
                            <Form>
                                <Col>
                                    <Form.Group className="form-group">
                                        <label>node public ip</label>
                                        <Form.Control
                                            type="text"
                                            placeholder=""
                                            value={this.state.node_public_ip}
                                            readOnly/>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="form-group">
                                        <label>network port</label>
                                        <Form.Control
                                            type="text"
                                            placeholder=""
                                            ref={(c) => this._port = c}
                                            onChange={() => {
                                                this.setNetworkConfig({NODE_PORT: this._port.value});
                                            }}
                                            value={this.state.network_config_data.NODE_PORT}/>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="form-group">
                                        <label>server bind</label>
                                        <Form.Control
                                            type="text"
                                            placeholder=""
                                            ref={(c) => this._host = c}
                                            onChange={() => {
                                                this.setNetworkConfig({NODE_HOST: this._host.value});
                                            }}
                                            value={this.state.network_config_data.NODE_HOST}/>

                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="form-group">
                                        <label>rpc port</label>
                                        <Form.Control
                                            type="text"
                                            placeholder=""
                                            ref={(c) => this._api_port = c}
                                            onChange={() => {
                                                this.setNetworkConfig({NODE_PORT_API: this._api_port.value});
                                            }}
                                            value={this.state.network_config_data.NODE_PORT_API}/>

                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="form-group">
                                        <label>max connections in</label>
                                        <Form.Control
                                            type="text"
                                            placeholder=""
                                            ref={(c) => this._max_in_connections = c}
                                            onChange={() => {
                                                this.setNetworkConfig({NODE_CONNECTION_INBOUND_MAX: this._max_in_connections.value});
                                            }}
                                            value={this.state.network_config_data.NODE_CONNECTION_INBOUND_MAX}/>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="form-group">
                                        <label>max connections out</label>
                                        <Form.Control
                                            type="text"
                                            placeholder=""
                                            ref={(c) => this.max_out_connections = c}
                                            onChange={() => {
                                                this.setNetworkConfig({NODE_CONNECTION_OUTBOUND_MAX: this.max_out_connections.value});
                                            }}
                                            value={this.state.network_config_data.NODE_CONNECTION_OUTBOUND_MAX}/>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="form-group">
                                        <label>nodes</label>
                                        <Form.Control as="textarea" rows={4}
                                                      placeholder=""
                                                      ref={(c) => this._nodes = c}
                                                      onChange={() => {
                                                          this.setNetworkConfig({NODE_INITIAL_LIST: this._nodes.value});
                                                      }}
                                                      value={this.state.network_config_data.NODE_INITIAL_LIST}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group
                                        className={'d-flex justify-content-center'}>
                                        <Button
                                            variant="outline-primary"
                                            onClick={() => this.send()}
                                            disabled={this.state.sending}>
                                            {this.state.sending ?
                                             <>
                                                 <div style={{
                                                     fontSize: '6px',
                                                     float   : 'left'
                                                 }}
                                                      className="loader-spin"/>
                                                 {'continue'}
                                             </> : <>continue</>}
                                        </Button>
                                    </Form.Group>
                                </Col>
                            </Form>
                        </Row>
                    </div>
                </div>
            </div>
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
    })(withRouter(Network));
