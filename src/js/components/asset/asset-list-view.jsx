import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {Button, Card, Col, Row} from 'react-bootstrap';
import API from '../../api';
import {connect} from 'react-redux';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import async from 'async';
import utils from '../../helper/utils';
import {TRANSACTION_DATA_TYPE_ASSET} from '../../../config';
import ReloadTimeTickerView from '../utils/reload-time-ticker-view';
import moment from 'moment';
import {changeLoaderState} from '../loader';


class AssetListView extends Component {
    constructor(props) {
        super(props);
        this.datatable_reload_interval = undefined;
        this.state                     = {
            asset_list                 : [],
            datatable_loading          : false,
            asset_list_reload_timestamp: moment.now()
        };
    }

    componentDidMount() {
        this.reloadAssetList();
        this.datatable_reload_interval = setInterval(() => this.reloadAssetList(), 60000);
    }

    componentWillUnmount() {
        clearInterval(this.datatable_reload_interval);
        this.state.asset_list.forEach(asset => asset.src && URL.revokeObjectURL(asset.src));
    }

    reloadAssetList() {
        changeLoaderState(true);
        this.setState({
            datatable_loading: true
        });

        return API.listTransactionWithDataReceived(this.props.wallet.address_key_identifier, TRANSACTION_DATA_TYPE_ASSET).then(data => {
            async.mapLimit(data, 6, (row, callback) => {
                utils.getImageFromApi(row)
                     .then(image_data => {
                         image_data.image_detail_list         = row.transaction_output_attribute[0];
                         image_data.address_key_identifier_to = row.address_key_identifier_to;
                         callback(null, image_data);
                     });
            }, (err, assetList) => {
                changeLoaderState(false);
                this.setState({
                    asset_list                 : assetList,
                    datatable_loading          : false,
                    asset_list_reload_timestamp: moment.now()
                });
            });
        });
    }

    redirectToPreview(nft_data) {
        API.getNftKey(nft_data).then(({key}) => {
            const path = `/nft-preview/?p0=${nft_data.image_detail_list.transaction_id}&p1=${nft_data.address_key_identifier_to}&p2=${key}&p3=${nft_data.hash}&type=asset`;
            this.props.history.push(path);
        });
    }

    renderAsset(asset_list) {
        let asset_list_formatted = [];
        for (const image_props of asset_list) {
            const {
                      src,
                      alt,
                      image_detail_list
                  } = image_props;
            asset_list_formatted.push(
                <Col xs={12} md={3} className={'mt-3'} key={image_detail_list.transaction_id}>
                    <Card className={'nft-card'}>
                        <div className={'nft-collection-img'}>
                            <img src={src} alt={alt}/>
                        </div>
                        <Card.Body>
                            <div className={'nft-name page_subtitle'}>{image_detail_list.file_data?.name}</div>
                            <p className={'nft-description'}>{image_detail_list.file_data?.description}</p>
                            <div className={'nft-action-section'}>
                                <Button variant="outline-primary"
                                        size={'sm'}
                                        className={'preview_button_asset'}
                                        onClick={() => this.redirectToPreview(image_props)}>
                                    <FontAwesomeIcon icon={'eye'}/>details
                                </Button>
                                <Button variant="outline-primary"
                                        size={'sm'}
                                        className={'preview_button_trans'}
                                        onClick={() => this.props.history.push('/transaction/' + image_props.txid)}
                                >
                                    <FontAwesomeIcon icon={'list'}/>
                                    transaction
                                </Button>

                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            );
        }
        return <>{asset_list_formatted}</>;
    }

    render() {
        const asset_list = this.renderAsset(this.state.asset_list);
        return (
            <>
                <div className={'panel panel-filled'}>
                    <div className={'panel-body'} style={{textAlign: 'center'}}>
                        <div>
                            <p>
                                use this address to receive assets
                            </p>
                        </div>
                        <div className={'primary_address'}>
                            {this.props.wallet.address_public_key}{this.props.wallet.address_key_identifier.startsWith('1') ? '0b0' : 'lb0l'}{this.props.wallet.address_key_identifier}
                        </div>
                    </div>
                </div>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>asset list
                    </div>
                    <div className={'panel-body'}>
                        <p>
                            assets are files sent to you on the millix network. unlike nfts, assets do not include a history of ownership or proof of validity.
                            assets can be sent to other users but they don’t have the value potential of nft files.
                        </p>
                        <Row className={'align-items-center row'}>
                            <Col md={5}>
                                <Button variant="outline-primary"
                                        size={'sm'}
                                        className={'refresh_button'}
                                        onClick={() => this.reloadAssetList()}
                                >
                                    <FontAwesomeIcon
                                        icon={'sync'}
                                        size="1x"/>
                                    refresh
                                </Button>
                            </Col>
                            <Col md={7}>
                                    <span>
                                        <ReloadTimeTickerView last_update_time={this.state.asset_list_reload_timestamp}/>
                                    </span>
                            </Col>
                        </Row>
                        <Row>
                            {asset_list}
                        </Row>
                    </div>
                </div>
            </>
        );
    }
}


export default connect(
    state => ({
        wallet: state.wallet
    })
)(withRouter(AssetListView));
