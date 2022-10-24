import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {Button, Card} from 'react-bootstrap';
import utils from '../../helper/utils';
import NftActionSummaryView from './nft-action-summary';


class NftCard extends Component {
    render() {
        return (
            <Card.Body>
                <div className={'nft-name page_subtitle'}>{this.props.name}</div>
                <div className={'nft-description'}>{this.props.description}</div>
                <div className={'nft-action-section'}>
                    <NftActionSummaryView
                        nft_data={this.props.image_props}
                        modal_show_burn_result_on_close={this.props.action_after_burn}
                        preview_type={this.props.preview_type}
                    />
                    <Button variant="outline-default"
                            size={'sm'}
                            className={'ms-auto'}
                            onClick={() => {
                                this.props.history.push(utils.getNftViewLink(this.props.image_props, false, this.props.preview_type));
                            }}
                    >
                        <FontAwesomeIcon icon={'eye'}/>details
                    </Button>
                </div>
            </Card.Body>
        );
    }
}


NftCard.propTypes = {
    name             : PropTypes.string.isRequired,
    description      : PropTypes.string.isRequired,
    image_props      : PropTypes.object.isRequired,
    asset_page       : PropTypes.bool,
    action_after_burn: PropTypes.func
};


export default withRouter(NftCard);
