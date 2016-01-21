import React, {PropTypes} from 'react';

import {Input, DropdownButton, MenuItem} from 'react-bootstrap';

import FieldUtil from './util/FieldUtil';

export default class DurationField extends React.Component {

  static propTypes = {
    name: PropTypes.string,
    value: PropTypes.number,
    className: PropTypes.string,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
    units: PropTypes.array,
    onCommit: PropTypes.func,
    onCancel: PropTypes.func,
    onFormChange: PropTypes.func
  };

  static contextTypes = {
    onFormChange: React.PropTypes.func
  };

  static defaultProps = {
    units: [
      {label: 'minutes', value: 60000},
      {label: 'hours', value: 3600000},
      {label: 'days', value: 86400000}
    ]
  };

  constructor(props) {
    super(props);
    this.state = {selectedUnit: this.props.units[0]};
    this.onChange = this.onChange.bind(this);
    this.onUnitSelect = this.onUnitSelect.bind(this);
  }

  componentDidMount() {
    this.selectUnitForValue(this.props.value);
  }

  componentWillReceiveProps(props) {
    this.selectUnitForValue(props.value);
  }

  onChange(e) {
    const newValue = Number(e.target.value);
    if (!isNaN(newValue)) {
      FieldUtil.setFieldValue(this, newValue * this.state.selectedUnit.value);
    }
  }

  onUnitSelect(e) {
    const unitValue = Number(e.target.getAttribute('data-value'));
    this.props.units.forEach((unit) => {
      if (unit.value === unitValue) {
        this.setState({selectedUnit: unit});
      }
    });
  }

  getDisplayValue(value) {
    if (!isNaN(Number(value))) {
      if (value && this.state.selectedUnit !== undefined) {
        return value / this.state.selectedUnit.value;
      }
    }
    return value;
  }

  getUnitForValue(value) {
    let selectedIndex = 0;
    for (let i = 0; i < this.props.units.length; i++) {
      if (value % this.props.units[i].value === 0) {
        selectedIndex = i;
      }
    }
    return this.props.units[selectedIndex];
  }

  selectUnitForValue(value) {
    this.setState({selectedUnit: this.getUnitForValue(Number(value))});
  }

  render() {
    const unitsDropdown = (<DropdownButton title={this.state.selectedUnit.label} id="input-dropdown-addon" onSelect={this.onUnitSelect}>
      {this.props.units.map((unit, i) => <MenuItem key={i} data-value={unit.value}>{unit.label}</MenuItem>)}
    </DropdownButton>);

    return (
      <span className={this.props.className}>
        <input type="hidden" value={this.props.value}/>
        <Input
        type="text"
        placeholder={this.props.placeholder}
        disabled={this.props.disabled}
        value={this.getDisplayValue(this.props.value)}
        onChange={this.onChange}
        buttonAfter={unitsDropdown} />
      </span>);
  }
}