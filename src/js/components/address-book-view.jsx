import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Col, Form, Row} from 'react-bootstrap';
import {removeWalletAddressVersion, walletUpdateConfig} from '../redux/actions';
import DatatableView from './utils/datatable-view';
import ModalView from './utils/modal-view';
import ErrorList from './utils/error-list-view';
import API from '../api/index';
import * as validate from '../helper/validate';
import {bool_label} from '../helper/format';
import DatatableActionButtonView from './utils/datatable-action-button-view';
import Translation from '../common/translation';
import localforage from 'localforage';


class AddressBookView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal_show                : false,
            contacts_list      : [],
            datatable_reload_timestamp: new Date(),
            datatable_loading         : false,
            error_list                : [],
            edited_contact_index      : ''
        };
    }

    componentDidMount() {
        this.loadAddressBook();
    }

    changeModalAddContact = (value = true) => {
        this.setState({
            modal_show: value,
            error_list: [],
            edited_contact_index: value ? this.state.edited_contact_index : ''
        });
    }

    addContact = () => {
        let new_contact = {
            name: this.address_book_name.value,
            address: this.address_book_address.value
        }
        localforage.getItem('contactsList').then((contactsList) => {
            if (contactsList === null) {
                localforage.setItem('contactsList', [])
            }

            contactsList?.forEach((contact, index) => {
                if (contact.address == new_contact.address) {
                    this.setState({
                        edited_contact_index: index
                    })
                }
            })

            if (this.state.edited_contact_index !== '') {
                contactsList.forEach(() => {
                    contactsList[this.state.edited_contact_index] = new_contact
                })
            } else {
                contactsList.push(new_contact)}
            localforage.setItem('contactsList', contactsList)
            })
            .then(() => this.loadAddressBook());
            this.changeModalAddContact(false)
    }

    getChoosenContactIndex = (choosen_contact) => {
        localforage.getItem('contactsList').then((contactsList) => {
            contactsList.forEach((contact, index) => {
                if (contact.address == choosen_contact.address) {
                    this.setState({
                        edited_contact_index: index
                    })
                }
            })
        })
    }

    removeAddressBookContact = (choosen_contact) => {
        this.getChoosenContactIndex(choosen_contact)
        localforage.getItem('contactsList').then((contactsList) => {
            contactsList.splice(this.state.edited_contact_index, 1)
            localforage.setItem('contactsList', contactsList)
        }).then(() => this.loadAddressBook())
    }

    editAddressBookContact(choosen_contact){
        this.getChoosenContactIndex(choosen_contact)
        this.changeModalAddContact()
    }

    loadAddressBook() {
        this.setState({
            datatable_loading: true
        });
        localforage.getItem('contactsList')
           .then(data => {
               this.setContactsList(data);
           });
    }

    setContactsList(data) {
        this.setState({
            datatable_reload_timestamp: new Date(),
            datatable_loading         : false,
            contacts_list             : data?.map((input) => ({
                address: input.address,
                name   : input.name,
                action : 
                    <>
                        <DatatableActionButtonView
                        icon={'fa-solid fa-pencil'}
                        callback={() => this.editAddressBookContact(input)}
                        callback_args={input}
                        />
                        <DatatableActionButtonView
                        icon={'trash'}
                        callback={() => this.removeAddressBookContact(input)}
                        callback_args={input}
                        />
                    </>
            }))
        });
    }

    getAddressBookBody() {

        
        return <div>
            <Col>
                <ErrorList error_list={this.state.error_list}/>
            </Col>

            <Col>
                <Form.Group className="form-group">
                    <label>{'name'}</label>
                    <Form.Control
                        type="text"
                        ref={(c) => this.address_book_name = c}
                        defaultValue={'name'}
                    />
                </Form.Group>
            </Col>

            <Col>
                <Form.Group className="form-group">
                    <label>
                        {'address'}
                    </label>
                    <Row>
                        <Col>
                            <Form.Control
                                type="text"
                                ref={(c) => this.address_book_address = c}
                                defaultValue={'address'}
                            />
                        </Col>
                    </Row>
                </Form.Group>
            </Col>
        </div>;
    }

    render() {
        return <div>
            <ModalView
                show={this.state.modal_show}
                size={'lg'}
                prevent_close_after_accept={true}
                on_close={() => this.changeModalAddContact(false)}
                on_accept={() => this.addContact()}
                heading={'add contact'}
                body={this.getAddressBookBody()}/>
            <Form>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>
                        {'address book'}
                    </div>
                    <div className={'panel-body'}>
                        <div>
                            <DatatableView
                                reload_datatable={() => this.loadAddressBook()}
                                datatable_reload_timestamp={this.state.datatable_reload_timestamp}
                                loading={this.state.datatable_loading}
                                action_button_label={Translation.getPhrase('d0db52233')}
                                action_button={{
                                    label   : 'add new contact',
                                    on_click: () => this.changeModalAddContact()
                                }}
                                value={this.state.contacts_list}
                                sortField={'name'}
                                sortOrder={1}
                                showActionColumn={true}
                                resultColumn={[
                                    {
                                        field : 'name',
                                        header: 'name'
                                    },
                                    {
                                        field : 'address',
                                        header: 'address'
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
        config: state.config,
        wallet: state.wallet
    }),
    {
        walletUpdateConfig,
        removeWalletAddressVersion
    })(withRouter(AddressBookView));
