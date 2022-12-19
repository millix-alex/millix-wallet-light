import {useEffect, useState} from 'react';
import {withRouter} from 'react-router-dom';
import Translation from '../../common/translation';
import moment from 'moment';


function ReloadTimeTickerView(props) {
    const [refreshed_ago, set_time_ago] = useState(props.last_update_time && moment(props.last_update_time).fromNow());

    useEffect(() => {
        set_time_ago(moment(props.last_update_time).fromNow());
        const interval = setInterval(() => set_time_ago(refreshed_ago && moment(props.last_update_time).fromNow()), 100);
        return () => {
            clearInterval(interval);
        };
    }, [props.last_update_time]);

    return <>{Translation.getPhrase('06d814962')} {refreshed_ago}</>;
}


export default withRouter(ReloadTimeTickerView);
