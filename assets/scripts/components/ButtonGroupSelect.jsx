import React, {PropTypes} from 'react';

import CategorySelect from './CategorySelect';

export default class ButtonGroupSelect extends CategorySelect {

  static propTypes = {
    placeholder: PropTypes.string,
    placeholderValue: PropTypes.any
  };

  renderOption(option) {
    return (<a data-value={option.value}
               key={option.value}
               className={'btn btn-default ' + this.getOptionClassName(option)}
               onClick={this.onClick}>
      {option.label}
    </a>);
  }

  render() {
    let placeholderEl;
    if (this.props.placeholder) {
      placeholderEl = this.renderOption({value: this.props.placeholderValue, label: this.props.placeholder});
    }
    let options = this.getOptions(this);

    return (<div className="btn-group">
      {placeholderEl}
      {options.map(option => {
        return this.renderOption(option);
      })}
    </div>);
  }


}