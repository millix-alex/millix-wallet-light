import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Button, Col, Form, Row} from 'react-bootstrap';
import {removeWalletAddressVersion, walletUpdateConfig} from '../../redux/actions';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import DatatableView from '../utils/datatable-view';
import ModalView from '../utils/modal-view';
import ErrorList from '../utils/error-list-view';
import API from '../../api/index';


class AddressVersion extends Component {

    constructor(props) {
        super(props);
        this.state = {
            modalAddAddressVersion    : {
                status: false,
                title : ''
            },
            address_version_name      : '',
            address_version_regex     : '',
            address_is_default        : false,
            node_public_ip            : '',
            datatables                : [],
            datatable_reload_timestamp: new Date(),
            error_list                : []
        };
    }

    componentDidMount() {
        this.setConfigToState();
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
        this.setState({
            error_list: []
        });
        const data = {
            version        : this._address_version_name.value,
            is_main_network: this.props.config.MODE_TEST_NETWORK ? 0 : 1,
            regex_pattern  : this._address_version_regex.value,
            is_default     : this.state.address_is_default ? 1 : 0
        };

        API.addWalletAddressVersion(data)
           .then(data => {
               if (data.api_status === 'fail') {
                   this.setState({
                       error_list: [
                           {
                               name   : 'api error',
                               message: data.api_message
                           }
                       ]
                   });
                   return;
               }
               this.setState({
                   address_version_name : '',
                   address_version_regex: '',
                   address_is_default   : false
               });

               this.setConfigToState(true);
               this.hideModalAddAddressVersion();
           });

    }


    removeFromConfigList(addressVersion) {
        let result = this.props.removeWalletAddressVersion(addressVersion);
        result.then(() => {
            this.setConfigToState(true);
        });
    }

    setConfigToState(load_from_api = false) {
        let address_version_list = this.props.wallet.address_version_list;
        if (load_from_api) {
            try {
                API.listWalletAddressVersion()
                   .then(data => {
                       this.setState({
                           datatable_reload_timestamp: new Date(),
                           datatables                : {
                               address_version_list: data.map((input) => ({
                                   version        : input.version,
                                   regex_pattern  : input.regex_pattern,
                                   default_address: input.is_default === 1 ? 'yes' : 'no',
                                   action         : this.getRemoveWalletAddressVersionButton(input)
                               }))
                           }
                       });
                   });
                return;
            }
            catch (e) {
                this.setState({
                    error_list: [
                        {
                            name   : 'api error',
                            message: 'error'
                        }
                    ]
                });
            }
        }
        this.setState({
            datatable_reload_timestamp: new Date(),
            datatables                : {
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
                <ErrorList error_list={this.state.error_list}/>
                <Form.Group className="form-group">
                    <label>default address</label>
                    <Form.Select
                        className={'paginator-dropdown-wrapper'}
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
                    </Form.Select>
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
                prevent_close_after_accept={true}
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
                                reload_datatable={() => this.setConfigToState(true)}
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
        removeWalletAddressVersion
    })(withRouter(AddressVersion));
