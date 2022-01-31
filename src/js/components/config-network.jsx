import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Col, Form, Row} from 'react-bootstrap';
import {addWalletAddressVersion, removeWalletAddressVersion, walletUpdateConfig} from '../redux/actions/index';
import API from '../api/index';
import _ from 'lodash';

class ConfigNetwork extends Component {

    constructor(props) {
        super(props);
        this.state = {
            node_public_ip       : '',
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
        this.getNodePublicIP()
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

    removeFromConfigList(configName, value) {
        _.pull(this.props.config[configName], value);
        this.setConfig({[configName]: this.props.config[configName]});
        this.setConfigToState();
    }

    render() {
        return <div>
            <Form>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>network</div>
                    <div className={'panel-body'}>
                        <Row>
                            <Form>
                                <Col>
                                    <Form.Group className="form-group">
                                        <label
                                            className="control-label">debug</label>
                                        <div
                                            className="btn-group btn-full-width">
                                            <Form.Control
                                                as="select"
                                                value={this.props.config.MODE_DEBUG ? 'on' : 'off'}
                                                onChange={(e) => {
                                                    this.setConfig({MODE_DEBUG: e.target.value === 'on'})
                                                }}
                                            >
                                                {Array.from([
                                                    'on',
                                                    'off'
                                                ]).map(type =>
                                                    <option
                                                        key={type}
                                                    >{type}</option>
                                                )}
                                            </Form.Control>
                                        </div>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="form-group">
                                        <label>network
                                            port</label>

                                        <Form.Control
                                            type="text"
                                            placeholder=""
                                            ref={(c) => this._port = c}
                                            onChange={() => {
                                                this.setConfig({NODE_PORT: this._port.value});
                                            }}
                                            value={this.props.config.NODE_PORT}/>
                                    </Form.Group>
                                </Col>

                                <Col>
                                    <Form.Group className="form-group">
                                        <label>rpc
                                            port</label>
                                        <Form.Control
                                            type="text"
                                            placeholder=""
                                            ref={(c) => this._api_port = c}
                                            onChange={() => {
                                                this.setConfig({NODE_PORT_API: this._api_port.value});
                                            }}
                                            value={this.props.config.NODE_PORT_API}/>

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
                                                this.setConfig({NODE_HOST: this._host.value});
                                            }}
                                            value={this.props.config.NODE_HOST}/>

                                    </Form.Group>
                                </Col>

                                <Col>
                                    <Form.Group className="form-group">
                                        <label>node
                                            public ip</label>
                                        <Form.Control
                                            type="text"
                                            placeholder=""
                                            value={this.state.node_public_ip}
                                            readOnly/>
                                    </Form.Group>
                                </Col>

                                <Col>
                                    <Form.Group className="form-group">
                                        <label>nodes</label>
                                        <Form.Control as="textarea" rows={10}
                                                      placeholder=""
                                                      ref={(c) => this._nodes = c}
                                                      onChange={() => {
                                                          this.setConfig({NODE_INITIAL_LIST: JSON.parse(this._nodes.value.split(','))});
                                                      }}
                                                      value={JSON.stringify(this.props.config.NODE_INITIAL_LIST)}
                                        />

                                    </Form.Group>
                                </Col>

                                <Col>
                                    <Form.Group className="form-group">
                                        <label>max
                                            connections
                                            in</label>
                                        <Form.Control
                                            type="text"
                                            placeholder=""
                                            ref={(c) => this._max_in_connections = c}
                                            onChange={() => {
                                                this.setConfig({NODE_CONNECTION_INBOUND_MAX: this._max_in_connections.value});
                                            }}
                                            value={this.props.config.NODE_CONNECTION_INBOUND_MAX}/>
                                    </Form.Group>
                                </Col>

                                <Col>
                                    <Form.Group className="form-group">
                                        <label>max
                                            connections
                                            out</label>
                                        <Form.Control
                                            type="text"
                                            placeholder=""
                                            ref={(c) => this.max_out_connections = c}
                                            onChange={() => {
                                                this.setConfig({NODE_CONNECTION_OUTBOUND_MAX: this.max_out_connections.value});
                                            }}
                                            value={this.props.config.NODE_CONNECTION_OUTBOUND_MAX}/>
                                    </Form.Group>
                                </Col>
                            </Form>
                        </Row>
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
    })(withRouter(ConfigNetwork));
