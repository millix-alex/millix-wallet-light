import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import FilePreviewView from '../file-preview-view';
import {TRANSACTION_DATA_TYPE_ASSET} from '../../../config';
import {changeLoaderState} from '../loader';
import {getTransactionData, parseUrlParameterList} from '../../helper/file';


class AssetPreviewView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            parameter_list : {},
            image_data     : {},
            error_list     : [],
            warning_list   : [],
            warning_message: []
        };
    }

    componentDidMount() {
        changeLoaderState(true);
        const parameter_list = parseUrlParameterList(this.props.location.search.slice(1));
        this.setState({
            parameter_list
        }, () => {
            getTransactionData(TRANSACTION_DATA_TYPE_ASSET, this.state.parameter_list).then((data) => {
                this.setState({
                    ...data
                }, () => changeLoaderState(false));
            });
        });
    }

    render() {
        return <FilePreviewView image_data={this.state.image_data}
                                error_list={this.state.error_list}
                                warning_list={this.state.warning_list}
                                status={this.state.status}
                                file_type={'asset'}
                                show_file_allowed={this.state.status !== 'syncing' && this.state.error_list.length <= 0}
                                sender_verified={this.getVerifiedStatusElement}/>;
    }
}


export default withRouter(AssetPreviewView);

