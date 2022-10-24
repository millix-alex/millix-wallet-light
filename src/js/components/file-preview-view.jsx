import React, {Component} from 'react';
import NftActionSummaryView from './nft/nft-action-summary';
import ErrorList from './utils/error-list-view';
import WarningList from './utils/warning-list-view';


class FilePreviewView extends Component {
    isActionListShowAllowed() {
        return (this.props.error_list.length === 0 && this.props.status === 'synced') || this.props.file_type === 'asset';
    }

    getFileDefaultPreview() {
        return <>
            <div className={'nft-preview-img'}>
                <a href={this.props.image_data.src} target={'_blank'} className={'mx-auto d-flex'}>
                    <img src={this.props.image_data.src} alt={this.props.image_data.name}/>
                </a>
            </div>
            <div className={'nft-preview-description'}>
                <div className={'nft-name page_subtitle mb-0'}>{this.props.image_data.name}</div>
                <div className={'nft-description'}>{this.props.image_data.description}</div>
                {this.props.sender_verified}
            </div>
        </>;
    }

    render() {
        return (<div className={'panel panel-filled'}>
            <div className={'panel-heading bordered d-flex'}>
                {this.props.file_type} details
                <div className={'ms-auto message_subject_action_container'}>
                    {this.isActionListShowAllowed() && <NftActionSummaryView
                        nft_data={this.props.image_data}
                        src={this.props.image_data.src}
                        view_page={true}
                        asset_page={this.props.file_type === 'asset'}
                    />}
                </div>
            </div>
            <div className={'panel-body'}>
                {this.props.help_element}
                {this.props.error_list.length > 0 && <ErrorList error_list={this.props.error_list} class_name={'mb-0'}/>}
                {this.props.error_list.length === 0 && <>
                    {this.props.load_control}
                    <WarningList warning_list={this.props.warning_list}/>
                    {this.props.show_file_allowed && this.getFileDefaultPreview()}
                    {this.props.children}
                </>}
            </div>

        </div>);
    }
}


export default FilePreviewView;

