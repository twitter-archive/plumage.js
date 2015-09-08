import React, {PropTypes} from 'react';
import Immutable from 'immutable';

class TreeNode extends React.Component {

  static propTypes = {
    data: React.PropTypes.instanceOf(Immutable.Map)
  };

  static defaultProps = {
    data: Immutable.Map()
  };

  static contextTypes = {
    renderLabel: PropTypes.func.isRequired,
    onToggleExpand: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.onExpandClick = this.onExpandClick.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.data && this.props.data.equals(nextProps.data)) {
      return false;
    }
    return true;
  }

  render() {
    let expandEl;
    if (this.hasChildren()) {
      expandEl = <a className="expand-toggle" onClick={this.onExpandClick}>▼</a>;
    }
    return <li className={this.getClassName()}>
      <div data-index-path={this.props.indexPath.join('.')}>
        {expandEl}
        {this.context.renderLabel(this.props)}
      </div>
      {this.renderChildren()}
    </li>;
  }

  renderChildren() {
    if (this.hasChildren()) {
      return <ul>
        {this.props.data.get('children').map((child,i) => {
          let indexPath = this.props.indexPath.concat(i);
          return <TreeNode key={'tree-node-' + indexPath.join('-')}
                           indexPath={indexPath}
                           data={child}/>
        })}
      </ul>;
    }
  }

  hasChildren() {
    return this.props.data && this.props.data.get('children') && this.props.data.get('children').size > 0;
  }

  getClassName() {
    let classes = [];
    if (this.hasChildren() && this.props.data.get('expanded')) {
      classes.push('expanded');
    }
    if (this.props.data.get('active')) {
      classes.push('active');
    }
    return classes.join(' ');
  }

  onExpandClick() {
    this.context.onToggleExpand(this.props.indexPath, !this.props.data.get('expanded'));
  }
}

export default TreeNode;