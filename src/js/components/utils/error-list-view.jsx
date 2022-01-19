import React from 'react';


class ErrorHandler extends React.Component {
    constructor(props) {
        super(props);
        this.state = {error_list: []};
    }

    componentWillReceiveProps(newProps) {
        if (newProps.error_list != this.props.error_list) {
            this.setState({error_list: newProps.error_list});
        }
    }

    render() {
        let error_list = this.state.error_list;
        if (Object.keys(error_list).length > 0) {
            return (
                <div className="alert alert-danger" role="alert">
                    <ul>
                        {error_list.map((error, idx) =>
                            <li key={'message_' + idx}>
                                {error.message}
                            </li>
                        )}
                    </ul>
                </div>
            );
        }

        return '';
    }
}


export default ErrorHandler;
