import React, {PropTypes} from 'react';

import FieldUtil from './util/FieldUtil';

export default class TextField extends React.Component {

  static propTypes = {
    name: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    className: PropTypes.string,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
    onCommit: PropTypes.func,
    onCancel: PropTypes.func,
    onFormChange: PropTypes.func,
    onChange: PropTypes.func
  };

  static contextTypes = {
    onFormChange: React.PropTypes.func
  };

  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
  }

  //
  // Events
  //

  onChange(e) {
    FieldUtil.setFieldValue(this, e.target.value);
  }

  render() {
    return (<input ref="input" type="text"
                name={this.props.name}
                className={'form-control ' + (this.props.className || '')}
                placeholder={this.props.placeholder}
                  disabled={this.props.disabled}
                value={this.props.value}
                onChange={this.onChange}
    />);
  }
}