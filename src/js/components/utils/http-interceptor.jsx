import React, {Component, useState } from 'react';
import fetchIntercept from 'fetch-intercept';
import {Button, Modal} from 'react-bootstrap';

class HttpInteceptor extends Component {

    
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
                    error.message = 'Failed to request the node.'
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
        var timeAfter = new Date();
        timeAfter.setSeconds(timeAfter.getSeconds() + this.state.secondsBetween);   
        this.setState({
            modalShow: false,
            showTime: timeAfter
        });
    }

    render() { 
        return(              
                <>
                <Modal show={this.state.modalShow} onHide={() => this.show(false)}
                    size={'lg'}
                    animation={false}>
                    <Modal.Header closeButton>
                        <span
                            className={'page_subtitle'}>{'Error'}</span>
                    </Modal.Header>
                    <Modal.Body>{this.state.message}</Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-default" onClick={() => this.close(false)}>
                            close
                        </Button>
                    </Modal.Footer>
                </Modal>
                </>
        );
    }


}

export default HttpInteceptor;