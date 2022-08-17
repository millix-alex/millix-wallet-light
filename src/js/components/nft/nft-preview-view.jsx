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
import DatatableActionButtonView from '../utils/datatable-action-button-view';
import {date} from '../../helper/format';


class NftPreviewView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            status                   : 'asset',
            image_data_parameter_list: [],
            image_data               : {},
            image_url                : '',
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
                    hash                     : params.p3,
                    metadata_hash            : params.p4
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

    async setNftData() {
        const image_sync_result    = await API.getSyncNftTransaction(this.state.image_data_parameter_list);
        const metadata_sync_result = await API.getSyncNftTransaction(this.state.image_data_parameter_list, true);
        this.setState({
            status            : image_sync_result.status,
            nft_sync_timestamp: moment.now()
        });
        if (image_sync_result.status !== 'syncing' || metadata_sync_result.status !== 'syncing') {
            clearTimeout(this.timeout_id);
            await this.setImageUrl();
            const transaction_list = await API.listTransactionWithDataReceived(this.state.image_data_parameter_list.address_key_identifier_to, TRANSACTION_DATA_TYPE_NFT);
            const image_data       = transaction_list.filter((entry) => entry.transaction_id === this.state.image_data_parameter_list.transaction_id)[0];
            this.setState({
                image_data: {
                    ...metadata_sync_result.transaction_output_metadata.file_data[this.state.image_data_parameter_list.metadata_hash],
                    amount: image_data.amount,
                    transaction_history_list: this.getTransactionHistoryList(image_data.transaction_output_attribute)
                }
            });
        }
        else {
            setTimeout(() => this.setNftData(), 30000);
        }
    }

    setAssetData() {
        this.getImageDataWithDetails(TRANSACTION_DATA_TYPE_ASSET).then(stateData => {
            this.setState(stateData);
        });
    }

    async setImageUrl() {
        const response_result = await API.getNftImageWithKey(this.state.image_data_parameter_list);
        if (response_result.ok) {
            response_result.blob().then(data => {
                this.setState({
                    image_url: URL.createObjectURL(data)
                });
            });


        }
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
                        ...current_image_data.transaction_output_attribute[0].value.file_data[this.state.image_data_parameter_list.metadata_hash],
                        current_image_data,
                        transaction_history_list: this.getTransactionHistoryList(data[0].transaction_output_attribute)
                    },
                    image_url: URL.createObjectURL(blob),
                };
            });
        });
    }

    getTransactionHistoryList(data) {
        return data.map((element) => {
            return {
                date  : date(element.create_date),
                txid  : element.transaction_id,
                action: <>
                    <DatatableActionButtonView
                        history_path={'/transaction/' + encodeURIComponent(element.transaction_id)}
                        history_state={[element]}
                        icon={'eye'}/>
                </>

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
                <div className={'panel-heading bordered'}>{this.state.status}</div>
                <div className={'panel-body'}>
                    <Button variant="outline-primary"
                            size={'sm'}
                            className={'copy-link-button'}
                            onClick={() => {
                                this.getPreviewLink();
                            }}
                    >
                        <FontAwesomeIcon icon={'copy'}/>
                    </Button>
                    <p>
                        {this.state.status}
                    </p>
                    {this.state.status !== 'syncing' ?
                     <>
                         <div className={'nft-collection-img'}>
                             <img src={this.state.image_url} alt={this.state.image_data.name}/>
                         </div>
                         <Row className={'nft-preview-description'}>
                             <Col>
                                 <div>
                                     <p className={'transfer-subtitle'}>name</p>
                                     <p>{this.state.image_data.name}</p>
                                 </div>
                                 <div>
                                     <p className={'transfer-subtitle'}>description</p>
                                     <p>{this.state.image_data.description}</p>
                                 </div>
                                 <div>
                                     <p className={'transfer-subtitle'}>amount</p>
                                     <p>{format.millix(this.state.image_data.amount)}</p>
                                 </div>
                                 {this.getRestoreNftButton()}
                             </Col>
                         </Row>

                         <div className={'panel_transfer panel-filled'}>

                             <Row id={'txhistory'}>
                                 <DatatableView
                                     on_global_search_change={false}
                                     value={this.state.image_data.transaction_history_list}
                                     resultColumn={[
                                         {
                                             field : 'date',
                                             header: Translation.getPhrase('cd55d1db8')
                                         },
                                         {
                                             field : 'txid',
                                             header: Translation.getPhrase('da26d66d6')
                                         },
                                         {
                                             field : 'action',
                                             header: Translation.getPhrase('012bb6684')

                                         }
                                     ]}/>
                             </Row>

                         </div>

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
                    heading={'nft share link copied'}
                    on_close={() => this.setState({modal_show_copy_result: false})}
                    body={<div>
                        share link has been copied to clipboard
                    </div>}/>
            </div>
        );
    }

    getRestoreNftButton() {
        /*let button = '';
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
         }*/

        return '';
    }
}


export default connect(
    state => ({
        wallet: state.wallet
    })
)(withRouter(NftPreviewView));

