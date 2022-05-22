import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {Button, Col, Form, Row} from 'react-bootstrap';
import * as validate from '../../helper/validate';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import API from '../../api';


class MessageView extends Component {
    constructor(props) {
        super(props);

        if (props?.location?.state?.dns) {
            this.state = {};
            this.verifyDNS(props.location.state.dns, this._getAddressKeyIdentifier(props.location.state.address));
        }
        else {
            this.state = {dnsValidated: false};
        }
    }

    reply() {
        this.props.history.push('/message-compose/', this.props.location.state); //todo ask crank to replace this with popup and universal component for this and message
    }

    _getAddressKeyIdentifier(address) {
        if (!address) {
            return null;
        }
        if (address.startsWith('1')) {
            return address.split('0a0')[1];
        }
        else {
            return address.split('lal')[1];
        }
    }

    verifyDNS(dns, addressKeyIdentifier) {
        dns = validate.dns('dns', dns, []);
        if (dns === null) {
            this.setState({dnsValidated: false});
        }
        else {
            API.isDNSVerified(dns, addressKeyIdentifier)
               .then(data => {
                   this.setState({dnsValidated: data.is_address_verified});
               })
               .catch(() => {
                   this.setState({dnsValidated: false});
               });
        }
    }

    render() {
        const data = this.props.location.state;
        return (
            <div>
                <Row>
                    <Col md={12}>
                        <div className={'panel panel-filled'}>
                            <div className={'panel-heading bordered'}>{!data ? 'send message' : 'view message'}</div>
                            <div className={'panel-body'}>
                                <Row>
                                    <Form>
                                        <Col>
                                            <Form.Group className="form-group">
                                                <label>{data.sent ? 'to' : 'from'}</label>
                                                <Form.Control type="text"
                                                              placeholder="address"
                                                              value={data.address}
                                                              disabled={true}/>
                                            </Form.Group>
                                        </Col>
                                        <Col>
                                            <Form.Group className="form-group">
                                                <label>subject</label>
                                                <Form.Control type="text"
                                                              placeholder="subject"
                                                              value={data.subject}
                                                              disabled={true}/>
                                            </Form.Group>
                                        </Col>
                                        <Col>
                                            <Form.Group className="form-group">
                                                <label>message</label>
                                                <Form.Control as="textarea" rows={10}
                                                              placeholder="message"
                                                              value={data.message}
                                                              disabled={true}/>
                                            </Form.Group>
                                        </Col>
                                        <Col>
                                            <Form.Group className="form-group">
                                                <label>payment</label>
                                                <Form.Control type="text"
                                                              placeholder="amount"
                                                              pattern="[0-9]+([,][0-9]{1,2})?"
                                                              value={data.amount}
                                                              disabled={true}/>
                                            </Form.Group>
                                        </Col>
                                        <Col>
                                            <Form.Group className="form-group"
                                                        as={Row}>
                                                <label>verified sender</label>
                                                <Col className={'input-group'}>
                                                    <Form.Control type="text"
                                                                  placeholder="dns"
                                                                  pattern="^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$"
                                                                  value={data.dns}
                                                                  disabled={true}/>
                                                    <button
                                                        className="btn btn-outline-input-group-addon icon_only"
                                                        type="button"
                                                        style={{opacity: '1!important'}}
                                                        disabled={true}>
                                                        {this.state.dnsValidated === undefined ? <div style={{
                                                                                                   margin: 0,
                                                                                                   width : '0.9rem',
                                                                                                   height: '0.9rem'
                                                                                               }} className="loader-spin"/> :
                                                         <FontAwesomeIcon
                                                             color={this.state.dnsValidated ? '#42a5f5' : '#a9a9a9'}
                                                             icon={this.state.dnsValidated ? 'check-circle' : 'question-circle'}
                                                             size="sm"/>}
                                                    </button>
                                                </Col>
                                            </Form.Group>
                                        </Col>
                                        <Col className={'d-flex justify-content-center'}>
                                            <Form.Group className="form-group">
                                                <Button
                                                    variant="outline-primary"
                                                    onClick={() => this.reply()}>
                                                    reply
                                                </Button>
                                            </Form.Group>
                                        </Col>
                                    </Form>
                                </Row>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}


export default withRouter(MessageView);
