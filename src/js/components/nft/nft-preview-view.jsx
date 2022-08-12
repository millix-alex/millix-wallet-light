import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import API from '../../api';
import {parse} from 'querystring';
import {TRANSACTION_DATA_TYPE_ASSET, TRANSACTION_DATA_TYPE_NFT} from '../../../config';
import * as format from '../../helper/format';
import {Col, Row} from 'react-bootstrap';


class NftPreviewView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            status                   : '',
            image_data_parameter_list: [],
            image_data               : {}
        };
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

    setNftData() {
        API.getSyncNftTransaction(this.state.image_data_parameter_list).then(data => {
            this.setState({
                status    : data.status,
                image_data: data.transaction_output_metadata
            });
            if (data.status !== 'syncing') {
                this.getImageDataWithDetails(TRANSACTION_DATA_TYPE_NFT).then(stateData => {
                    this.setState(stateData);
                });
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
                return {
                    image_data: {
                        amount   : data[0].amount,
                        image_url: URL.createObjectURL(blob)
                    }
                };
            });
        });
    }

    render() {
        return (
            <div className={'panel panel-filled'}>
                <div className={'panel-heading bordered'}>{this.state.status}</div>
                <div className={'panel-body'}>
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
                             </Col>
                         </Row></>
                                                     :
                     <p>sync in process</p>}

                </div>
            </div>
        );
    }
}


export default connect(
    state => ({
        wallet: state.wallet
    })
)(withRouter(NftPreviewView));

