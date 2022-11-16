import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import FilePreviewView from '../file-preview-view';
import moment from 'moment';
import {TRANSACTION_DATA_TYPE_NFT} from '../../../config';
import API from '../../api';
import {changeLoaderState} from '../loader';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import HelpIconView from '../utils/help-icon-view';
import {Button, Col, Row} from 'react-bootstrap';
import ReloadTimeTickerView from '../utils/reload-time-ticker-view';
import {connect} from 'react-redux';
import {getTransactionData, parseUrlParameterList} from '../../helper/file';


class NftPreviewView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            status                  : '',
            parameter_list          : {},
            image_data              : {},
            nft_sync_timestamp      : moment.now(),
            error_list              : [],
            warning_list            : [],
            transaction_history_list: [],
            dnsValidated            : false,
            dns                     : '',
            warning_message         : []
        };

        this.timeout_id = null;
    }

    componentDidMount() {
        moment.relativeTimeThreshold('ss', -1);
        const parameter_list = parseUrlParameterList(this.props.location.search.slice(1));
        this.setState({
            parameter_list
        }, () => {
            this.setNftData();
        });
    }

    componentWillUnmount() {
        clearTimeout(this.timeout_id);
    }

    setNftData() {
        const sync_request_image    = API.getSyncNftTransaction(this.state.parameter_list);
        const sync_request_metadata = API.getSyncNftTransaction(this.state.parameter_list, true);
        Promise.all([
            sync_request_image,
            sync_request_metadata
        ]).then((result_sync) => {
            const result_image       = result_sync[0];
            const result_metadata    = result_sync[1];
            const nft_sync_timestamp = moment.now();

            if (result_image.status !== 'syncing' && result_metadata.status !== 'syncing') {
                clearTimeout(this.timeout_id);
                getTransactionData(TRANSACTION_DATA_TYPE_NFT, this.state.parameter_list, moment.now(), result_image.status).then((data) => {
                    this.setState({
                        ...data
                    }, () => changeLoaderState(false));
                });
            }
            else {
                this.setState({
                    nft_sync_timestamp: nft_sync_timestamp,
                    status            : 'syncing'
                });
                setTimeout(() => this.setNftData(), 10000);
            }
        }).catch(_ => {
            setTimeout(() => this.setNftData(), 10000);
        });
    }

    getVerifiedStatusElement() {
        let sender_verified = '';
        if (this.state.dns) {
            let className = '';
            let icon      = '';
            if (this.state.dnsValidated) {
                className       = 'text-success';
                icon            = 'check-circle';
                sender_verified = <div className={className + ' labeled form-group text-center'}>
                    <FontAwesomeIcon
                        icon={icon}
                        size="1x"/>
                    <span>{this.state.dns}</span><HelpIconView help_item_name={'verified_sender'}/>
                </div>;
            }
        }
        return sender_verified;
    }

    isOwner() {
        return this.state.image_data.transaction?.address_key_identifier_to === this.props.wallet.address_key_identifier;
    }

    getHelpElement() {
        let help_icon = '';
        if (!this.isOwner()) {
            help_icon = <div className={'mb-3'}>
                best practices for safely buying nfts <HelpIconView help_item_name={'nft_trade'}/>
            </div>;
        }
        return help_icon;
    }

    getNftSyncingBody() {
        let nft_body = '';
        if (this.state.status === 'syncing') {
            nft_body = <Row className={'align-items-center mb-3'}>
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
            </Row>;
        }
        return nft_body;
    }

    render() {
        return <FilePreviewView image_data={this.state.image_data}
                                error_list={this.state.error_list}
                                warning_list={this.state.warning_list}
                                status={this.state.status}
                                file_type={'nft'}
                                show_file_allowed={this.state.status !== 'syncing' && this.state.error_list.length <= 0}
                                help_element={this.getHelpElement()}>
            {this.getNftSyncingBody()}
            {this.getVerifiedStatusElement()}
        </FilePreviewView>;
    }
}


export default connect(state => ({
    wallet: state.wallet
}))(withRouter(NftPreviewView));

