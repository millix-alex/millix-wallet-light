import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Button, Col, Form, Row} from 'react-bootstrap';
import {addWalletAddressVersion, removeWalletAddressVersion, walletUpdateConfig} from '../redux/actions/index';
import _ from 'lodash';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import DatatableView from './utils/datatable-view';

class ConfigAddressVersion extends Component {

    constructor(props) {
        super(props);
        this.state = {
            address_version_name : '',
            address_version_regex: '',
            address_is_default   : false,
            node_public_ip       : '',
            datatables           : []
        };
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

    addAddressVersion() {
        const data = {
            version        : this._address_version_name.value,
            is_main_network: this.props.config.MODE_TEST_NETWORK ? 0 : 1,
            regex_pattern  : this._address_version_regex.value,
            is_default     : this.state.address_is_default ? 1 : 0
        };
        this.props.addWalletAddressVersion(data);
        this.setState({
            address_version_name : '',
            address_version_regex: '',
            address_is_default   : false
        });
    }


    removeFromConfigList(configName, value) {
        _.pull(this.props.config[configName], value);
        this.setConfig({[configName]: this.props.config[configName]});
        this.setConfigToState();
    }

    setConfigToState() {
        this.setState({
            datatables: {
                address_version_list: this.props.wallet.address_version_list.map((input) => ({
                    version: input.version,
                    regex_pattern: input.regex_pattern,
                    default_address: input.is_default === 1 ? 'yes' : 'no',
                    action : this.getRemoveWalletAddressVersionButton(input)
                }))
            }
        })
    }

    getRemoveWalletAddressVersionButton(addressVersion) {
        return <Button
            variant="outline-default"
            onClick={() => this.props.removeWalletAddressVersion(addressVersion)}
            className={'btn-xs icon_only ms-auto'}>
            <FontAwesomeIcon
                icon={'trash'}
                size="1x"/>
        </Button>;
    }

    render() {
        return <div>
            <Form>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>address version
                    </div>
                    <div className={'panel-body'}>
                        <Col>
                            <Form.Group className="form-group">
                                <label
                                    className="label-btn">default
                                    address</label>
                                <div
                                    className="btn-group btn-full-width">
                                    <Form.Control
                                        as="select"
                                        value={this.state.address_is_default ? 'yes' : 'no'}
                                        onChange={(e) => {
                                            this.setState({address_is_default: e.target.value === 'yes'});
                                        }}
                                    >
                                        {Array.from([
                                            'yes',
                                            'no'
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
                                <label>version</label>
                                <Form.Control
                                    type="text"
                                    placeholder=""
                                    ref={(c) => this._address_version_name = c}
                                    onChange={() => {
                                        this.setState({address_version_name: this._address_version_name.value});
                                    }}
                                    value={this.state.address_version_name}/>
                            </Form.Group>
                        </Col>

                        <Col>
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
                                            placeholder=""
                                            ref={(c) => this._address_version_regex = c}
                                            onChange={() => {
                                                this.setState({address_version_regex: this._address_version_regex.value});
                                            }}
                                            value={this.state.address_version_regex}/>
                                    </Col>
                                    <Col sm="2"
                                         md="1">
                                        <Button
                                            variant="outline-primary"
                                            size={'sm'}
                                            onClick={this.addAddressVersion.bind(this)}>
                                            <FontAwesomeIcon
                                                icon="plus"
                                                size="1x"/>
                                        </Button>
                                    </Col>
                                </Row>
                            </Form.Group>
                        </Col>

                        <div>
                            <DatatableView
                                value={this.state.datatables.address_version_list}
                                sortOrder={1}
                                showActionColumn={true}
                                resultColumn={[
                                    {
                                        field: 'version'
                                    },
                                    {
                                        field: 'regex_pattern'
                                    },
                                    {
                                        field: 'default_address'
                                    },
                                ]}/>
                        </div>
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
    })(withRouter(ConfigAddressVersion));
