import React, {Component} from 'react';
import PropTypes from 'prop-types';
import HelpIconView from './help-icon-view';
import * as format from '../../helper/format';
import * as convert from '../../helper/convert';
import {withRouter} from 'react-router-dom';
import * as svg from '../../helper/svg';
import store from '../../redux/store';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';


class BalanceView extends Component {
    constructor(props) {
        super(props);
        this.balanceStableFiatRef = React.createRef();
        this.toggleButtonRef      = React.createRef();
    }

    handleClick() {
        this.balanceStableFiatRef.current.classList.toggle('show');
        if (this.toggleButtonRef.current) {
            this.toggleButtonRef.current.classList.toggle('rotate');
        }
    }


    render() {
        let stable_millix;
        if (convert.is_currency_pair_summary_available()) {
            stable_millix = <div className="balance_panel">
                <div className={'balance_container'}>
                    {svg.millix_logo()}
                    <div className={'stable_millix'}>
                        <span>{format.millix(this.props.stable, false)}</span>
                    </div>
                    <div className="button-container" ref={this.toggleButtonRef}>
                        <FontAwesomeIcon
                            className="toggle-button"
                            onClick={() => this.handleClick()}
                            icon="chevron-down"
                            size="1x"/>
                    </div>
                </div>
                <div ref={this.balanceStableFiatRef} className={'stable_fiat'}>
                    <span className="text-primary symbol">{store.getState().currency_pair_summary.symbol}</span>
                    <span>{convert.fiat(this.props.stable, false)}</span>
                </div>
            </div>;
        }
        else {
            stable_millix = <div className={'balance_container'}>
                {svg.millix_logo()}
                <div className={'stable_millix'}>
                    <span>{format.millix(this.props.stable, false)}</span>
                </div>
            </div>;
        }

        return (
            <div className={'panel panel-filled'}>
                <div className={'panel-body balance_panel'}>
                    {stable_millix}

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

