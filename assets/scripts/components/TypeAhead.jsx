import React, {PropTypes} from 'react';
import _ from 'underscore';

import FieldUtil from './util/FieldUtil';
import TypeAheadResults from './TypeAheadResults';

export default class TypeAhead extends React.Component {

  static propTypes = {
    name: PropTypes.string,
    placeholder: PropTypes.string,
    showClearButton: PropTypes.bool,
    value: PropTypes.string,
    getResults: PropTypes.func.isRequired,
    resultSections: PropTypes.array,
    renderResults: PropTypes.func,
    debounceSearch: PropTypes.bool,
    onQueryChange: PropTypes.func,
    onMoreClick: PropTypes.func,
    allowEmptyQuery: PropTypes.bool
  };

  static contextTypes = {
    onFormChange: React.PropTypes.func
  };

  static defaultProps = {
    showClearButton: true,
    debounceSearch: true,
    allowEmptyQuery: false
  };

  constructor(props) {
    super(props);

    this.state = {
      inputValue: props.value,
      expanded: false,
      selectedIndex: 0,
      results: [],
      isLoading: false
    };

    this.onChange = this.onChange.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onInputClick = this.onInputClick.bind(this);
    this.onResultClick = this.onResultClick.bind(this);
    this.onResultMouseDown = this.onResultMouseDown.bind(this);
    this.onResultMouseOver = this.onResultMouseOver.bind(this);
    this.onClearClick = this.onClearClick.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onMoreClick = this.onMoreClick.bind(this);

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
    if (this.props.onQueryChange) {
      this.props.onQueryChange(value);
    }
  }

  onKeyDown(e) {
    switch (e.key) {
    case 'Enter':
      e.preventDefault();
      this.commit(this.getResultValue(this.getResultAt(this.state.selectedIndex)));
      break;
    case 'Escape':
      e.preventDefault();
      this.cancel();
      break;
    case 'ArrowUp':
      e.preventDefault();
      this.setState({
        expanded: true,
        selectedIndex: (this.state.selectedIndex - 1 + this.state.results.length) % this.state.results.length
      });
      break;
    case 'ArrowDown':
      e.preventDefault();
      this.setState({
        expanded: true,
        selectedIndex: (this.state.selectedIndex + 1) % this.state.results.length
      });
      break;
    default:
      break;
    }
  }

  onInputClick() {
    if ((this.props.allowEmptyQuery || this.state.inputValue) && !this.state.expanded) {
      this.setState({expanded: true, isLoading: true});
      this.updateSearch(this.state.inputValue);
    }
  }

  onResultClick(e) {
    e.preventDefault();
    let li = this.getClosestLi(e.target);
    if (li) {
      let value = li.getAttribute('data-value');
      this.commit(value);
    }
  }

  onResultMouseDown(e) {
    // prevent focus loss
    e.preventDefault();
  }

  onResultMouseOver(e) {
    let li = this.getClosestLi(e.target);
    if (li) {
      let index = li.getAttribute('data-index');
      this.setState({selectedIndex: index === null ? index : Number(index)});
    }
  }

  onClearClick(e) {
    e.preventDefault();
    this.setState({inputValue: '', expanded: false});
    this.commit('');
  }

  onBlur() {
    this.setState({expanded: false});
  }

  onMoreClick(url) {
    this.setState({expanded: false});
    if (this.props.onMoreClick) {
      this.props.onMoreClick(url);
    }
  }

  //
  // Helpers
  //

  getResultValue(result) {
    if (typeof(result) === 'object') {
      return result.value;
    }
    return result;
  }

  getClosestLi(el) {
    if (!el) {
      return undefined;
    }
    if (el.tagName === 'LI') {
      return el;
    }
    return this.getClosestLi(el.parentElement);
  }

  getResultAt(index) {
    if (this.props.resultSections) {
      let indexRemaining = index;
      for (let i = 0; i < this.props.resultSections.length; i++) {
        let section = this.props.resultSections[i];
        let results = this.state.results[section.key] || [];
        if (indexRemaining < results.length) {
          return results[indexRemaining];
        }
        indexRemaining -= results.length;
      }
    } else {
      return this.state.results[index];
    }

    return this.state.results[index];
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
    let promise = this.props.getResults(value);
    if (promise.then) {
      promise.then((results) => {
        // check if this search is still valid
        if (this.state.inputValue === value) {
          this.setState({isLoading: false, results: results, selectedIndex: 0});
        }
      });
    } else {
      this.setState({isLoading: false, results: promise, selectedIndex: 0});
    }
  }

  renderResults() {
    let resultSections = this.props.resultSections;
    let resultsBySection = this.state.results || {};
    if (!resultSections) {
      resultSections = [{key: '!default'}];
      resultsBySection = {
        '!default': this.state.results
      };
    }

    let startIndex = 0;
    return resultSections.map((resultSection) => {
      let results = resultsBySection[resultSection.key] || [];

      let el = (<TypeAheadResults results={results}
                                  selectedIndex={this.state.selectedIndex}
                                  startIndex={startIndex}
                                  onMoreClick={this.onMoreClick}
                                  {...resultSection} />);
      startIndex += results.length;
      return el;
    });
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
               onClick={this.onInputClick}
               onBlur={this.onBlur}
          />
        <span className="input-group-btn">
          <button className="btn btn-default" type="button" onClick={this.onClearClick}>
            <span className="glyphicon glyphicon-remove"></span>
          </button>
        </span>
      </div>


      <ul className="dropdown-menu pull-left"
          onClick={this.onResultClick}
          onMouseDown={this.onResultMouseDown}
          onMouseOver={this.onResultMouseOver}>
        {this.state.isLoading ? <li className="loading"></li> : undefined}
        {this.renderResults()}
      </ul>
    </div>);
  }
}