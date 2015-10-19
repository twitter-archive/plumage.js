import React, {PropTypes} from 'react';
import moment from 'moment';
import _ from 'underscore';

import Calendar from './Calendar';

export default class DateRangeField extends React.Component {
  static propTypes = {
    name: PropTypes.string,
    fromValue: PropTypes.number,
    toValue: PropTypes.number,
    fromName: PropTypes.string,
    toName: PropTypes.string,
    ranges: PropTypes.array,
    placeholder: PropTypes.string,
    dateFormat: PropTypes.string,
    calendarProps: PropTypes.object,
    minValue: PropTypes.number,
    maxValue: PropTypes.number,
    utc: PropTypes.bool,
    onModelChange: PropTypes.func
  };

  static defaultProps = {
    dateFormat: 'MMM D, YYYY',
    ranges: [{name: 'Today', from: 'today', to: 'today'},
      {name: 'Yesterday', from: {day: -1}, to: {day: -1}},
      {name: 'Last 7 Days', from: {day: -6}, to: 'today'},
      {name: 'Last 30 Days', from: {day: -29}, to: 'today'},
      {name: 'Last 90 Days', from: {day: -89}, to: 'today'}
    ]
  };

  constructor(props) {
    super(props);
    this.state = {
      fromValue: this.props.fromValue,
      toValue: this.props.toValue,
      fromCalendarValue: this.props.fromValue,
      toCalendarValue: this.props.toValue,
      valueText: this.formatDateValue(this.props.fromValue) + ' - ' + this.formatDateValue(this.props.toValue),
      textChanged: false,
      showPicker: false
    };

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onTextChange = this.onTextChange.bind(this);
    this.onButtonClick = this.onButtonClick.bind(this);
    this.onInputClick = this.onInputClick.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);

    this.onFromDaySelect = this.onFromDaySelect.bind(this);
    this.onToDaySelect = this.onToDaySelect.bind(this);
    this.onRangeClick = this.onRangeClick.bind(this);

    this.onApplyClick = this.onApplyClick.bind(this);
    this.onCancelClick = this.onCancelClick.bind(this);
  }

  //
  // Events
  //

  onTextChange(e) {
    this.setState({valueText: e.target.value, textChanged: true});
  }

  onKeyDown(e) {
    switch (e.key) {
    case 'Enter':
      e.preventDefault();
      this.commitText();
      break;
    case 'Escape':
      e.preventDefault();
      this.revertValues();
      break;
    case 'ArrowDown':
      e.preventDefault();
      this.setState({showPicker: true});
      break;
    default:
      break;
    }
  }

  onButtonClick(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({showPicker: !this.state.showPicker}, function() {
      if (this.state.showPicker) {
        this.refs.input.focus();
      }
    });
  }

  onInputClick() {
    this.setState({showPicker: true});
  }

  onFocus() {
    this.setState({showPicker: true});
  }

  onBlur() {
    if (this.state.textChanged) {
      this.commitText();
    }
  }

  onFromDaySelect(value) {
    this.setCalendarValues(value, this.state.toCalendarValue, true);
  }

  onToDaySelect(value) {
    this.setCalendarValues(this.state.fromCalendarValue, value, true);
  }

  onRangeClick(e) {
    e.preventDefault();
    e.stopPropagation();
    let range = _.findWhere(this.props.ranges, {name: e.target.text});
    this.selectPresetRange(range);
  }

  onApplyClick(e) {
    e.preventDefault();
    this.setValues(this.state.fromCalendarValue, this.state.toCalendarValue, false);
  }

  onCancelClick(e) {
    e.preventDefault();
    this.revertValues();
  }

  onDisableMouseDown(e) {
    // do nothing so input doesn't lose focus
    e.preventDefault();
    e.stopPropagation();
  }

  //
  // Helpers
  //

  getFromCalendarValue() {
    if (this.state.textChanged) {
      let values = this.parseTextToMoments(this.state.valueText);
      if (values[0].isValid()) {
        return values[0].valueOf();
      }
    }
    return this.state.fromCalendarValue;
  }

  getToCalendarValue() {
    if (this.state.textChanged) {
      let values = this.parseTextToMoments(this.state.valueText);
      if (values[1].isValid()) {
        return values[1].valueOf();
      }
    }
    return this.state.toCalendarValue;
  }

  setCalendarValues(fromValue, toValue) {
    if (!this.validateValues(fromValue, toValue) && fromValue && toValue) {
      return;
    }

    this.setState({
      fromCalendarValue: fromValue,
      toCalendarValue: toValue,
      valueText: this.formatDateValue(fromValue) + ' - ' + this.formatDateValue(toValue),
      textChanged: false
    });
  }

  setValues(fromValue, toValue, showPicker) {
    if (!this.validateValues(fromValue, toValue)) {
      this.revertValues();
      return;
    }

    let oldFromValue = this.state.fromValue;
    let oldToValue = this.state.toValue;
    this.setState({
      fromValue: fromValue,
      toValue: toValue,
      fromCalendarValue: fromValue,
      toCalendarValue: toValue,
      showPicker: showPicker,
      valueText: this.formatDateValue(fromValue) + ' - ' + this.formatDateValue(toValue),
      textChanged: false
    });

    if (this.props.onModelChange && (oldFromValue !== fromValue || oldToValue !== toValue)) {
      let newValues = {};
      newValues[this.props.fromName] = fromValue;
      newValues[this.props.toName] = toValue;
      this.props.onModelChange(this, newValues);
    }
  }

  validateValues(fromValue, toValue) {
    return fromValue <= toValue &&
      (!this.props.minValue || fromValue >= this.props.minValue) &&
      (!this.props.maxValue || toValue <= this.props.maxValue);
  }

  revertValues() {
    this.setValues(this.state.fromValue, this.state.toValue, false);
  }

  /**
   * update value from valueText if its valid. Close the calendar.
   */
  commitText() {
    let newValues = this.parseTextToMoments(this.state.valueText);
    if (newValues[0].isValid() && newValues[1].isValid()) {
      this.setValues(newValues[0].valueOf(), newValues[1].valueOf(), false);
    } else {
      this.setValues(this.state.fromValue, this.state.toValue, false);
    }
  }

  formatDateValue(value) {
    return moment(value).format(this.props.dateFormat);
  }

  parseTextToMoments(text) {
    let parts = text.split(' - ');
    return [moment(parts[0], this.props.dateFormat), moment(parts[1], this.props.dateFormat)];
  }

  /** Helper: select the specified preset (value from [ranges]{@link Plumage.view.form.fields.DateRangePicker#ranges}) */
  selectPresetRange(range) {
    let value = [range.from, range.to];
    let today = this.props.utc ? moment.utc().startOf('day') : moment().startOf('day');
    for (let i = 0; i < value.length; i++) {
      if (value[i] === 'today') {
        value[i] = today;
      } else {
        value[i] = today.clone().add(value[i]);
      }
    }
    this.setCalendarValues(value[0].startOf('day').valueOf(), value[1].valueOf(), true);
  }

  render() {
    let fromCalendarValue = this.getFromCalendarValue();
    let toCalendarValue = this.getToCalendarValue();

    return (<span className={'date-range-field dropdown' + (this.state.showPicker ? ' open' : '')}>
      <div className="input-group">
        <span className="input-group-btn" onClick={this.onButtonClick}>
          <a className="btn btn-default" data-toggle="dropdown" data-target="#" onMouseDown={this.onDisableMouseDown}>
            <span className="glyphicon glyphicon-calendar" onMouseDown={this.onDisableMouseDown}></span>
          </a>
        </span>
        <input ref="input" type="text" className="form-control"
               placeholder={this.props.placeholder}
               name={this.props.name}
               value={this.state.valueText}
               onChange={this.onTextChange}
               onKeyDown={this.onKeyDown}
               onClick={this.onInputClick}
               onFocus={this.onFocus}
               onBlur={this.onBlur}
          />
      </div>
      <div className="picker dropdown-menu" onMouseDown={this.onDisableMouseDown}>
        <div className="calendar-wrap">
          <div className="date-field">
            <label className="control-label">From</label>
          </div>
          <Calendar value={fromCalendarValue}
                    fromValue={fromCalendarValue}
                    toValue={toCalendarValue}
                    minValue={this.props.minValue}
                    maxValue={toCalendarValue || this.props.maxValue}
                    onSelect={this.onFromDaySelect}
            {...this.props.calendarProps}/>
        </div>

        <div className="calendar-wrap">
          <div className="date-field">
            <label className="control-label">To</label>
          </div>
          <Calendar value={toCalendarValue}
                    fromValue={fromCalendarValue}
                    toValue={toCalendarValue}
                    minValue={fromCalendarValue || this.props.minValue}
                    maxValue={this.props.maxValue}
                    onSelect={this.onToDaySelect}
            {...this.props.calendarProps}/>
        </div>

        <div className="ranges-wrap">
          <ul className="ranges">
            {this.props.ranges.map((range) => {
              return <li><a href="#" onClick={this.onRangeClick}>{range.name}</a></li>;
            })}
          </ul>
          <button className="btn btn-default btn-small apply" onClick={this.onApplyClick}>Apply</button>
          <a href="#" className="cancel" onClick={this.onCancelClick}>cancel</a>
        </div>
      </div>
    </span>);
  }

}
