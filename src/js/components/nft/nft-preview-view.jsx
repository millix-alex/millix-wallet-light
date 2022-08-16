import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import API from '../../api';
import {parse} from 'querystring';
import {TRANSACTION_DATA_TYPE_ASSET, TRANSACTION_DATA_TYPE_NFT} from '../../../config';
import * as format from '../../helper/format';
import {Button, Col, Row} from 'react-bootstrap';
import DatatableView from '../utils/datatable-view';
import Translation from '../../common/translation';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import ReloadTimeTickerView from '../utils/reload-time-ticker-view';
import moment from 'moment/moment';
import ModalView from '../utils/modal-view';


class NftPreviewView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            status                   : 'asset',
            image_data_parameter_list: [],
            image_data               : {},
            action                   : 'preview',
            nft_sync_timestamp       : moment.now(),
            modal_show_copy_result   : false
        };

        this.timeout_id = null;
    }

    componentDidMount() {
        const params = parse(this.props.location.search.slice(1));
        this.setState({
            image_data_parameter_list:
                {
                    transaction_id           : params.p0,
                    address_key_identifier_to: params.p1,
                    key                      : params.p2,
                    hash                     : params.p3
                }
        }, () => {
            if (params.type) {
                this.setAssetData();
            }
            else {
                this.setNftData();
            }
        });
    }

    componentWillUnmount() {
        clearTimeout(this.timeout_id);
    }

    setNftData() {
        API.getSyncNftTransaction(this.state.image_data_parameter_list).then(data => {
            this.setState({
                status            : data.status,
                image_data        : data.transaction_output_metadata,
                nft_sync_timestamp: moment.now()
            });
            if (data.status !== 'syncing') {
                clearTimeout(this.timeout_id);
                this.getImageDataWithDetails(TRANSACTION_DATA_TYPE_NFT).then(stateData => {
                    this.setState(stateData);
                });
            }
            else {
                setTimeout(() => this.setNftData(), 5000);
            }
        });
    }

    setAssetData() {
        this.getImageDataWithDetails(TRANSACTION_DATA_TYPE_ASSET).then(stateData => {
            this.setState(stateData);
        });
    }

    async getImageDataWithDetails(data_type) {
        return API.getNftImageWithKey(this.state.image_data_parameter_list).then(result => {
            return result.ok ? result.blob() : undefined;
        }).then(blob => {
            return API.listTransactionWithDataReceived(this.state.image_data_parameter_list.address_key_identifier_to, data_type).then(data => {
                const current_image_data = data.filter((entry) => entry.transaction_id === this.state.image_data_parameter_list.transaction_id)[0];
                return {
                    image_data: {
                        amount   : current_image_data.amount,
                        image_url: URL.createObjectURL(blob),
                        ...current_image_data.transaction_output_attribute[0].file_data,
                        current_image_data,
                        transaction_history_list: this.getTransactionHistoryList(data[0].transaction_output_attribute)
                    }
                };
            });
        });
    }

    getTransactionHistoryList(data) {
        return data.map((element) => {
            return {
                date: element.create_date,
                txid: element.transaction_id
            };
        });
    }

    getPreviewLink() {
        navigator.clipboard.writeText(window.location.href);
        this.setState({
            modal_show_copy_result: true
        });
    }

    render() {
        return (
            <div className={'panel panel-filled'}>
                <div className={'panel-heading bordered d-flex'}>
                    nft details


                    <div className={'ms-auto message_subject_action_container'}>
                        <Button
                            variant="outline-default"
                            size={'xs'}
                            onClick={() => this.setState({
                                // todo: open popover
                            })}>
                            <FontAwesomeIcon icon={'caret-down'}/>actions
                        </Button>
                        {/*<Button*/}
                        {/*    variant="outline-default"*/}
                        {/*    size={'xs'}*/}
                        {/*    onClick={() => this.setState({*/}
                        {/*        // modal_show_burn_confirmation: true,*/}
                        {/*        // nft_selected                : image_props*/}
                        {/*    })}>*/}
                        {/*    <FontAwesomeIcon className="text-warning"*/}
                        {/*                     icon={'bomb'}/>burn*/}
                        {/*</Button>*/}
                        {/*<Button*/}
                        {/*    variant="outline-default"*/}
                        {/*    size={'xs'}*/}
                        {/*    onClick={() => this.setState({*/}
                        {/*        // modal_show_burn_confirmation: true,*/}
                        {/*        // nft_selected                : image_props*/}
                        {/*    })}>*/}
                        {/*    transfer*/}
                        {/*</Button>*/}

                        {/*<a href={this.state.image_data.image_url} target={'_blank'} className={'btn btn-outline-default btn-xs'}>*/}
                        {/*    <FontAwesomeIcon icon={'eye'}/>raw image*/}
                        {/*</a>*/}
                    </div>


                </div>
                <div className={'panel-body'}>
                    {/*<Form.Group className="form-group">*/}
                    {/*    <label>public preview link</label>*/}
                    {/*    <Col className={'input-group'}>*/}
                    {/*        <Form.Control type="text" value={window.location.href} readOnly={true}/>*/}
                    {/*        <button*/}
                    {/*            className="btn btn-outline-input-group-addon icon_only"*/}
                    {/*            type="button"*/}
                    {/*            onClick={() => this.getPreviewLink()}>*/}
                    {/*            <FontAwesomeIcon*/}
                    {/*                icon={'copy'}/>*/}
                    {/*        </button>*/}
                    {/*    </Col>*/}
                    {/*</Form.Group>*/}

                    {this.state.status !== 'syncing' ?
                     <>
                         <div className={'nft-collection-img'}>
                             <a href={this.state.image_data.image_url} target={'_blank'} className={'mx-auto'}>
                                 <img src={this.state.image_data.image_url} alt={this.state.image_data.name}/>
                             </a>
                         </div>
                         <Row className={'nft-preview-description'}>
                             <Col>
                                 <div>
                                     <p className={'nft-name page_subtitle mb-0'}>{this.state.image_data.name}</p>
                                     <p className={'nft-description'}>{this.state.image_data.description}</p>
                                 </div>
                                 {/*{this.getRestoreNftButton()}*/}
                             </Col>
                         </Row>

                         <hr/>

                         <div className={'section_subtitle'}>
                             transfer history
                         </div>
                         <DatatableView
                             on_global_search_change={false}
                             value={this.state.image_data.transaction_history_list}
                             resultColumn={[
                                 {
                                     field : 'date',
                                     header: Translation.getPhrase('cd55d1db8')
                                     // data: this.transaction_data_type

                                 },
                                 {
                                     field : 'txid',
                                     header: Translation.getPhrase('da26d66d6')
                                 }
                             ]}/>
                     </>
                                                     :
                     <Row className={'align-items-center'}>
                         <Col md={5}>
                             <Button variant="outline-primary"
                                     size={'sm'}
                                     className={'refresh_button'}
                                     onClick={() => this.setNftData()}
                             >
                                 <FontAwesomeIcon
                                     icon={'sync'}
                                     size="1x"/>
                                 refresh
                             </Button>
                         </Col>
                         <Col md={7}>
                                <span>
                                    <ReloadTimeTickerView last_update_time={this.state.nft_sync_timestamp}/>
                                </span>
                         </Col>
                     </Row>}
                </div>
                <ModalView
                    show={this.state.modal_show_copy_result}
                    size={'lg'}
                    heading={'nft public preview link copied'}
                    on_close={() => this.setState({modal_show_copy_result: false})}
                    body={<div>
                        nft public preview link has been copied to clipboard
                    </div>}/>
            </div>
        );
    }

    getRestoreNftButton() {
        let button = '';
        if (this.state.status === 'asset') {
            button = <Button type="outline-primary"
                             onClick={() => {
                                 this.props.history.push('/nft-transfer', {
                                     ...this.state.image_data,
                                     src                        : this.state.image_data.image_url,
                                     txid                       : this.state.image_data.current_image_data.transaction_id,
                                     hash                       : this.state.image_data_parameter_list.hash,
                                     default_target_address_self: true,
                                     nft_transaction_type       : 'revoke'
                                 });
                             }}
            >
                revoke
            </Button>;
        }

        return button;
    }
}


export default connect(
    state => ({
        wallet: state.wallet
    })
)(withRouter(NftPreviewView));

