import React, {PropTypes} from 'react';

import FieldUtil from './util/FieldUtil';

export default class Select extends React.Component {

  static propTypes = {
    name: PropTypes.string,
    value: PropTypes.string,
    className: PropTypes.string,
    placeholder: PropTypes.string,
    placeholderValue: PropTypes.any,
    disabled: PropTypes.bool,
    options: PropTypes.array
  };

  static contextTypes = {
    onFormChange: React.PropTypes.func
  };

  static defaultProps = {
    placeholderValue: '',
    disabled: false,
    options: []
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

  //
  // Helpers
  //

  hasSelection() {
    let value = this.props.value;
    return value !== null && value !== undefined && value !== this.props.placeholderValue;
  }

  render() {
    let placeholderEl;
    if (this.props.placeholder) {
      placeholderEl = <option key={'option-' + this.props.placeholderValue} value={this.props.placeholderValue}>{this.props.placeholder}</option>;
    }
    let options = this.props.options || [];

    return (<select ref="input"
                   name={this.props.name}
                   value={this.props.value}
                   className={'form-control ' + (this.props.className || '')}
                   disabled={this.props.disabled}
                   onChange={this.onChange}
      >
      {placeholderEl}
      {options.map(option => {
        return <option value={option.value} key={'option-' + option.value} className={option.className}>{option.label}</option>;
      })}
    </select>);
  }
}