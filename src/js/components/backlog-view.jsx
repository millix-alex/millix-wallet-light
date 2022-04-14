import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {Col} from 'react-bootstrap';
import {connect} from 'react-redux';
import {updateNetworkState} from '../redux/actions';
import DatatableView from './utils/datatable-view';
import API from '../api';
import * as text from '../helper/text';
import ModalView from './utils/modal-view';


class BacklogView extends Component {
    constructor(props) {
        super(props);
        this.update_handler = null;
        this.state         = {
            backlog_list              : [],
            datatable_loading         : false,
            datatable_reload_timestamp: new Date(),
            modal_show                : false
        };
    }

    loadBacklogToState() {
        this.setState({
            datatable_loading: true
        });

        API.listBacklog()
           .then(data => {
               let backlog = [];
               if (data.backlog_list) {
                   backlog = Object.values(data.backlog_list);
               }
               backlog.forEach((element, index) => {
                   backlog[index]['id'] = index;
               });
               this.setState({
                   backlog_list              : backlog,
                   datatable_reload_timestamp: new Date(),
                   datatable_loading         : false
               });
           });
    }

    resetBacklog() {
        API.resetBacklog()
           .then(() => {
               this.showModal(false);
               this.loadBacklogToState();
           });
    }

    showModal(value = true) {
        this.setState({
            modal_show: value
        });
    }

    componentDidMount() {
        this.loadBacklogToState();
        this.update_handler = setInterval(() => this.loadBacklogToState(), 10000);
    }

    componentWillUnmount() {
        clearTimeout(this.update_handler);
    }

    render() {
        return (<Col md="12">
            <div className={'panel panel-filled'}>
                <ModalView show={this.state.modal_show}
                           size={'lg'}
                           heading={'reset backlog'}
                           on_close={() => this.showModal(false)}
                           on_accept={() => this.resetBacklog()}
                           body={<div>
                               <div>
                                   continuing will reset backlog of your node.
                               </div>
                               {text.get_confirmation_modal_question()}
                           </div>}/>
                <div className={'panel-heading bordered'}>
                    backlog
                </div>
                <div className={'panel-body'}>
                    <div className={'form-group'}>
                        <span>backlog size is calculated from items with key "transaction". this page display every backlog size item.</span>
                    </div>
                    <DatatableView
                        reload_datatable={() => this.loadBacklogToState()}
                        datatable_reload_timestamp={this.state.datatable_reload_timestamp}
                        action_button={{
                            label   : 'reset backlog',
                            on_click: () => this.showModal()
                        }}
                        value={this.state.backlog_list}
                        sortField={'node_idx'}
                        loading={this.state.datatable_loading}
                        sortOrder={-1}
                        resultColumn={[
                            {
                                field : 'id',
                                header: 'id'
                            },
                            {
                                field : 'datetime',
                                header: 'date'
                            },
                            {
                                field : 'timestamp',
                                header: 'timestamp'
                            },
                            {
                                field : 'type',
                                header: 'type'
                            }
                        ]}/>
                </div>
            </div>
        </Col>);
    }
}


export default connect(
    state => ({
        backlog: state.backlog
    }), {
        updateNetworkState
    })(withRouter(BacklogView));
