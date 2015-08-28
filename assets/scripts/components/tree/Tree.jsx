import React, {PropTypes} from 'react';
import Immutable from 'immutable';

import TreeNode from './TreeNode';

export default class Tree extends React.Component {

  static propTypes = {
    onToggleExpand: PropTypes.func.isRequired,
    renderLabel: PropTypes.func.isRequired,
    rootNodes: PropTypes.instanceOf(Immutable.List)
  };

  static childContextTypes = {
    renderLabel: PropTypes.func.isRequired,
    onToggleExpand: PropTypes.func.isRequired
  };

  getChildContext() {
    return {
      renderLabel: this.props.renderLabel,
      onToggleExpand: this.props.onToggleExpand
    };
  }

  constructor(props) {
    super(props);
  }

  render() {
    return <div className={'tree ' + (this.props.className ? this.props.className : '')} >
      <ul>
        {this.props.rootNodes.map((node, i) => {
          return <TreeNode key={'tree-node-' + i} indexPath={[i]}data={node}/>
        })}
      </ul>
    </div>
  }
}