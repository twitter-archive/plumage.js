
import React, {PropTypes} from 'react';
import _ from 'underscore';

import modelComponent from './modelComponent';
import FieldUtil from './util/FieldUtil';
import Select from './Select';

export default class CategorySelect extends Select {

  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  render() {
    var placeholderEl;
    if (this.props.placeholder) {
      placeholderEl = this.renderOption({value: this.props.placeholderValue, label: this.props.placeholder});
    }
    var options = this.props.options;
    return <ul className="nav nav-pills">
      <input ref="input" type="hidden" name={this.props.name} value={this.props.value}/>
      {placeholderEl}
      {options.map(option => {
        return this.renderOption(option);
      })}
    </ul>;
  }

  getOptionClassName(option) {
    var className = option.className ? option.className : '';
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
      className += ' active disabled';
    }
    return className
  }

  getActiveOption() {
    if (this.props.options) {
      for(option in this.props.options) {
        if (option.value === this.props.value) {
          return option;
        }
      }
    }
  }

  renderOption(option) {
    return <li key={option.value} className={this.getOptionClassName(option)} >
      <a href="#" data-value={option.value}  onClick={this.onClick}>{option.label}</a>
    </li>
  }

  //
  // Events
  //

  onClick(e) {
    e.preventDefault();
    FieldUtil.setFieldValue(this, e.target.getAttribute('data-value'));
  }
}