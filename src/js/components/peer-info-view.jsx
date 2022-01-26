import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {Button, Col, Row, Table} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import API from '../api/index';
import moment from 'moment';


class PeerInfoView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            attributes: []
        };
    }

    componentDidMount() {
        let nodeID = this.props.location.state.peer;
        this.getNodeAttribute(nodeID);
    }

    getNodeAttribute(nodeID) {
        API.getNodeAttributes(nodeID)
           .then(attributes => {
               this.setState({attributes});
           }).catch((e) => {
            console.error(e);
        });
    }

    render() {
        let attributes        = this.state.attributes;
        let simpleAttributes  = [];
        let jobList  = [];
        let tabularAttributes = [];
        attributes.forEach(ele => {
            if (ele.attribute_type === 'job_list') {
                ele.value.forEach(element => {
                    let jobName = element.job_name.replace(/_/g, ' ');
                    jobList.push(
                            <tr>
                                <td className={'w-20'}>
                                    {jobName}
                                </td>
                                <td className={'text-break'}>
                                    {element.status}
                                </td>
                            </tr>
                        );
                    }
                );
            }

            if (ele.value instanceof Array) {
                if (ele.attribute_type === 'shard_protocol') {
                    ele.value.forEach(entry => {
                        tabularAttributes.push(entry);
                    });
                }
            }
            else if (ele.value instanceof Object) {
                for (let [key, value] of Object.entries(ele.value)) {
                    let attributeType = key.replace(/_/g, ' ');
                    if (attributeType.includes('date') && (new Date(value)).getTime() > 0){
                        value = moment.utc(value * 1000).format('YYYY-MM-DD HH:mm:ss')
                    }
                    simpleAttributes.push(
                        <tr>
                            <td className={'w-20'}>
                                {attributeType}
                            </td>
                            <td className={'text-break'}>
                                {value?.toString()}
                            </td>
                        </tr>
                    );
                }
            }
            else {
                let attributeType = ele.attribute_type.replace(/_/g, ' ');
                simpleAttributes.push(
                    <tr>
                        <td className={'w-20'}>
                            {attributeType}
                        </td>
                        <td className={'text-break'}>
                            {ele.value?.toString()}
                        </td>
                    </tr>
                );
            }
        });

        return (
            <div>
                <Row className="mb-3 mt-3">
                    <Col className="pl-0" style={{
                        display       : 'flex',
                        justifyContent: 'flex-start',
                        marginLeft    : 10
                    }}>
                        <Button variant='outline-primary'
                                onClick={this.props.history.goBack}>
                            <FontAwesomeIcon icon="arrow-circle-left"
                                             size="2x"/>
                            <span style={{
                                position   : 'relative',
                                top        : -5,
                                marginRight: 10,
                                marginLeft : 10
                            }}> Back</span>
                        </Button>
                    </Col>
                </Row>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>
                        node attributes
                    </div>
                    <div className={'panel-body'}>
                        <div className={'panel-body'}>
                            <div className={'section_subtitle'}>
                                node
                            </div>
                            <Table striped bordered hover className={'mb-3'}>
                                <tbody>
                                {simpleAttributes}
                                </tbody>
                            </Table>
                        </div>
                    </div>
                </div>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>
                        job list
                    </div>
                    <div className={'panel-body'}>
                        <div className={'panel-body'}>
                            <div className={'section_subtitle'}>
                                job
                            </div>
                            <Table striped bordered hover className={'mb-3'}>
                                <tbody>
                                {jobList}
                                </tbody>
                            </Table>
                        </div>
                    </div>
                </div>
                <div className={'panel panel-filled'}>
                    <div className={'panel-heading bordered'}>shard list</div>
                    <div className={'panel-body'}>
                        <Table striped bordered hover variant="dark">
                            <thead>
                            <tr>
                                <th>shard id</th>
                                <th>transaction count</th>
                                <th>update date</th>
                                <th>is required</th>
                                <th>fee ask request byte</th>
                            </tr>
                            </thead>
                            <tbody>
                            {tabularAttributes.map((item, idx) => {
                                return (
                                    <tr key={idx} className="wallet-node">
                                        <td className={'text-break'}>{item.shard_id}</td>
                                        <td>{item.transaction_count}</td>
                                        <td>{item.update_date}</td>
                                        <td>{item.is_required ? 'yes' : 'no'}</td>
                                        <td>{item.fee_ask_request_byte}</td>
                                    </tr>);
                            })}
                            </tbody>
                        </Table>

                    </div>
                </div>
            </div>
        );
    }
}


export default withRouter(PeerInfoView);
