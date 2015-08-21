
import React, {PropTypes} from 'react';
import _ from 'underscore';

import FieldUtil from './util/FieldUtil';

export default class Select extends React.Component {

  static propTypes = {
    placeholder: PropTypes.string,
    options: PropTypes.array.isRequired,
    optionValueKey: PropTypes.string,
    optionLabelKey: PropTypes.string,
    optionClassNameKey: PropTypes.string
  };

  static defaultProps = {
    placeholderValue: '',
    options: [],
    optionValueKey: 'value',
    optionLabelKey: 'label',
    optionClassNameKey: 'className'
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
      placeholderEl = <option value={this.props.placeholderValue}>{this.props.placeholder}</option>
    }
    var options = this.getOptions();

    return <select name={this.props.name} value={this.props.value} className="form-control" onChange={this.onChange}>
      {placeholderEl}
      {options.map(option => {
        return <option value={option.value} key={option.value} className={option.className}>{option.label}</option>
      })}
    </select>
  }

  hasSelection() {
    var value = this.props.value;
    return value !== null && value !== undefined && value !== this.props.placeholderValue;
  }

  getOptions() {
    return (this.props.options || []).map(item => {
      var result = {
        label: item[this.props.optionLabelKey],
        value: item[this.props.optionValueKey],
        className: item[this.props.optionClassNameKey]
      };
      return result;
    });
  }

  //
  // Events
  //

  onChange(e) {
    FieldUtil.setFieldValue(this, e.target.value);
  }
}