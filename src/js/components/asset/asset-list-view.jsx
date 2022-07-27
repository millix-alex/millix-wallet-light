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
            asset_list                     : [],
            datatable_loading              : false,
            nft_asset_list_reload_timestamp: moment.now()
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
                         image_data.image_details = row.transaction_output_attribute[0];
                         callback(null, image_data);
                     });
            }, (err, assetList) => {
                changeLoaderState(false);
                this.setState({
                    asset_list                     : assetList,
                    datatable_loading              : false,
                    nft_asset_list_reload_timestamp: moment.now()
                });
            });
        });
    }

    renderNftImage(nft_list) {
        let nft_list_formatted = [];
        for (const image_props of nft_list) {
            const {
                      src,
                      alt,
                      image_details
                  } = image_props;
            nft_list_formatted.push(
                <Col xs={12} md={3} className={'mt-4'} key={image_details.transaction_id}>
                    <Card className={'nft-card'}>
                        <div className={'nft-collection-img'}>
                            <img src={src} alt={alt}/>
                        </div>
                        <Card.Body>
                            <div className={'nft-name page_subtitle'}>{image_details.value.name}</div>
                            <p className={'nft-description'}>{image_details.value.description}</p>
                            <div className={'nft-action-section'}>

                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            );
        }
        return <>{nft_list_formatted}</>;
    }

    render() {
        const nft_row_list = this.renderNftImage(this.state.asset_list);
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
                                        <ReloadTimeTickerView last_update_time={this.state.nft_asset_list_reload_timestamp}/>
                                    </span>
                            </Col>
                        </Row>
                        <Row style={{marginTop: 10}}>
                            {nft_row_list}
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

