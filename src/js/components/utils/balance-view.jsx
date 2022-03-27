import React, {Component} from 'react';
import PropTypes from 'prop-types';
import HelpIconView from './help-icon-view';
import * as format from '../../helper/format';
import {withRouter} from 'react-router-dom';
import * as svg from '../../helper/svg';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import Accordion from 'react-bootstrap/Accordion'

class BalanceView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showMillixPrice: false
        };
    }

    componentDidMount() {

    }

    componentWillUnmount() {

    }

    toggleMillixPrice() {
        this.state.showMillixPrice = !this.state.showMillixPrice;
    }

    render() {

        let stable_millix;
        if (format.is_currency_price_available()) {
            stable_millix = <Accordion>                    
                    <Accordion.Header>
                        <div className={'balance_container'}>
                            {svg.millix_logo()}
                            <div className={'stable-millix'}>
                                <span>{format.millix(this.props.stable, false)}</span>
                            </div>
                        </div>
                    </Accordion.Header>
                    <Accordion.Body>
                        <div className={'stable-millix-price'}>
                            <span className="text-primary">$ </span>
                            <span> {format.usd(this.props.stable, false)}</span>
                        </div>
                    </Accordion.Body>                    
                </Accordion>
        } else {
            stable_millix = <div className={'balance_container'}>
                        {svg.millix_logo()}
                        <div className={'stable-millix'}>
                            <span>{format.millix(this.props.stable, false)}</span>
                        </div>
                    </div>
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
