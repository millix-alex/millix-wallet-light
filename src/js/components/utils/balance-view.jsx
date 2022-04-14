import React, {Component} from 'react';
import PropTypes from 'prop-types';
import HelpIconView from './help-icon-view';
import * as format from '../../helper/format';
import * as convert from '../../helper/convert';
import {withRouter} from 'react-router-dom';
import * as svg from '../../helper/svg';
import Accordion from 'react-bootstrap/Accordion';
import store from '../../redux/store';


class BalanceView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showMillixPrice: false
        };
    }

    toggleMillixPrice() {
        this.state.showMillixPrice = !this.state.showMillixPrice;
    }

    render() {
        let stable_millix;
        if (convert.is_currency_pair_summary_available()) {
            stable_millix = <Accordion>
                <Accordion.Header>
                    <div className={'stable_balance_millix'}>
                        {svg.millix_logo()}
                        <div>
                            <span>{format.millix(this.props.stable, false)}</span>
                        </div>
                    </div>
                </Accordion.Header>
                <Accordion.Body>
                    <div className={'stable_balance_fiat'}>
                        <span className="text-primary">{store.getState().currency_pair_summary.symbol}</span>
                        <span>{convert.fiat(this.props.stable, false)}</span>
                    </div>
                </Accordion.Body>
            </Accordion>;
        }
        else {
            stable_millix = <>
                {svg.millix_logo()}
                <div className={'stable_balance_millix'}>
                    <span>{format.millix(this.props.stable, false)}</span>
                </div>
            </>;
        }

        return (
            <div className={'panel panel-filled'}>
                <div className={'panel-body balance_panel'}>
                    <div className={'balance_container'}>
                        {stable_millix}
                    </div>

                    <div className={'balance_container'}>
                        <div>
                            <div className={'pending'}>
                                <span>{format.millix(this.props.pending, false)}</span>
                                <HelpIconView help_item_name={'pending_balance'}/>
                            </div>
                        </div>
                    </div>
                    <hr className={'w-100'}/>
                    <div
                        className={'primary_address'}>
                        {this.props.primary_address}
                        <HelpIconView
                            help_item_name={'primary_address'}/>
                    </div>
                </div>
            </div>
        );
    }
}


BalanceView.propTypes = {
    stable         : PropTypes.number,
    pending        : PropTypes.number,
    primary_address: PropTypes.string
};


export default withRouter(BalanceView);
