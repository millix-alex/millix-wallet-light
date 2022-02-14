import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Button, Col, Form, Row} from 'react-bootstrap';
import {Route, withRouter} from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import moment from 'moment';


class DatatableHeaderView extends Component {
    constructor(props) {
        super(props);
        moment.relativeTimeThreshold('ss', -1); // required to get diff in
        // seconds instead of "a few
        // seconds ago"
    }

    render() {
        let action_button_icon = 'plus-circle';
        if (this.props.action_button_icon) {
            action_button_icon = this.props.action_button_icon;
        }

        let action_button_label = 'create';
        if (this.props.action_button_label) {
            action_button_label = this.props.action_button_label;
        }

        let action_button_args = [];
        if (this.props.action_button_args) {
            action_button_args = this.props.action_button_args;
        }

        return (
            <div className={'datatable_action_row'}>
                {typeof (this.props.action_button_on_click) === 'function' && (
                    <>
                        <Col>
                            <Button variant="outline-primary"
                                    size={'sm'}
                                    className={'datatable_action_button'}
                                    onClick={() => this.props.action_button_on_click(this.props, action_button_args)}>
                                <FontAwesomeIcon
                                    icon={action_button_icon}
                                    size="1x"/>
                                {action_button_label}
                            </Button>

                        </Col>
                        <hr/>
                    </>
                )}
                <Col xs={12} md={4}>
                    {typeof (this.props.reload_datatable) === 'function' && (
                        <Button variant="outline-primary"
                                size={'sm'}
                                className={'refresh_button'}
                                onClick={() => this.props.reload_datatable()}
                        >
                            <FontAwesomeIcon
                                icon={'sync'}
                                size="1x"/>
                            refresh
                        </Button>
                    )}
                </Col>

                <Col xs={12} md={4} className={'datatable_refresh_ago'}>
                    {this.props.datatable_reload_timestamp && (
                        <span>
                                refreshed {this.props.datatable_reload_timestamp && moment(this.props.datatable_reload_timestamp).fromNow()}
                            </span>
                    )}
                </Col>

                <Col xs={12} md={4}>
                    {typeof (this.props.on_global_search_change) === 'function' && (
                        <Form.Control
                            type="text"
                            className={'datatable_search_input'}
                            onChange={this.props.on_global_search_change.bind(this)}
                            placeholder="search"/>
                    )}
                </Col>
            </div>
        );
    }
}


DatatableHeaderView.propTypes = {
    datatable_reload_timestamp: PropTypes.any,
    action_button_icon        : PropTypes.string,
    action_button_label       : PropTypes.string,
    action_button_on_click    : PropTypes.func,
    reload_datatable          : PropTypes.func,
    on_global_search_change   : PropTypes.func
};

export default withRouter(DatatableHeaderView);
