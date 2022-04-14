import React, {Component} from 'react';
import ModalView from './modal-view';

class RequestErrorHandler extends Component {
    constructor(props) {
        super(props);
    }   

    show(value = true) {
        this.setState({
            modalShow: value
        });
    }

    close() {
        let timeAfter = new Date();
        timeAfter.setSeconds(timeAfter.getSeconds() + this.state.secondsBetween);
        this.setState({
            modalShow: false,
            showTime : timeAfter
        });
    }

    render() {
        return (
            <>
               
            </>
        );
    }
}


export default RequestErrorHandler;
