import React from 'react';


class ErrorList extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let error_list = this.props.error_list;
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


export default ErrorList;
