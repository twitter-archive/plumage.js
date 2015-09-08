
import React, {PropTypes} from 'react';
import _ from 'underscore';

import FieldUtil from './util/FieldUtil';

export default class Select extends React.Component {

  static propTypes = {
    name: PropTypes.string,
    className: PropTypes.string,
    placeholder: PropTypes.string,
    placeholderValue: PropTypes.any,
    options: PropTypes.array
  };

  static defaultProps = {
    placeholderValue: '',
    options: []
  };

  static contextTypes = {
    onFormChange: React.PropTypes.func
  };

  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
  }

  render() {
    var placeholderEl;
    if (this.props.placeholder) {
      placeholderEl = <option key={'option-' + this.props.placeholderValue} value={this.props.placeholderValue}>{this.props.placeholder}</option>
    }
    var options = this.props.options || [];

    return <select ref='input'
                   name={this.props.name}
                   value={this.props.value}
                   className={'form-control ' + (this.props.className || '')}
                   onChange={this.onChange}>
      {placeholderEl}
      {options.map(option => {
        return <option value={option.value} key={'option-' + option.value} className={option.className}>{option.label}</option>
      })}
    </select>
  }

  hasSelection() {
    var value = this.props.value;
    return value !== null && value !== undefined && value !== this.props.placeholderValue;
  }

  //
  // Events
  //

  onChange(e) {
    FieldUtil.setFieldValue(this, e.target.value);
  }
}