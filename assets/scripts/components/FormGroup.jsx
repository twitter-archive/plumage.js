import React, {PropTypes} from 'react';

export default class FormGroup extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    label: PropTypes.string,
    children: PropTypes.array
  };

  render() {
    return (<div className={'form-group ' + (this.props.className || '')}>
      {this.props.label ? <label className="control-label">{this.props.label}</label> : null}
      <div className="controls">{this.props.children}</div>
    </div>);
  }
}