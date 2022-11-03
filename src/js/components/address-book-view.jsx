import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Col, Form, Row} from 'react-bootstrap';
import {removeWalletAddressVersion, walletUpdateConfig} from '../redux/actions';
import DatatableView from './utils/datatable-view';
import ModalView from './utils/modal-view';
import ErrorList from './utils/error-list-view';
import DatatableActionButtonView from './utils/datatable-action-button-view';
import Translation from '../common/translation';
import localforage from 'localforage';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {Button} from 'react-bootstrap';


class AddressBookView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal_show                : false,
            contacts_list             : [],
            datatable_reload_timestamp: new Date(),
            datatable_loading         : false,
            error_list                : [],
            edited_contact_index      : '',
                error_list_upload: [],
                image: undefined,
                importedData: [],
                importedCols: [{ field: '', header: 'Header' }]
        };
        
        this.importCSV = this.importCSV.bind(this);
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
        localforage.getItem('contacts_list').then((contacts_list) => {
            if (contacts_list === null) {
                contacts_list = []
                localforage.setItem('contacts_list', contacts_list)
            }
                return contacts_list
            }).then((contacts_list) => {
                if (this.state.importedData.length !== 0) {
                    contacts_list = contacts_list.concat(this.state.importedData.filter( ({id}) => !contacts_list.find(f => f.id == id)));
                } else if (this.state.edited_contact_index !== '') {
                    contacts_list.forEach((contact, index) => {
                        if (index == this.state.edited_contact_index) {
                            contact.name = this.address_book_name.value
                            contact.address = this.address_book_address.value
                        }
                    })
                } else {
                    let new_contact = {
                        id: Date.now(),
                        name: this.address_book_name?.value,
                        address: this.address_book_address?.value
                    }
                    contacts_list.push(new_contact)
            }
            localforage.setItem('contacts_list', contacts_list)
            }).then(() => this.loadAddressBook()).then(() => this.changeModalAddContact(false))
            this.setState({importedData: []})
    }
        
    getChoosenContactIndex = (choosen_contact) => {
        localforage.getItem('contacts_list').then((contacts_list) => {
            contacts_list.forEach((contact, index) => {
                if (contact.id == choosen_contact.id) {
                    this.setState({
                        edited_contact_index: index
                    })
                }
            })
        })
    }

    removeAddressBookContact = (choosen_contact) => {
        this.getChoosenContactIndex(choosen_contact)
        localforage.getItem('contacts_list').then((contacts_list) => {
            contacts_list.splice(this.state.edited_contact_index, 1)
            localforage.setItem('contacts_list', contacts_list)
            })
            .then(() => this.setState({
                edited_contact_index: ''
            }))
            .then(() => this.loadAddressBook())
    }

    editAddressBookContact(choosen_contact){
        this.getChoosenContactIndex(choosen_contact)
        this.changeModalAddContact()
    }

    loadAddressBook() {
        this.setState({
            datatable_loading: true
        });
        localforage.getItem('contacts_list')
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
        let name, address;
        if (this.state.edited_contact_index !== '') {
            this.state.contacts_list.forEach((contact, index) => {
                if (index === this.state.edited_contact_index) {
                name = contact.name
                address = contact.address
                }
            }) 
        }

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
                        defaultValue={name}
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
                                defaultValue={address}
                            />
                        </Col>
                    </Row>
                </Form.Group>
            </Col>
        </div>;
    }

    toCapitalize(s) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    importCSV(e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const csv = e.target.result;
            const data = csv.replace('\r', '').split('\n').slice(0, -1);
            const cols = data[0].replace(/['"]+/g, '').split(',');
            data.shift();
            let importedCols = cols.map(col => ({ field: col, header: this.toCapitalize(col.replace(/['"]+/g, '')) }));
            let importedData = data.map(d => {
                d = d.split(',');
                return cols.reduce((obj, c, i) => {
                    obj[c] = d[i]?.replace(/['"]+/g, '');
                    return obj;
                }, {});
            });

            this.setState({
                importedCols,
                importedData
            });
        };
        
        reader.readAsText(file, 'UTF-8');
        this.addContact()
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
                        <input type="file" name="file" onChange={this.importCSV}></input>
                        <button 
                            onChange={this.importCSV}>sdfsefds
                                
                            </button>
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
                                selectionMode={this.props.selectionMode}
                                onRowClick={this.props.onRowClick}
                                showActionColumn={this.props.showActionColumn != null ? this.props.showActionColumn : true}
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
