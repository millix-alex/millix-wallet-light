
import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import {Row} from 'react-bootstrap';
import DatatableView from './utils/datatable-view';
import API from '../api';
import AdPreview from './utils/ap-preview';

class AdConsumerSummaryView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ad_list:[{
                payment_date:"12/12/12",
                presentation_date:"12/12/12",
                amount:"100 mlx",
                preview:this.adPreview("url de prueba","headline","deck")                
            }]
        };        
    }

    componentDidMount(){
        API.adsConsumerSummary().then(res => {
            this.setState({ad_list:res});
        });
    }

    adPreview(url,headline,deck) {
        return (
            <AdPreview
                url={url}
                headline={headline}
                deck={deck}>
            </AdPreview>
        );
    }

    render() {        
        return (<div>
            <div className={'panel panel-filled'}>
                <div className={'panel-heading bordered'}>advertisement summary
                </div>
                <div className={'panel-body'}>
                    <div className={'form-group'}>
                    these are advertisements you have been presented in the past 
                    24 hours. you should receive ad payments on a consistent basis. 
                    if you are not receiving ad payments click here to request assistance.
                    </div>
                    <Row id={'adlist'}>
                        <DatatableView
                            reload_datatable={() => this.reloadDatatable()}
                            datatable_reload_timestamp={this.state.datatable_reload_timestamp}
                            value={this.state.ad_list}
                            sortField={'date'}
                            sortOrder={-1}
                            loading={this.state.datatable_loading}
                            resultColumn={[
                                {
                                    field: 'preview'
                                },
                                {
                                    field : 'amount',
                                    header: 'amount'
                                },  
                                {
                                    field : 'payment_date',
                                    header: 'payment date'
                                },
                                {
                                    field : 'presentation_date',
                                    header: 'presentation date'
                                }                                                                      
                            ]}/>
                    </Row>
                </div>
            </div>

        </div>);
    }  
}

export default withRouter(AdConsumerSummaryView);


