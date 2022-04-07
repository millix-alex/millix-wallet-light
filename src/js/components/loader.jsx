import React from "react";
import { Subject } from "rxjs";

export const loaderStatus = new Subject();

const LoadingContainer = props => {
  return (
    <div className="loader-container">
      <div className="loader">  
        <div className="circle">         
        </div>
      </div>
    </div>
    );
};

class Loader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingStatus: false
    };
  }

  componentWillMount() {
    loaderStatus.subscribe(result => {
      this.setState({ loadingStatus: result ? true : false });
    });
  }

  render() {
    const { loadingStatus } = this.state;
    return loadingStatus ? <LoadingContainer /> : null;
  }
}

export default Loader;
