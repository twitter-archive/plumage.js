import React, {PropTypes} from 'react';
import Immutable from 'immutable';

import TreeNode from './TreeNode';

export default class Tree extends React.Component {

  static propTypes = {
    className: PropTypes.string,
    onToggleExpand: PropTypes.func.isRequired,
    renderLabel: PropTypes.func.isRequired,
    rootNodes: PropTypes.instanceOf(Immutable.List),
    emptyMessage: PropTypes.string
  };

  static childContextTypes = {
    renderLabel: PropTypes.func.isRequired,
    onToggleExpand: PropTypes.func.isRequired
  };

  static defaultProps = {
    emptyMessage: 'Empty'
  };

  constructor(props) {
    super(props);
  }

  getChildContext() {
    return {
      renderLabel: this.props.renderLabel,
      onToggleExpand: this.props.onToggleExpand
    };
  }

  render() {
    let emptyEl;
    if (this.props.rootNodes.size === 0) {
      emptyEl = <div className="empty">{this.props.emptyMessage}</div>;
    }

    return (<div className={'tree ' + (this.props.className ? this.props.className : '')} >
      {emptyEl}
      <ul>
        {this.props.rootNodes.map((node, i) => {
          return <TreeNode key={'tree-node-' + i} indexPath={[i]}data={node}/>;
        })}
      </ul>
    </div>);
  }
}