import React, {PropTypes} from 'react';

import FieldUtil from './util/FieldUtil';

export default class Checkbox extends React.Component {

  static propTypes = {
    name: PropTypes.string,
    value: PropTypes.any,
    className: PropTypes.string,
    label: PropTypes.node,
    isChecked: PropTypes.func,
    checkedValue: PropTypes.any,
    uncheckedValue: PropTypes.any,
    disabled: PropTypes.bool,
    onFormChange: PropTypes.func
  };

  static contextTypes = {
    onFormChange: React.PropTypes.func
  };

  static defaultProps = {
    checkedValue: true,
    uncheckedValue: false
  };

  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
  }

  //
  // Events
  //

  onChange(e) {
    let value = e.target.checked ? this.props.checkedValue : this.props.uncheckedValue;
    FieldUtil.setFieldValue(this, value);
  }

  //
  // Helpers
  //

  isChecked() {
    if (this.props.isChecked) {
      return this.props.isChecked(this.props.value);
    }
    return this.props.value === this.props.checkedValue;
  }

  render() {
    let input = (<input ref="input" type="checkbox"
                       name={this.props.name}
                       checked={this.isChecked()}
                       className={this.props.className}
                       disabled={this.props.disabled}
                       onChange={this.onChange}
      />);
    if (this.props.label) {
      return <label className="checkbox-label">{input} {this.props.label}</label>;
    }

    return input;
  }
}