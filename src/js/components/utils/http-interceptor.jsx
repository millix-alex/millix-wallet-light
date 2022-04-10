import React, {Component, useState } from 'react';
import fetchIntercept from 'fetch-intercept';
import {Button, Modal} from 'react-bootstrap';
import ModalView from './modal-view';

class RequestErrorHandler extends Component {

    
    constructor(props) {
        super(props);

        this.state = {
            secondsBetween : 10,
            modalShow: false,
            message: 0,
            showTime: new Date(),
        };       

        this.register()
    }

    register(){
        fetchIntercept.register({
            request: function (url, config) {                
                return [url, config];
            },
        
            requestError: function (error) {
                return Promise.reject(error);
            },
        
            response: function (response) {
                return response;
            },
        
            responseError:  (error)=> {

                if(error.message.includes('Failed to fetch')){
                    error.message = 'failed to request the node. please try to restart client/browser.'
                }            
                
                if(error.message === this.state.message){
                    if(new Date() > this.state.showTime){                         
                        this.setState({
                            modalShow: true,
                            message: error.message
                        });
                    }
                }
                else{
                    this.setState({
                        modalShow: true,
                        message: error.message
                    });
                }
            }
        });
    }

    show(value = true) {
        this.setState({
            modalShow: value        
        });
    }   

    close(){
        let timeAfter = new Date();
        timeAfter.setSeconds(timeAfter.getSeconds() + this.state.secondsBetween);   
        this.setState({
            modalShow: false,
            showTime: timeAfter
        });
    }

    render() { 
        return(              
            <>
             <ModalView show={this.state.modalShow}
                           size={'lg'}
                           on_close={() => this.close()}
                           heading={'error'}
                           body={this.state.message}/>
            </>
        )
    }
}
export default RequestErrorHandler;



