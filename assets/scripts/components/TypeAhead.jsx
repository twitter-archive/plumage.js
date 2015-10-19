import $ from 'jquery';

import React, {PropTypes} from 'react';
import _ from 'underscore';

import FieldUtil from './util/FieldUtil';

export default class TypeAhead extends React.Component {

  static propTypes = {
    name: PropTypes.string,
    placeholder: PropTypes.string,
    showClearButton: PropTypes.bool,
    value: PropTypes.string,
    getItems: PropTypes.func.isRequired,

    renderItem: PropTypes.func,
    getItemValue: PropTypes.func,
    getItemLabel: PropTypes.func,
    debounceSearch: PropTypes.bool
  };

  static contextTypes = {
    onFormChange: React.PropTypes.func
  };

  static defaultProps = {
    showClearButton: true,
    debounceSearch: true
  };

  constructor(props) {
    super(props);

    this.state = {
      inputValue: props.value,
      expanded: false,
      selectedIndex: 0,
      items: [],
      isLoading: false
    };

    this.onChange = this.onChange.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onItemClick = this.onItemClick.bind(this);
    this.onItemMouseDown = this.onItemMouseDown.bind(this);
    this.onItemMouseOver = this.onItemMouseOver.bind(this);
    this.onClearClick = this.onClearClick.bind(this);
    this.onBlur = this.onBlur.bind(this);

    if (this.props.debounceSearch) {
      this.updateSearch = _.debounce(this.updateSearch, 200);
    }
  }

  componentWillReceiveProps(props) {
    this.setState({inputValue: props.value});
  }

  //
  // Events
  //

  onChange(e) {
    let value = e.target.value;
    this.setState({inputValue: value, expanded: true, isLoading: true});
    this.updateSearch(value);
  }

  onKeyDown(e) {
    switch (e.key) {
    case 'Enter':
      e.preventDefault();
      this.commit(this.getItemValue(this.state.items[this.state.selectedIndex]));
      break;
    case 'Escape':
      e.preventDefault();
      this.cancel();
      break;
    case 'ArrowUp':
      e.preventDefault();
      this.setState({selectedIndex: Math.max(this.state.selectedIndex - 1, 0)});
      break;
    case 'ArrowDown':
      e.preventDefault();
      this.setState({selectedIndex: Math.min(this.state.selectedIndex + 1, this.state.items.length - 1)});
      break;
    default:
      break;
    }
  }

  onItemClick(e) {
    e.preventDefault();
    let value = $(e.target).closest('li').attr('data-value');
    this.commit(value);
  }

  onItemMouseDown(e) {
    // prevent focus loss
    e.preventDefault();
  }

  onItemMouseOver(e) {
    let index = Number($(e.target).closest('li').attr('data-index'));
    this.setState({selectedIndex: index});
  }

  onClearClick(e) {
    e.preventDefault();
    this.setState({inputValue: '', expanded: false});
    this.commit('');
  }

  onBlur() {
    this.setState({expanded: false});
  }

  //
  // Helpers
  //

  getItemValue(item) {
    if (this.props.getItemValue) {
      return this.props.getItemValue(item);
    }
    return item;
  }

  getItemLabel(item) {
    if (this.props.getItemLabel) {
      return this.props.getItemLabel(item);
    }
    return item;
  }

  commit(value) {
    if (value === this.props.value) {
      this.cancel();
    } else {
      this.setState({expanded: false});
      FieldUtil.setFieldValue(this, value);
    }
  }

  cancel() {
    this.setState({inputValue: this.props.value, expanded: false, selectedIndex: 0});
  }

  updateSearch(value) {
    let promise = this.props.getItems(value);
    promise.then((items) => {
      if (this.state.inputValue === value) {
        this.setState({isLoading: false, items: items, selectedIndex: 0});
      }
    });
  }

  renderItems() {
    if (this.state.isLoading) {
      return <li className="loading">Loading...</li>;
    }
    if (this.state.items.length) {
      return this.state.items.map((item, i) => {
        return this.renderItem(item, i);
      });
    }
    return <li className="no-results">No Results</li>;
  }

  renderItem(item, i) {
    let itemEl;
    if (this.props.renderItem) {
      itemEl = this.props.renderItem(item, i);
    } else {
      itemEl = <a href="#">{this.getItemLabel(item)}</a>;
    }
    return (<li key={'typeahead-item-' + i} data-value={this.getItemValue(item)} data-index={i}
                className={i === this.state.selectedIndex ? 'active' : ''}>
      {itemEl}
    </li>);
  }

  render() {
    return (<div className={'typeahead' + (this.state.expanded ? ' open' : '')}>
      <div className="input-group">
        <input ref="input"
               name={this.props.name}
               type="text"
               className="form-control"
               placeholder={this.props.placeholder}
               value={this.state.inputValue}
               onChange={this.onChange}
               onKeyDown={this.onKeyDown}
               onBlur={this.onBlur}
          />
        <span className="input-group-btn">
          <button className="btn btn-default" type="button" onClick={this.onClearClick}>
            <span className="glyphicon glyphicon-remove"></span>
          </button>
        </span>
      </div>

      <ul className="dropdown-menu"
          onClick={this.onItemClick}
          onMouseDown={this.onItemMouseDown}
          onMouseOver={this.onItemMouseOver}>

        {this.renderItems()}
      </ul>
    </div>);
  }
}