import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Button, Col, Form, Row} from 'react-bootstrap';
import {addWalletAddressVersion, removeWalletAddressVersion, walletUpdateConfig} from '../../redux/actions';
import _ from 'lodash';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import DatatableView from '../utils/datatable-view';
import ModalView from '../utils/modal-view';


class AddressVersion extends Component {

    constructor(props) {
        super(props);
        this.state = {
            modalAddAddressVersion: {
                status: false,
                title : ''
            },
            address_version_name  : '',
            address_version_regex : '',
            address_is_default    : false,
            node_public_ip        : '',
            datatables            : [],
            datatable_reload_timestamp: new Date()
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


    showModalAddAddressVersion(callback, title) {
        this.setState({
            modalAddAddressVersion: {
                status: true,
                title : title
            }
        });
    }

    addAddressVersion() {
        const data = {
            version        : this._address_version_name.value,
            is_main_network: this.props.config.MODE_TEST_NETWORK ? 0 : 1,
            regex_pattern  : this._address_version_regex.value,
            is_default     : this.state.address_is_default ? 1 : 0
        };

        let result = this.props.addWalletAddressVersion(data);
        result.then((response) => {
            Object.keys(response.payload).forEach(key => {
                if (response.payload[key].version === this.state.address_version_name && response.payload[key].regex_pattern === this.state.address_version_regex) {
                    console.log('saved');
                }
            });

            this.setState({
                address_version_name : '',
                address_version_regex: '',
                address_is_default   : false
            });

            this.hideModalAddAddressVersion();
            this.setConfigToState(response.payload);
        });
    }


    removeFromConfigList(addressVersion) {
        let result = this.props.removeWalletAddressVersion(addressVersion);
        result.then(() => {
            this.setConfigToState();
        });
    }

    setConfigToState(address_version_list = null) {
        if (address_version_list === null) {
            address_version_list = this.props.wallet.address_version_list;
        }
        this.setState({
            datatable_reload_timestamp: new Date(),
            datatables: {
                address_version_list: address_version_list.map((input) => ({
                    version        : input.version,
                    regex_pattern  : input.regex_pattern,
                    default_address: input.is_default === 1 ? 'yes' : 'no',
                    action         : this.getRemoveWalletAddressVersionButton(input)
                }))
            }
        });
    }

    hideModalAddAddressVersion() {
        this.setState({
            modalAddAddressVersion: {
                status: false
            }
        });
    }

    getAddressVersionBody() {
        return <div>
            <Col>
                <Form.Group className="form-group">
                    <label>default address</label>
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
                    <label>
                        regex pattern
                    </label>
                    <Row>
                        <Col>
                            <Form.Control
                                type="text"
                                placeholder=""
                                ref={(c) => this._address_version_regex = c}
                                onChange={() => {
                                    this.setState({address_version_regex: this._address_version_regex.value});
                                }}
                                value={this.state.address_version_regex}/>
                        </Col>
                    </Row>
                </Form.Group>
            </Col>
        </div>;
    }

    getRemoveWalletAddressVersionButton(addressVersion) {
        return <Button
            variant="outline-default"
            onClick={() => this.removeFromConfigList(addressVersion)}
            className={'btn-xs icon_only ms-auto'}>
            <FontAwesomeIcon
                icon={'trash'}
                size="1x"/>
        </Button>;
    }

    getAddressVersionModal() {
        return <Form>
            <Form.Control
                type="text"
                placeholder="node id"
                onChange={(e) => {
                    this.setState({current_connections: {NODE_CONNECTION_INBOUND_WHITELIST: e.target.value}});
                }}/>
        </Form>;
    }

    render() {
        return <div>
            <ModalView
                show={this.state.modalAddAddressVersion.status}
                size={'lg'}
                on_close={() => this.hideModalAddAddressVersion()}
                on_accept={() => this.addAddressVersion()}
                heading={this.state.modalAddAddressVersion.title}
                body={this.getAddressVersionBody()}/>
            <Form>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>
                        address version
                    </div>
                    <div className={'panel-body'}>
                        <div>
                            <DatatableView
                                reload_datatable={() => this.setConfigToState()}
                                datatable_reload_timestamp={this.state.datatable_reload_timestamp}
                                action_button_label={'add address version'}
                                action_button={{
                                    label   : 'add address version',
                                    on_click: () => this.showModalAddAddressVersion(this.getAddressVersionModal, 'address version')
                                }}
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
                                    }
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
    })(withRouter(AddressVersion));
