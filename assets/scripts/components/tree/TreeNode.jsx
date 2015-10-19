import React, {PropTypes} from 'react';
import Immutable from 'immutable';

class TreeNode extends React.Component {

  static propTypes = {
    data: PropTypes.instanceOf(Immutable.Map),
    indexPath: PropTypes.array
  };

  static contextTypes = {
    renderLabel: PropTypes.func.isRequired,
    onToggleExpand: PropTypes.func.isRequired
  };

  static defaultProps = {
    data: new Immutable.Map()
  };

  constructor(props) {
    super(props);
    this.onExpandClick = this.onExpandClick.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.data && this.props.data.equals(nextProps.data)) {
      return false;
    }
    return true;
  }

  onExpandClick() {
    this.context.onToggleExpand(this.props.indexPath, !this.props.data.get('expanded'));
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


  hasChildren() {
    return this.props.data && this.props.data.get('children') && this.props.data.get('children').size > 0;
  }

  renderChildren() {
    if (this.hasChildren()) {
      return (<ul>
        {this.props.data.get('children').map((child, i) => {
          let indexPath = this.props.indexPath.concat(i);
          return (<TreeNode key={'tree-node-' + indexPath.join('-')}
                            indexPath={indexPath}
                            data={child}/>);
        })}
      </ul>);
    }
  }

  render() {
    let expandEl;
    if (this.hasChildren()) {
      expandEl = <a className="expand-toggle" onClick={this.onExpandClick}>▼</a>;
    }
    return (<li className={this.getClassName()}>
      <div data-index-path={this.props.indexPath.join('.')}>
        {expandEl}
        {this.context.renderLabel(this.props)}
      </div>
      {this.renderChildren()}
    </li>);
  }
}

export default TreeNode;