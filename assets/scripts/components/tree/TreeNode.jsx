import React, {PropTypes} from 'react';
import Immutable from 'immutable';

class TreeNode extends React.Component {

  static propTypes = {
    data: PropTypes.instanceOf(Immutable.Map),
    indexPath: PropTypes.array
  };

  static contextTypes = {
    renderLabel: PropTypes.func.isRequired,
    onToggleExpand: PropTypes.func.isRequired,
    onClick: PropTypes.func,
    onEnter: PropTypes.func,
    onLeave: PropTypes.func
  };

  static defaultProps = {
    data: new Immutable.Map()
  };

  constructor(props) {
    super(props);
    this.onExpandClick = this.onExpandClick.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onEnter = this.onEnter.bind(this);
    this.onLeave = this.onLeave.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    return !(this.props.data && this.props.data.equals(nextProps.data));
  }

  onExpandClick() {
    this.context.onToggleExpand(this.props.indexPath, !this.props.data.get('expanded'));
  }

  onClick() {
    if (this.context.onClick) {
      this.context.onClick(this, this.props.indexPath);
    }
  }

  onEnter() {
    if (this.context.onEnter) {
      this.context.onEnter(this, this.props.indexPath);
    }
  }

  onLeave() {
    if (this.context.onLeave) {
      this.context.onLeave(this, this.props.indexPath);
    }
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
      <div data-index-path={this.props.indexPath.join('.')}
           onMouseOver={this.onEnter}
           onMouseOut={this.onLeave}
           onClick={this.onClick}>
        {expandEl}
        {this.context.renderLabel(this.props)}
      </div>
      {this.renderChildren()}
    </li>);
  }
}

export default TreeNode;