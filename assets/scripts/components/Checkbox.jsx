import formDataToObj from 'form-data-to-object';
import React, {PropTypes} from 'react';
import _ from 'underscore';

import FieldUtil from './util/FieldUtil';

export default class Checkbox extends React.Component {

  static propTypes = {
    name: PropTypes.string,
    className: PropTypes.string,
    label: PropTypes.string,
    isChecked: PropTypes.func,
    checkedValue: React.PropTypes.any,
    uncheckedValue: React.PropTypes.any,
    onFormChange: React.PropTypes.func
  };

  static defaultProps = {
    checkedValue: true,
    uncheckedValue: false
  };

  static contextTypes = {
    onFormChange: React.PropTypes.func
  };

  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
  }

  render() {
    let input = <input ref='input' type='checkbox'
                  name={this.props.name}
                  checked={this.isChecked()}
                  className={this.props.className}
                  onChange={this.onChange}
      />;
    if (this.props.label) {
      return <label className='checkbox-label'>{input} {this.props.label}</label>
    }


    return input;
  }

  isChecked() {
    if (this.props.isChecked) {
      return this.props.isChecked(this.props.value);
    }
    return this.props.value === this.props.checkedValue;
  }

  //
  // Events
  //

  onChange(e) {
    let value = e.target.checked ? this.props.checkedValue : this.props.uncheckedValue;
    FieldUtil.setFieldValue(this, value);
  }
}