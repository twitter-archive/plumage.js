import React, {PropTypes} from 'react';
import moment from 'moment';

import FieldUtil from './util/FieldUtil';

export default class HourSelect extends React.Component {

  static propTypes = {
    name: PropTypes.string,
    value: PropTypes.number,
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
      this.setValue(this.state.value);
      break;
    case 'ArrowDown':
      e.preventDefault();
      this.setState({showCalendar: true});
      break;
    case 'ArrowUp':
      e.preventDefault();
      this.setState({showCalendar: false});
      break;
    default:
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

  onBlur() {
    this.commitText();
  }

  onDaySelect(value) {
    this.setValue(value);
  }

  ononDisableMouseDown(e) {
    // do nothing so input doesn't lose focus
    e.preventDefault();
    e.stopPropagation();
  }

  /**
   * Update value and value text. Close the calendar.
   * @param value new timestamp value
   * @param cb Callback passed into setState
   */
  setValue(value) {
    FieldUtil.setFieldValue(this, value, {
      showCalendar: false,
      valueText: this.formatDateValue(value),
      textChanged: false
    });
  }

  getCalendarValue() {
    if (this.state.textChanged) {
      let result = this.parseDateTextToMoment(this.state.valueText);
      if (result.isValid()) {
        return result.valueOf();
      }
    }
    return this.state.value;
  }

  getValue() {
    return this.state.value;
  }

  //
  // Helpers
  //

  /**
   * update value from valueText if its valid. Close the calendar.
   */
  commitText() {
    let newValue = this.parseDateTextToMoment(this.state.valueText);
    if (newValue.isValid()) {
      this.setValue(newValue.valueOf());
    } else {
      this.setValue(this.state.value);
    }
  }

  formatDateValue(value) {
    return moment(value).format(this.props.dateFormat);
  }

  parseDateTextToMoment(text) {
    let result = moment(text, this.props.dateFormat);
    if (!result.isValid()) {
      result = moment(text);
    }
    return result;
  }

  render() {
    return <div></div>;
  }
}