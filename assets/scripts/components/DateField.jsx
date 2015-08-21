import Plumage from 'PlumageRoot';

import React, {PropTypes} from 'react';
import moment from 'moment';
import _ from 'underscore';

import Calendar from './Calendar';
import FieldUtil from './util/FieldUtil';

export default class DateField extends React.Component {

  static propTypes = {
    placeholder: PropTypes.string,
    dateFormat: PropTypes.string,
    calendarProps: PropTypes.object,
    minValue: PropTypes.number,
    maxValue: PropTypes.number,
    utc: PropTypes.boolean
  };

  static defaultProps = {
    dateFormat: 'MMM D, YYYY',
    utc: false
  };

  constructor(props) {
    super(props);
    this.state = {
      value: this.props.value,
      valueText: this.formatDateValue(this.props.value),
      textChanged: false,
      showCalendar: false
    };

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onTextChange = this.onTextChange.bind(this);
    this.onButtonClick = this.onButtonClick.bind(this);
    this.onInputClick = this.onInputClick.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);

    this.onDaySelect = this.onDaySelect.bind(this);
  }

  componentWillReceiveProps(props) {
    this.setState({value: props.value});
  }

  render() {

    return <span className={'dropdown' + (this.state.showCalendar ? ' open' : '')}>
      <div className="input-group">
        <span className="input-group-btn" onClick={this.onButtonClick}>
          <a className="btn btn-default" data-toggle="dropdown" data-target="#" onMouseDown={this.disableMouseDown}>
            <span className="glyphicon glyphicon-calendar" onMouseDown={this.disableMouseDown}></span>
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
      <div className="picker dropdown-menu" onMouseDown={this.disableMouseDown}>
        <Calendar value={this.getCalendarValue()}
                  onSelect={this.onDaySelect}
                  minValue={this.props.minValue}
                  maxValue={this.props.maxValue}
          {...this.props.calendarProps}/>
      </div>
    </span>;
  }

  /**
   * Update value and value text. Close the calendar.
   * @param value new timestamp value
   * @param cb Callback passed into setState
   */
  setValue(value) {
    var oldValue = this.state.value;
    FieldUtil.setFieldValue(this, value, {
      showCalendar: false,
      valueText: this.formatDateValue(value),
      textChanged: false
    });
  }

  getCalendarValue() {
    if (this.state.textChanged) {
      var result = this.parseDateTextToMoment(this.state.valueText);
      if (result.isValid()) {
        return result.valueOf();
      }
    }
    return this.state.value;
  }

  /**
   * update value from valueText if its valid. Close the calendar.
   */
  commitText() {
    var newValue = this.parseDateTextToMoment(this.state.valueText);
    if (newValue.isValid()) {
      this.setValue(newValue.valueOf());
    } else {
      this.setValue(this.state.value);
    }
  }

  getValue() {
    return this.state.value;
  }

  //
  // Helpers
  //

  formatDateValue(value) {
    return moment(value).format(this.props.dateFormat);
  }

  parseDateTextToMoment(text) {
    var result = moment(text, this.props.dateFormat);
    if (!result.isValid()) {
      result = moment(text);
    }
    return result
  }

  //
  // Events
  //

  onTextChange(e) {
    this.setState({valueText: e.target.value, textChanged: true});
  }

  onKeyDown(e) {
    switch (e.key) {
      case "Enter":
        e.preventDefault();
        this.commitText();
        break;
      case "Escape":
        e.preventDefault();
        this.setValue(this.state.value);
        break;
      case "ArrowDown":
        e.preventDefault();
        this.setState({showCalendar: true});
        break;
      case "ArrowUp":
        e.preventDefault();
        this.setState({showCalendar: false});
        break;
    }
  }

  onButtonClick(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({showCalendar: !this.state.showCalendar}, function() {
      if (this.state.showCalendar) {
        this.refs.input.focus();
      }
    });
  }

  onInputClick() {
    this.setState({showCalendar: true});
  }

  onFocus() {
    this.setState({showCalendar: true});
  }

  onBlur(event) {
    this.commitText();
  }

  onDaySelect(value) {
    this.setValue(value);
  }

  disableMouseDown(e) {
    //do nothing so input doesn't lose focus
    e.preventDefault();
    e.stopPropagation();
  }
}