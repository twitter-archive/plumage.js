import React, {PropTypes} from 'react';

export default class LoadingError extends React.Component {

  static propTypes = {
    message: PropTypes.string
  };

  render() {
    return (<div className={'load-error ' + (this.props.message ? 'with-message' : '')}>
      <div className="error-icon">&times;</div>
      <div className="error-text">
        <div>Error loading resource</div>
        {this.props.message ? <div className="error-message">{this.props.message}</div> : undefined}
      </div>
    </div>);
  }
}