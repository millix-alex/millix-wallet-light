import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Button, Col, Form} from 'react-bootstrap';
import {walletUpdateConfig} from '../../redux/actions';
import * as validate from '../../helper/validate';
import ModalView from '../utils/modal-view';
import ErrorList from '../utils/error-list-view';


class Consensus extends Component {

    constructor(props) {
        super(props);
        this.state = {
            sending              : false,
            consensus_config_data: {},
            error_list           : {},
            modal_show_send_result  : false,
            reload               : false
        };
    }

    componentDidMount() {
        this.loadConfigToState();
    }

    loadConfigToState() {
        this.setState({
            consensus_config_data: {
                CONSENSUS_ROUND_NODE_COUNT          : this.props.config.CONSENSUS_ROUND_NODE_COUNT,
                CONSENSUS_ROUND_VALIDATION_MAX      : this.props.config.CONSENSUS_ROUND_VALIDATION_MAX,
                CONSENSUS_ROUND_DOUBLE_SPEND_MAX    : this.props.config.CONSENSUS_ROUND_DOUBLE_SPEND_MAX,
                CONSENSUS_ROUND_VALIDATION_REQUIRED : this.props.config.CONSENSUS_ROUND_VALIDATION_REQUIRED,
                CONSENSUS_VALIDATION_WAIT_TIME_MAX  : this.props.config.CONSENSUS_VALIDATION_WAIT_TIME_MAX,
                CONSENSUS_VALIDATION_RETRY_WAIT_TIME: this.props.config.CONSENSUS_VALIDATION_RETRY_WAIT_TIME
            }
        });
    }

    changeModalShowSendResult(value = true) {
        this.setState({
            modal_show_send_result: value
        });
        if (value === false) {
            this.refreshPage();
        }
    }

    refreshPage = () => {
        this.loadConfigToState();
    };

    setConsensusConfig(data) {
        for (let key in data) {
            this.state.consensus_config_data[key] = data[key];
        }

        this.setState({
            consensus_config_data: this.state.consensus_config_data
        });
    }

    send() {
        this.setState({
            sending   : true,
            error_list: []
        });

        if (!this.isValidConsensusData()) {
            return;
        }

        try {
            this.props.walletUpdateConfig(this.state.consensus_config_data).then(() => {
                this.setState({
                    sending: false
                });
                this.changeModalShowSendResult();
            });
        }
        catch (e) {
            this.state.error_list.push({
                name   : 'saveError',
                message: 'error while saving occurred, please try again later'
            });
            this.setState({
                error_list: this.state.error_list
            });
            return Promise.reject('server_error');
        }
    }

    isValidConsensusData() {
        let data       = this.state.consensus_config_data;
        let error_list = [];

        data.CONSENSUS_ROUND_NODE_COUNT = validate.required('number of nodes', data.CONSENSUS_ROUND_NODE_COUNT, error_list);
        if (data.CONSENSUS_ROUND_NODE_COUNT) {
            validate.positiveInteger('min connections in', data.CONSENSUS_ROUND_NODE_COUNT, error_list);
        }
        data.CONSENSUS_ROUND_VALIDATION_MAX = validate.required('number of validation rounds', data.CONSENSUS_ROUND_VALIDATION_MAX, error_list);
        if (data.CONSENSUS_ROUND_VALIDATION_MAX) {
            validate.positiveInteger('number of validation rounds', data.CONSENSUS_ROUND_VALIDATION_MAX, error_list);
        }
        data.CONSENSUS_ROUND_DOUBLE_SPEND_MAX = validate.required('max double spend bound', data.CONSENSUS_ROUND_DOUBLE_SPEND_MAX, error_list);
        if (data.CONSENSUS_ROUND_DOUBLE_SPEND_MAX) {
            validate.positiveInteger('max double spend bound', data.CONSENSUS_ROUND_DOUBLE_SPEND_MAX, error_list);
        }
        data.CONSENSUS_ROUND_VALIDATION_REQUIRED = validate.required('number of validation required', data.CONSENSUS_ROUND_VALIDATION_REQUIRED, error_list);
        if (data.CONSENSUS_ROUND_VALIDATION_REQUIRED) {
            validate.positiveInteger('number of validation required', data.CONSENSUS_ROUND_VALIDATION_REQUIRED, error_list);
        }
        validate.positiveInteger('max wait (sec)', data.CONSENSUS_VALIDATION_WAIT_TIME_MAX, error_list, true);
        validate.positiveInteger('retry wait (sec)', data.CONSENSUS_VALIDATION_RETRY_WAIT_TIME, error_list, true);

        if (error_list.length > 0) {
            this.setState({
                error_list: error_list,
                sending   : false
            });
            return false;
        }

        return true;
    }

    render() {
        return <div>
            <ModalView
                show={this.state.modal_show_send_result}
                size={'lg'}
                on_close={() => this.changeModalShowSendResult(false)}
                heading={'success'}
                body={
                    <div className={'text-center'}>
                        <div>
                            successfully saved
                        </div>
                    </div>
                }/>
            <Form>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>consensus</div>
                    <div className={'panel-body'}>
                        <ErrorList
                            error_list={this.state.error_list}/>
                        <Col>
                            <Form.Group className="form-group">
                                <label>number
                                    of nodes</label>
                                <Form.Control
                                    type="text"
                                    placeholder=""
                                    ref={(c) => this._consensus_n_nodes = c}
                                    onChange={() => {
                                        this.setConsensusConfig({CONSENSUS_ROUND_NODE_COUNT: this._consensus_n_nodes.value});
                                    }}
                                    value={this.state.consensus_config_data.CONSENSUS_ROUND_NODE_COUNT}/>
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
                                        this.setConsensusConfig({CONSENSUS_ROUND_VALIDATION_MAX: this._consensus_max_validation_rounds.value});
                                    }}
                                    value={this.state.consensus_config_data.CONSENSUS_ROUND_VALIDATION_MAX}/>
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
                                        this.setConsensusConfig({CONSENSUS_ROUND_DOUBLE_SPEND_MAX: this._consensus_max_double_spend_rounds.value});
                                    }}
                                    value={this.state.consensus_config_data.CONSENSUS_ROUND_DOUBLE_SPEND_MAX}/>
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
                                        this.setConsensusConfig({CONSENSUS_ROUND_VALIDATION_REQUIRED: this._consensus_required_validation_rounds.value});
                                    }}
                                    value={this.state.consensus_config_data.CONSENSUS_ROUND_VALIDATION_REQUIRED}/>
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
                                        this.setConsensusConfig({CONSENSUS_VALIDATION_WAIT_TIME_MAX: this._consensus_max_wait_time.value});
                                    }}
                                    value={this.state.consensus_config_data.CONSENSUS_VALIDATION_WAIT_TIME_MAX}/>
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
                                        this.setConsensusConfig({CONSENSUS_VALIDATION_RETRY_WAIT_TIME: this._consensus_retry_wait_time.value});
                                    }}
                                    value={this.state.consensus_config_data.CONSENSUS_VALIDATION_RETRY_WAIT_TIME}/>
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group
                                className={'d-flex justify-content-center'}>
                                <Button
                                    variant="outline-primary"
                                    onClick={() => this.send()}
                                    disabled={this.state.sending}>
                                    {this.state.sending ?
                                     <>
                                         <div style={{
                                             fontSize: '6px',
                                             float   : 'left'
                                         }}
                                              className="loader-spin"/>
                                         {'continue'}
                                     </> : <>continue</>}
                                </Button>
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
    }),
    {
        walletUpdateConfig
    })(withRouter(Consensus));
