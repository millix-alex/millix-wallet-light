import React, {Component} from 'react';
import ntp from '../../js/core/ntp';
import {date} from '../helper/format';


class Clock extends Component {
    constructor(props) {
        super(props);

        this.state = {
            time: new Date()
        };

        this.interval_id = null;
    }

    componentWillUnmount() {
        if (this.interval_id) {
            clearInterval(this.interval_id);
        }
    }

    componentDidMount() {

        this.interval_id = setInterval(() => {
            let clock = new Date();
            clock.setUTCMilliseconds(clock.getUTCMilliseconds() + ntp.offset);
            this.setState({
                time: clock
            });
        }, 1000);
    }

    render() {
        return (<>
                <span>{date(this.state.time)} utc</span>
            </>
        );
    }
}


export default Clock;
