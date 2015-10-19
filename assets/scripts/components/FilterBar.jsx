import React, {PropTypes} from 'react';

import Form from './Form';
import FormGroup from './FormGroup';
import SearchField from './SearchField';

import DropdownButton from 'react-bootstrap/DropdownButton';
import MenuItem from 'react-bootstrap/MenuItem';
import Glyphicon from 'react-bootstrap/Glyphicon';

export default class FilterBar extends React.Component {

  static propTypes = {
    onFormChange: PropTypes.func.isRequired,
    showSearch: PropTypes.bool,
    query: PropTypes.string,
    filterFields: PropTypes.array,
    actions: PropTypes.array,
    onAction: PropTypes.func.isRequired
  };

  static defaultProps = {
    showSearch: true,
    filterFields: [],
    actions: []
  };

  constructor(props) {
    super(props);

    this.onActionClick = this.onActionClick.bind(this);
    this.onDownloadClick = this.onDownloadClick.bind(this);
  }


  onDownloadClick() {
    if (this.props.onAction) {
      this.props.onAction('download');
    }
  }

  onActionClick(e) {
    let action = e.target.getAttribute('data-action');
    if (this.props.onAction) {
      this.props.onAction(action);
    }
  }

  render() {
    return (<Form className="form-inline filter-view" onFormChange={this.props.onFormChange}>
      <span className="filters">
        {this.props.filterFields.map((field, i) => {
          return <FormGroup key={'form-group' + i} className="filter-field">{field}</FormGroup>;
        })}
      </span>

      <span className="actions" onClick={this.onActionClick}>
        {this.props.actions}
      </span>

      <DropdownButton className="more-menu" id="app-index-more" bsStyle="default" pullRight
                      title={<Glyphicon glyph="cog" />}>
        <MenuItem eventKey="1" onSelect={this.onDownloadClick}><Glyphicon glyph="arrow-down" /> Download</MenuItem>
      </DropdownButton>

      { this.props.showSearch ? <SearchField name="query" value={this.props.query}/> : ''}
    </Form>);
  }
}