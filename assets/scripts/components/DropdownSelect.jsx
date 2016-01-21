
import React, {PropTypes} from 'react';
import _ from 'underscore';
import classNames from 'classnames';

import FieldUtil from './util/FieldUtil';
import Select from './Select';
import CategorySelect from './CategorySelect';


export default class DropdownSelect extends CategorySelect {

  static propTypes = _.extend({}, Select.propTypes, {
    pull: PropTypes.string
  });

  static defaultProps = _.extend({}, Select.defaultProps, {
    pull: 'none'
  });

  constructor(props) {
    super(props);

    this.dropdownId = _.uniqueId('dropdown-');

    this.state = {isExpanded: false};

    this.onBlur = this.onBlur.bind(this);
    this.onExpandClick = this.onExpandClick.bind(this);
    this.onItemClick = this.onItemClick.bind(this);
  }

  //
  // Events
  //

  onExpandClick() {
    let newValue = !this.state.isExpanded;
    this.setState({isExpanded: newValue});
  }

  onBlur() {
    this.setState({isExpanded: false});
  }

  onItemClick(e) {
    e.preventDefault();
    e.stopPropagation();
    if (Array.from(e.target.parentNode.classList).indexOf('disabled') === -1) {
      this.setState({isExpanded: false});
      this.changeValue(e.target.getAttribute('data-value'));
    }
  }

  onDisableMouseDown(e) {
    // do nothing so input doesn't lose focus
    e.preventDefault();
    e.stopPropagation();
  }

  getActiveLabel() {
    const options = this.getOptions();
    if (options) {
      for (let option of options) {
        if (option.value === this.props.value) {
          return option.label;
        }
      }
    }
    return this.props.placeholder;
  }

  getClassNames() {
    const result = {
      'dropdown-select': true,
      dropdown: true
    };
    if (this.props.className) {
      return Object.assign({[this.props.className]: true}, result);
    }
    return result;
  }

  render() {
    let iconEl;
    if (this.props.iconClassName) {
      iconEl = <span className={'glyphicon glyphicon-' + this.props.iconClassName}></span>;
    }

    return (<span className={classNames(Object.assign(this.getClassNames(), {
      open: this.state.isExpanded
    }))}>
      <button id={this.dropdownId} className="btn btn-default dropdown-toggle" data-toggle="dropdown" disabled={this.props.disabled}
              aria-haspopup="true" aria-expanded={this.state.isExpanded} onBlur={this.onBlur} onClick={this.onExpandClick}>
        {iconEl}
        {this.getActiveLabel() + ' '}<span className="caret"></span>
      </button>
      <input ref="input" type="hidden" name={this.props.name} value={this.props.value}/>
      <ul className={'dropdown-menu pull-' + this.props.pull} aria-labelledby={this.dropdownId}>
        {this.getOptions().map(option => {
          return (<li key={this.props.name + '-' + option.value} className={option.className}>
            <a href="#" data-value={option.value} onMouseDown={this.onDisableMouseDown} onClick={this.onItemClick}>{option.label}</a>
          </li>);
        })}
      </ul>
    </span>);
  }
}