import React, {Component} from 'react';
import ModalView from './modal-view';
import {Subject} from 'rxjs';

const modalState = new Subject();

export function showErrorModal(error) {    
    modalState.next(error);
}

class ErrorModal extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            secondsBetween: 10,
            modalShow     : false,
            message       : '',
            showDate      : new Date()
        };
    }  
    
    componentWillMount() {
        modalState.subscribe(error => {   
            this.show(error);                     
        });
    }

    show(error) {
        if(new Date() > this.state.showDate && this.state.modalShow == false) {
            this.setState({
                modalShow: true,
                message:error.message
            });
        }
    }

    close() {
        let timeAfter = new Date();
        timeAfter.setSeconds(timeAfter.getSeconds() + this.state.secondsBetween);
        this.setState({
            modalShow: false,
            showDate : timeAfter
        });
    }

    render() {
        return (
            <>
               <ModalView show={this.state.modalShow}
                           size={'lg'}
                           on_close={() => this.close()}
                           heading={'error'}
                           body={this.state.message}/>
            </>
        );
    }
}


export default ErrorModal;
