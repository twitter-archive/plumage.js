
import React, {PropTypes} from 'react';
import _ from 'underscore';

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

  render() {
    var iconEl;
    if (this.props.iconClassName) {
      iconEl = <span className={'glyphicon glyphicon-' + this.props.iconClassName}></span>;
    }

    return <span className={'dropdown-select dropdown' + (this.state.isExpanded ? ' open': '') + (this.props.className ? ' ' + this.props.className : '')}>
      <input ref='input' type='hidden' name={this.props.name} value={this.props.value}/>
      <button id={this.dropdownId} className='btn btn-default' data-toggle='dropdown'
            aria-haspopup='true' aria-expanded={this.state.isExpanded} onBlur={this.onBlur} onClick={this.onExpandClick}>
        {iconEl}
        {this.getActiveLabel() + ' '}<span className='caret'></span>
      </button>
      <ul className={'dropdown-menu pull-' + this.props.pull} aria-labelledby={this.dropdownId}>
        {this.props.options.map(option => {
          return <li key={this.props.name + '-' + option.value} className={option.className}>
            <a href='#' data-value={option.value} onMouseDown={this.disableMouseDown} onClick={this.onItemClick}>{option.label}</a>
          </li>
        })}
      </ul>
    </span>
  }

  getActiveLabel() {
    if (this.props.options) {
      for(let option of this.props.options) {
        if (option.value === this.props.value) {
          return option.label;
        }
      }
    }
    return this.props.placeholder;
  }

  //
  // Events
  //


  onExpandClick(e) {
    this.setState({isExpanded: !this.state.isExpanded});
  }

  onBlur() {
    this.setState({isExpanded: false});
  }

  onItemClick(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({isExpanded: false});
    FieldUtil.setFieldValue(this, e.target.getAttribute('data-value'));
  }

  disableMouseDown(e) {
    //do nothing so input doesn't lose focus
    e.preventDefault();
    e.stopPropagation();
  }
}