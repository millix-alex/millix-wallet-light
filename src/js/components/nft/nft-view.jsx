import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Col} from 'react-bootstrap';
import NftCreateForm from './nft-create-form';


class NftView extends Component {
    render() {
        return (
            <Col md={12}>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>{this.props.nft_type}</div>
                    <div className={'panel-body'}>
                        <p>
                            {this.props.nft_text}
                        </p>
                        <NftCreateForm/>
                    </div>
                </div>
            </Col>
        );
    }
}


export default connect(
    state => ({
        wallet: state.wallet,
        config: state.config
    })
)(withRouter(NftView));
