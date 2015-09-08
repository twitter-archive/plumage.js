import React, {PropTypes} from 'react';

import FieldUtil from './util/FieldUtil';

export default class DropdownMultiselect extends React.Component {
  static propTypes = {
    name: PropTypes.string,
    value: PropTypes.array,
    placeholder: PropTypes.string,
    items: PropTypes.array,
    getItems: PropTypes.func,
    showSelectAll: PropTypes.bool,
    showSelectOnly: PropTypes.bool,
    allLabel: PropTypes.string
  };

  static defaultProps = {
    showSelectAll: false,
    showSelectOnly: false,
    allLabel: 'All'
  };

  static contextTypes = {
    onFormChange: React.PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      isExpanded: false,
      items: this.getItemsFromProps(props)
    };

    this.dropdownId = _.uniqueId('dropdown-');

    this.onExpandClick = this.onExpandClick.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onItemClick = this.onItemClick.bind(this);
    this.onSelectAllClick = this.onSelectAllClick.bind(this);
  }

  componentWillReceiveProps(props) {
    this.setState({
      items: this.getItemsFromProps(props)
    });
  }

  render() {
    let items = this.state.items;
    let allSelected = this.props.value && (items.length === this.props.value.length);
    let selectAllEl, selectOnlyEl;
    if (this.props.showSelectAll) {
      selectAllEl = <li className={'select-all' + (allSelected ? ' active' : '')} onClick={this.onSelectAllClick}>
        <a className="item"><input type="checkbox" checked={allSelected}/>Select All</a>
      </li>
    }
    if (this.props.showSelectOnly) {
      selectOnlyEl = <a href="#" className="only-link">only</a>
    }

    return <div className={'dropdown-multiselect dropdown' + (this.state.isExpanded ? ' open': '')}>
      <select name={this.props.name} style={{display: 'none'}} multiple={true} value={this.props.value}>
        {items.map((item) => <option key={'option-' + item.value} value={item.value}>{item.label}</option>)}
      </select>

      <button id={this.dropdownId} className="btn btn-default dropdown-toggle"
              aria-haspopup="true" aria-expanded={this.state.isExpanded} onBlur={this.onBlur} onClick={this.onExpandClick}>
        {this.getTitle()} <span className="caret"></span>
      </button>
      <ul className={'dropdown-menu' + (this.props.showSelectOnly ? ' show-select-only' : '')}
          aria-labelledby={this.dropdownId}
          onMouseDown={this.disableMouseDown}>
        {selectAllEl}
        {items.map((item) => {
          let isSelected = this.isItemSelected(item);
          return <li key={'batch-state-' + item.value}
                     className={'' + item.value + (isSelected ? ' active' : '')}
                     data-value={item.value}
                     onClick={this.onItemClick}>
            {selectOnlyEl}
            <a className="item" ><input type="checkbox" checked={isSelected} readOnly={true}/>{item.label}</a>
          </li>
        })}
      </ul>
    </div>
  }

  getItemsFromProps(props) {
    if (props.getItems) {
      return props.getItems();
    }
    return props.items;
  }

  getTitle() {
    if (!this.props.value || this.props.value.length === 0) {
      return this.props.placeholder || '';
    }

    if (this.props.value.length === this.state.items.length) {
      return this.props.allLabel;
    }

    var labels = [];
    for (let item of this.state.items) {
      if (this.isItemSelected(item)) {
        labels.push(item.label);
      }
    }
    return labels.join(', ');
  }

  isItemSelected(item) {
    return this.props.value.indexOf(item.value) !== -1;
  }

  selectAll() {
    FieldUtil.setFieldValue(this, this.state.items.map((item) => item.value));
  }

  selectNone() {
    FieldUtil.setFieldValue(this, []);
  }

  toggleSelectAll() {
    let allSelected = this.props.value && (this.state.items.length === this.props.value.length);
    if (allSelected) {
      this.selectNone();
    } else {
      this.selectAll();
    }
  }

  toggleValue(value) {
    var result = [];
    for (let item of this.state.items) {
      let active = this.props.value.indexOf(item.value) !== -1;
      if (item.value === value ? !active : active) {
        result.push(item.value);
      }
    }
    FieldUtil.setFieldValue(this, result);
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
    let value = $(e.target).closest('li').data('value');
    if ($(e.target).hasClass('only-link')) {
      FieldUtil.setFieldValue(this, [value]);
    } else {
      this.toggleValue(value);
    }
  }

  onSelectAllClick (e) {
    e.preventDefault();
    e.stopPropagation();
    this.toggleSelectAll();
  }

  disableMouseDown(e) {
    //do nothing so input doesn't lose focus
    e.preventDefault();
    e.stopPropagation();
  }
}