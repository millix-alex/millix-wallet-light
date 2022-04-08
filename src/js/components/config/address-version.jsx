import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Col, Form, Row} from 'react-bootstrap';
import {removeWalletAddressVersion, walletUpdateConfig} from '../../redux/actions';
import DatatableView from '../utils/datatable-view';
import ModalView from '../utils/modal-view';
import ErrorList from '../utils/error-list-view';
import API from '../../api/index';
import * as validate from '../../helper/validate';
import {bool_label} from '../../helper/format';
import DatatableActionButtonView from '../utils/datatable-action-button-view';


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
            address_version_list      : [],
            datatable_reload_timestamp: new Date(),
            error_list                : []
        };
    }

    componentDidMount() {
        this.setConfigToState();
    }

    showModalAddAddressVersion() {
        this.setState({
            modalAddAddressVersion: {
                status: true
            }
        });
    }

    addAddressVersion() {
        this.setState({
            error_list: []
        });
        let error_list = [];
        validate.required('version', this._address_version_name.value, error_list);
        validate.string('version', this._address_version_name.value, error_list, 4);
        validate.required('regex pattern', this._address_version_regex.value, error_list);

        if (error_list.length > 0) {
            this.setState({
                error_list: [
                    ...error_list
                ]
            });
            return;
        }

        const data = {
            version        : this._address_version_name.value,
            is_main_network: this.props.config.MODE_TEST_NETWORK ? 0 : 1,
            regex_pattern  : this._address_version_regex.value,
            is_default     : this.state.address_is_default ? 1 : 0
        };
        API.addWalletAddressVersion(data)
           .then(data => {
               if (!data || data.api_status === 'fail') {
                   this.setState({
                       error_list: [
                           {
                               name   : 'api error',
                               message: data.api_message ? data.api_message : 'bad request'
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
        if (load_from_api) {
            API.listWalletAddressVersion()
               .then(data => {
                   this.setAddressVersionList(data);
               });
        }
        else {
            this.setAddressVersionList(this.props.wallet.address_version_list);
        }
    }

    setAddressVersionList(data) {
        this.setState({
            datatable_reload_timestamp: new Date(),
            address_version_list      : data.map((input) => ({
                version        : input.version,
                regex_pattern  : input.regex_pattern,
                default_address: bool_label(input.is_default),
                action         : <DatatableActionButtonView
                    icon={'trash'}
                    callback={() => this.removeFromConfigList(input)}
                    callback_args={input}
                />
            }))
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
                        value={bool_label(this.state.address_is_default)}
                        onChange={(e) => {
                            this.setState({address_is_default: e.target.value === 'yes'});
                        }}
                    >
                        {Array.from([
                            bool_label(1),
                            bool_label(0)
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

    render() {
        return <div>
            <ModalView
                show={this.state.modalAddAddressVersion.status}
                size={'lg'}
                prevent_close_after_accept={true}
                on_close={() => this.hideModalAddAddressVersion()}
                on_accept={() => this.addAddressVersion()}
                heading={'address version'}
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
                                    on_click: () => this.showModalAddAddressVersion()
                                }}
                                value={this.state.address_version_list}
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
