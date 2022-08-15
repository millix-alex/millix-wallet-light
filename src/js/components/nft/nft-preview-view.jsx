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


class NftPreviewView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            status                   : 'asset',
            image_data_parameter_list: [],
            image_data               : {},
            action                   : 'preview'
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
                status    : data.status,
                image_data: data.transaction_output_metadata
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
                        transaction_history_list: this.getTransactionHistoryList(data[0].transaction_output_attribute),
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
            }
        })
    }

    getPreviewLink() {
        navigator.clipboard.writeText(window.location.href);
    }

    render() {
        return (
            <div className={'panel panel-filled'}>
                <div className={'panel-heading bordered'}>{this.state.status}</div>
                <div className={'panel-body'}>
                    <Button variant="outline-primary"
                            size={'sm'}
                            className={'copy_link_button'}
                            onClick={() => {
                                this.getPreviewLink();
                            }}
                    >
                        copy
                    </Button>
                    <p>
                        {this.state.status}
                    </p>
                    {this.state.status !== 'syncing' ?
                     <>
                         <div className={'nft-collection-img'}>
                             <img src={this.state.image_data.image_url} alt={this.state.image_data.name}/>
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
                                             header: Translation.getPhrase('cd55d1db8'),
                                             // data: this.transaction_data_type

                                         },
                                         {
                                             field : 'txid',
                                             header: Translation.getPhrase('da26d66d6')
                                         }
                                     ]}/>
                             </Row>

                         </div>

                     </>
                                                     :
                     <p>sync in process</p>}
                </div>
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
                                     default_target_address_self: true,
                                     nft_transaction_type       : 'revoke',
                                 })
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

