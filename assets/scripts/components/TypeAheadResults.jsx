import _ from 'underscore';
import React, {PropTypes} from 'react';

export default class TypeAheadResults extends React.Component {

  static propTypes = {
    title: PropTypes.string,
    results: PropTypes.array,
    selectedIndex: PropTypes.number,
    startIndex: PropTypes.number,
    moreLabel: PropTypes.string,
    moreUrl: PropTypes.string,
    renderResult: PropTypes.func,
    onMoreClick: PropTypes.func
  };

  static defaultProps = {
    startIndex: 0
  };

  constructor(props) {
    super(props);
    this.onMoreClick = this.onMoreClick.bind(this);
  }

  onMoreClick(e) {
    e.preventDefault();
    if (this.props.onMoreClick) {
      this.props.onMoreClick(e.target.href);
    }
  }

  getResultValue(result) {
    if (typeof(result) === 'object') {
      return result.value;
    }
    return result;
  }

  getResultLabel(result) {
    let label = typeof(result) === 'object' ? result.label : result;
    if (result.iconClass) {
      return <span><span className={'glyphicon glyphicon-' + result.iconClass}/>&nbsp;{label}</span>;
    }
    return label;
  }

  renderResult(result, i, selectedIndex) {
    let el;
    if (this.props.renderResult) {
      el = this.props.renderResult(result, i, selectedIndex);
    } else {
      el = this.getResultLabel(result);
    }
    let classes = _.compact([
      result.className,
      i === selectedIndex ? 'active' : undefined
    ]);

    return (<li key={'typeahead-result-' + i}
                data-label={this.getResultLabel(result)}
                data-value={this.getResultValue(result)} data-index={i}
                className={classes.join(' ')}>
      {el}
    </li>);
  }

  renderMore() {
    if (!this.props.moreLabel) {
      return undefined;
    }
    return (<li className={'more' + (this.props.selectedIndex - this.props.startIndex === this.props.results.length ? ' active' : '')}>
      <a href={this.props.moreUrl} onClick={this.onMoreClick}>{this.props.moreLabel}</a>
    </li>);
  }

  render() {
    let lis = [];
    if (this.props.title) {
      lis.push(<li className="section-title">{this.props.title}</li>);
    }

    let hasResults = this.props.results && this.props.results.length;
    if (hasResults) {
      this.props.results.map((result, i) => {
        lis.push(this.renderResult(result, i + this.props.startIndex, this.props.selectedIndex));
      });

      lis.push(this.renderMore());
    } else {
      lis.push(<li className="no-results-label">No Results</li>);
    }
    return <ul className={hasResults ? '' : 'no-results'} children={lis}/>;
  }
}