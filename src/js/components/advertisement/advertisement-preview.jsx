import React, {Component} from 'react';
import PropTypes from 'prop-types';


class AdvertisementPreview extends Component {
    constructor(props) {
        super(props);
    }

    getDomain(url) {
        let domain;
        try {
            domain = new URL(url).host;
        }
        catch (e) {
            return '';
        }

        if (domain.startsWith('www.')) {
            return domain.substring(4);
        }

        return domain;
    }

    render() {
        return (
            <div className="advertisement-preview preview-holder" aria-readonly="true">
                <div className="advertisement-slider">
                    <span>
                        <a className="advertisement_headline"
                           href={this.props.url ? this.props.url : ''}
                           title={this.props.deck ? this.props.deck : ''}>{this.props.headline ? this.props.headline : ''}</a>
                    </span>
                    <span>
                        {(this.props.url || this.props.deck) && (
                            <a className="advertisement_deck"
                               href={this.props.url ? this.getDomain(this.props.url) : ''}
                               title={this.props.deck ? this.props.deck : ''}>{this.props.deck ? this.props.deck : ''} - {this.props.url ? this.props.url : ''}</a>)}
                    </span>
                </div>
            </div>
        );
    }
}


AdvertisementPreview.propTypes = {
    url     : PropTypes.string,
    headline: PropTypes.string,
    deck    : PropTypes.string
};


export default AdvertisementPreview;
