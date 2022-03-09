import React, {Component, useState } from 'react';
import fetchIntercept from 'fetch-intercept';
import {Button, Modal} from 'react-bootstrap';

class HttpInteceptor extends Component {

    constructor(props) {
        super(props);

        this.state = {
            modalShow: false,
            lastError: 0,
            body:''
        };       

        this.register()
    }

    register(){
        fetchIntercept.register({
            request: function (url, config) {                
                return [url, config];
            },
        
            requestError: function (error) {
                // Called when an error occured during another 'request' interceptor call
              
                return Promise.reject(error);
            },
        
            response: function (response) {
                return response;
            },
        
            responseError:  (error)=> {
                // Handle an fetch error
                console.log(error.message)
                
                if(this.state.lastError !== error.message){
                    this.setState({
                        modalShow: true,
                        lastError: error.message,
                    });
                }
                //return Promise.reject(error);
            }
        });
    }

    changeModalShow(value = true) {
        this.setState({
            modalShow: value
        });
    }   

    render() { 
        return(              
                <>
                <Modal show={this.state.modalShow} onHide={() => this.changeModalShow(false)}
                    size={'lg'}
                    animation={false}>
                    <Modal.Header closeButton>
                        <span
                            className={'page_subtitle'}>{'Error occured'}</span>
                    </Modal.Header>
                    <Modal.Body>{this.state.lastError}</Modal.Body>
                    <Modal.Footer>
                        <Button variant="outline-default" onClick={() => this.changeModalShow(false)}>
                            close
                        </Button>
                    </Modal.Footer>
                </Modal>
                </>
        );
    }


}

export default HttpInteceptor;