import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import API from '../../api';
import {parse} from 'querystring';
import {TRANSACTION_DATA_TYPE_NFT} from '../../../config';
import * as format from '../../helper/format';
import {Col, Row} from 'react-bootstrap';


class NftPreviewView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            status                   : [],
            image_data_parameter_list: [],
            image_url                : '',
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
            this.getNftData();
        });
    }

    getNftData() {
        API.getSyncNftTransaction(this.state.image_data_parameter_list).then(data => {
            if (data.status === 'syncing') {
                this.setState({
                    status: data.status
                });
            }
            else {
                API.getNftImageWithHash(this.state.image_data_parameter_list).then(result => {
                    return result.ok ? result.blob() : undefined;
                }).then(blob => {
                    this.setState({
                        image_url: URL.createObjectURL(blob)
                    });
                    API.listTransactionWithDataReceived(this.state.image_data_parameter_list.address_key_identifier_to, TRANSACTION_DATA_TYPE_NFT).then(data => {
                        this.setState({
                            image_data: {
                                name       : data[0].transaction_output_attribute[0].value.name,
                                description: data[0].transaction_output_attribute[0].value.description,
                                amount     : data[0].amount
                            },
                            status    : data.status
                        });
                    });
                });
            }
        });
    }

    render() {
        return (
            <div className={'panel panel-filled'}>
                <div className={'panel-heading bordered'}>syncing</div>
                <div className={'panel-body'}>
                    <p>
                        {this.state.status}
                    </p>
                    <div className={'nft-collection-img'}>
                        <img src={this.state.image_url} alt={'adsas'}/>
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
                    </Row>
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

