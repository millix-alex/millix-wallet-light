import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {Button, Col, Form, Row} from 'react-bootstrap';


class MessageView extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentWillUnmount() {
    }

    reply() {

    }

    render() {
        const data = this.props.location.state;
        return (
            <div>
                <Row>
                    <Col md={12}>
                        <div className={'panel panel-filled'}>
                            <div className={'panel-heading bordered'}>send message</div>
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
