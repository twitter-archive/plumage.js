
import React, {PropTypes} from 'react';

import FieldUtil from './util/FieldUtil';
import Select from './Select';

export default class CategorySelect extends Select {

  static propTypes = {
    name: PropTypes.string,
    value: PropTypes.string,
    options: PropTypes.array,
    placeholder: PropTypes.string,
    placeholderValue: PropTypes.any
  };

  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  //
  // Events
  //

  onClick(e) {
    e.preventDefault();
    FieldUtil.setFieldValue(this, e.target.getAttribute('data-value'));
  }

  //
  // Helpers
  //

  getOptionClassName(option) {
    let className = option.className ? option.className : '';
    if (option.value === this.props.placeholderValue) {
      if (!this.hasSelection()) {
        className += ' active';
      }
      return className;
    }

    if (option.value === this.props.value) {
      className += ' active';
    }
    if (option.disabled) {
      className += ' disabled';
    }
    return className;
  }

  getActiveOption() {
    if (this.props.options) {
      for (let option in this.props.options) {
        if (option.value === this.props.value) {
          return option;
        }
      }
    }
  }

  renderOption(option) {
    return (<li key={option.value} className={this.getOptionClassName(option)} >
      <a href="#" data-value={option.value} onClick={this.onClick}>{option.label}</a>
    </li>);
  }

  render() {
    let placeholderEl;
    if (this.props.placeholder) {
      placeholderEl = this.renderOption({value: this.props.placeholderValue, label: this.props.placeholder, className: 'placeholder'});
    }
    let options = this.props.options;
    return (<ul className="nav nav-pills">
      <input ref="input" type="hidden" name={this.props.name} value={this.props.value}/>
      {placeholderEl}
      {options.map(option => {
        return this.renderOption(option);
      })}
    </ul>);
  }
}