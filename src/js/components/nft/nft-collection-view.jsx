import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {Button, Card, Col, Form, Row} from 'react-bootstrap';
import API from '../../api';
import PhotoAlbum from 'react-photo-album';
import {connect} from 'react-redux';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import * as format from '../../helper/format';
import * as svg from '../../helper/svg';
import ModalView from '../utils/modal-view';
import * as text from '../../helper/text';
import {changeLoaderState} from '../loader';
import Transaction from '../../common/transaction';
import async from 'async';
import utils from '../../helper/utils';
import {TRANSACTION_DATA_TYPE_ASSET, TRANSACTION_DATA_TYPE_NFT, TRANSACTION_DATA_TYPE_TRANSACTION} from '../../../config';
import HelpIconView from '../utils/help-icon-view';


class NftCollectionView extends Component {
    constructor(props) {
        super(props);
        this.datatable_reload_interval = undefined;
        this.state                     = {
            nft_list                    : [],
            nft_selected                : undefined,
            datatable_reload_timestamp  : '',
            datatable_loading           : false,
            modal_show_burn_confirmation: false,
            modal_show_burn_result      : false,
            modal_burn_create_asset     : true,
            modal_body_burn_result      : []
        };
    }

    componentDidMount() {
        this.reloadCollection();
        this.datatable_reload_interval = setInterval(() => this.reloadCollection(), 60000);
    }

    componentWillUnmount() {
        clearInterval(this.datatable_reload_interval);
        this.state.nft_list.forEach(nft => nft.src && URL.revokeObjectURL(nft.src));
    }

    reloadCollection() {
        this.setState({
            datatable_loading: true
        });

        return API.listTransactionWithDataReceived(this.props.wallet.address_key_identifier, TRANSACTION_DATA_TYPE_NFT).then(data => {
            async.mapLimit(data, 6, (row, callback) => {
                utils.getImageFromApi(row)
                     .then(image_data => {
                         image_data.image_details = row.transaction_output_attribute[0];
                         callback(null, image_data);
                     });
            }, (err, nftList) => {
                this.setState({
                    nft_list                  : nftList,
                    datatable_reload_timestamp: new Date(),
                    datatable_loading         : false
                });
            });
        });
    }

    cancelNftBurn() {
        this.setState({
            nft_selected                : undefined,
            modal_show_burn_confirmation: false,
            modal_burn_create_asset     : true
        });
    }

    prepareTransactionOutputToBurnNft(nft, keepAsAsset) {
        return {
            transaction_output_attribute: {
                parent_transaction_id: nft.txid
            },
            transaction_data            : {
                file_hash        : nft.hash,
                attribute_type_id: 'Adl87cz8kC190Nqc'
            },
            transaction_data_type       : keepAsAsset ? TRANSACTION_DATA_TYPE_ASSET : TRANSACTION_DATA_TYPE_TRANSACTION,
            transaction_data_type_parent: TRANSACTION_DATA_TYPE_NFT,
            transaction_output_list     : [
                {
                    address_base          : this.props.wallet.address_key_identifier,
                    address_version       : this.props.wallet.address_key_identifier.startsWith('1') ? '0a0' : 'la0l',
                    address_key_identifier: this.props.wallet.address_key_identifier,
                    amount                : nft.amount
                }
            ],
            transaction_output_fee      : {
                fee_type: 'transaction_fee_default',
                amount  : 1000
            }
        };
    }

    doNftBurn() {
        const keepAsAsset = this.state.modal_burn_create_asset;

        changeLoaderState(true);
        let transaction_output_payload = this.prepareTransactionOutputToBurnNft(this.state.nft_selected, keepAsAsset);
        const newState                 = {
            modal_show_burn_result      : true,
            modal_show_burn_confirmation: false,
            modal_burn_create_asset     : true
        };

        Transaction.sendTransaction(transaction_output_payload, true, false).then(() => {
            this.reloadCollection();
            this.setState(newState);
            changeLoaderState(false);
        }).catch((error) => {
            this.setState({
                ...error,
                ...newState
            });
            changeLoaderState(false);
        });
    }

    renderNftImage({
                       imageProps,
                       photo
                   }) {
        const {
                  src,
                  alt,
                  srcSet,
                  sizes,
                  ...restImageProps
              } = imageProps;
        return (<Card className={'nft-card'}>
            <Card.Img variant="top" src={src} alt={alt} {...(srcSet ? {
                srcSet,
                sizes
            } : null)} {...restImageProps} style={{maxWidth: 800}}/>
            <Card.Body>
                <Card.Title style={{
                    width   : `calc(${sizes} - 4vw)`,
                    maxWidth: 720
                }}>{photo.image_details.value.name}</Card.Title>
                <p>{photo.image_details.value.nft_description}</p>
                <div className={'nft-value-container card-text'}>
                    {svg.millix_logo()}
                    <div className={'millix-value'}>
                        <span>{format.millix(photo.amount, false)}</span>
                    </div>
                </div>
                <div style={{
                    display      : 'flex',
                    flex         : 1,
                    flexDirection: 'row'
                }}>
                    <Button variant="primary" onClick={restImageProps.onClick}>transfer</Button>
                    <div style={{
                        flex         : 1,
                        display      : 'flex',
                        flexDirection: 'row-reverse'
                    }}>
                        <Button
                            className="icon_only"
                            variant="outline-secondary"
                            onClick={() => this.setState({
                                modal_show_burn_confirmation: true,
                                nft_selected                : photo
                            })}>
                            <FontAwesomeIcon
                                icon={'chain-slash'}/>
                        </Button>
                    </div>
                </div>
            </Card.Body>
        </Card>);
    }

    render() {
        return (
            <>
                <div className={'panel panel-filled'}>
                    <div className={'panel-body'} style={{textAlign: 'center'}}>
                        <div>
                            <p>
                                use this address to receive nfts
                            </p>
                        </div>
                        <div className={'primary_address'}>
                            {this.props.wallet.address_public_key}{this.props.wallet.address_key_identifier.startsWith('1') ? '0b0' : 'lb0l'}{this.props.wallet.address_key_identifier}
                        </div>
                    </div>
                </div>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>collection
                    </div>
                    <div className={'panel-body'}>
                        <p>
                            NFT files are different than normal media files. when you create or receive an NFT in a millix transaction,
                            the funds are not available in your wallet balance. this preserves and protects the provenance and ownership of the NFT asset.
                            if you burn an NFT you are destroying the provenance and proof of ownership of the NFT and the funds stored in the associated
                            NFT transaction are added to your wallet balance.
                            backup your NFT <HelpIconView help_item_name={'nft_help'}/>
                        </p>
                        <Row>
                            <Col xs={12} md={4}>
                                <Button variant="outline-primary"
                                        size={'sm'}
                                        className={'refresh_button'}
                                        onClick={() => this.reloadCollection()}
                                >
                                    <FontAwesomeIcon
                                        icon={'sync'}
                                        size="1x"/>
                                    refresh
                                </Button>
                            </Col>
                        </Row>
                        <Row style={{marginTop: 10}}>
                            <Col>
                                <PhotoAlbum layout="masonry" renderPhoto={this.renderNftImage.bind(this)} photos={this.state.nft_list}
                                            onClick={(event, photo) => this.props.history.push('/nft-transfer', photo)}/>
                                <ModalView
                                    show={this.state.modal_show_burn_confirmation}
                                    size={'lg'}
                                    heading={'burn nft'}
                                    on_accept={() => this.doNftBurn()}
                                    on_close={() => this.cancelNftBurn()}
                                    body={<div>
                                        <div>you are about to burn an nft and receive {format.millix(this.state.nft_selected?.amount)} in your wallet</div>
                                        <div style={{
                                            display      : 'flex',
                                            flexDirection: 'row'
                                        }}><Form.Check type="checkbox" label="" checked={this.state.modal_burn_create_asset}
                                                       onChange={e => this.setState({modal_burn_create_asset: e.target.checked})}/> preserve image as an asset
                                        </div>
                                        {text.get_confirmation_modal_question()}
                                    </div>}/>
                                <ModalView
                                    show={this.state.modal_show_burn_result}
                                    size={'lg'}
                                    on_close={() => this.setState({modal_show_burn_result: false})}
                                    heading={'the nft was burned'}
                                    body={this.state.modal_body_burn_result}/>
                            </Col>
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
)(withRouter(NftCollectionView));

