import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Col, Form} from 'react-bootstrap';
import {addWalletAddressVersion, removeWalletAddressVersion, walletUpdateConfig} from '../redux/actions/index';
import _ from 'lodash';

class ConfigConsensus extends Component {

    constructor(props) {
        super(props);
        this.state = {};
    }

    setConfig(data) {
        _.each(_.keys(data), key => {
            switch (this.props.configType[key]) {
                case 'number':
                    data[key] = JSON.parse(data[key]);
            }
        });

        return this.props.walletUpdateConfig(data);
    }

    render() {
        return <div>
            <Form>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>consensus</div>
                    <div className={'panel-body'}>
                        <Col>
                            <Form.Group className="form-group">
                                <label>number
                                    of nodes</label>
                                <Form.Control
                                    type="text"
                                    placeholder=""
                                    ref={(c) => this._consensus_n_nodes = c}
                                    onChange={() => {
                                        this.setConfig({CONSENSUS_ROUND_NODE_COUNT: this._consensus_n_nodes.value});
                                    }}
                                    value={this.props.config.CONSENSUS_ROUND_NODE_COUNT}/>
                            </Form.Group>
                        </Col>

                        <Col>
                            <Form.Group className="form-group">
                                <label>min
                                    include
                                    path</label>
                                <Form.Control
                                    type="text"
                                    placeholder=""
                                    ref={(c) => this._consensus_min_inc_path = c}
                                    onChange={() => {
                                        this.setConfig({CONSENSUS_ROUND_PATH_LENGTH_MIN: this._consensus_min_inc_path.value});
                                    }}
                                    value={this.props.config.CONSENSUS_ROUND_PATH_LENGTH_MIN}/>
                            </Form.Group>
                        </Col>

                        <Col>
                            <Form.Group className="form-group">
                                <label>number
                                    of validation
                                    rounds</label>
                                <Form.Control
                                    type="text"
                                    placeholder=""
                                    ref={(c) => this._consensus_max_validation_rounds = c}
                                    onChange={() => {
                                        this.setConfig({CONSENSUS_ROUND_VALIDATION_MAX: this._consensus_max_validation_rounds.value});
                                    }}
                                    value={this.props.config.CONSENSUS_ROUND_VALIDATION_MAX}/>
                            </Form.Group>
                        </Col>

                        <Col>
                            <Form.Group className="form-group">
                                <label>max
                                    double spend
                                    bound</label>
                                <Form.Control
                                    type="text"
                                    placeholder=""
                                    ref={(c) => this._consensus_max_double_spend_rounds = c}
                                    onChange={() => {
                                        this.setConfig({CONSENSUS_ROUND_DOUBLE_SPEND_MAX: this._consensus_max_double_spend_rounds.value});
                                    }}
                                    value={this.props.config.CONSENSUS_ROUND_DOUBLE_SPEND_MAX}/>
                            </Form.Group>
                        </Col>

                        <Col>
                            <Form.Group className="form-group">
                                <label>number
                                    of validation
                                    required</label>
                                <Form.Control
                                    type="text"
                                    placeholder=""
                                    ref={(c) => this._consensus_required_validation_rounds = c}
                                    onChange={() => {
                                        this.setConfig({CONSENSUS_ROUND_VALIDATION_REQUIRED: this._consensus_required_validation_rounds.value});
                                    }}
                                    value={this.props.config.CONSENSUS_ROUND_VALIDATION_REQUIRED}/>
                            </Form.Group>
                        </Col>

                        <Col>
                            <Form.Group className="form-group">
                                <label>max
                                    wait
                                    (sec)</label>
                                <Form.Control
                                    type="text"
                                    placeholder=""
                                    ref={(c) => this._consensus_max_wait_time = c}
                                    onChange={() => {
                                        this.setConfig({CONSENSUS_VALIDATION_WAIT_TIME_MAX: this._consensus_max_wait_time.value});
                                    }}
                                    value={this.props.config.CONSENSUS_VALIDATION_WAIT_TIME_MAX}/>
                            </Form.Group>
                        </Col>

                        <Col>
                            <Form.Group className="form-group">
                                <label>retry
                                    wait
                                    (sec)</label>
                                <Form.Control
                                    type="text"
                                    placeholder=""
                                    ref={(c) => this._consensus_retry_wait_time = c}
                                    onChange={() => {
                                        this.setConfig({CONSENSUS_VALIDATION_RETRY_WAIT_TIME: this._consensus_retry_wait_time.value});
                                    }}
                                    value={this.props.config.CONSENSUS_VALIDATION_RETRY_WAIT_TIME}/>
                            </Form.Group>
                        </Col>
                    </div>
                </div>
            </Form>
        </div>;
    }
}


export default connect(
    state => ({
        config    : state.config,
        configType: state.configType,
        wallet    : state.wallet
    }),
    {
        walletUpdateConfig,
        addWalletAddressVersion,
        removeWalletAddressVersion
    })(withRouter(ConfigConsensus));
