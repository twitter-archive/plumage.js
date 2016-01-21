import React, {PropTypes} from 'react';
import moment from 'moment';

import Calendar from './Calendar';
import HourSelect from './HourSelect';
import FieldUtil from './util/FieldUtil';

export default class DateField extends React.Component {

  static propTypes = {
    name: PropTypes.string,
    value: PropTypes.number,
    placeholder: PropTypes.string,
    dateFormat: PropTypes.string,
    calendarProps: PropTypes.object,
    minValue: PropTypes.number,
    maxValue: PropTypes.number,
    utc: PropTypes.bool,
    showHourSelect: PropTypes.bool
  };

  static contextTypes = {
    onFormChange: React.PropTypes.func
  };

  static defaultProps = {
    dateFormat: 'MMM D, YYYY',
    utc: false
  };


  constructor(props) {
    super(props);
    this.moment = this.props.utc ? moment.utc : moment;

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
    this.onHourChange = this.onHourChange.bind(this);

    this.onDaySelect = this.onDaySelect.bind(this);
  }

  componentWillReceiveProps(props) {
    this.moment = props.utc ? moment.utc : moment;
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

  onDisableMouseDown(e) {
    // do nothing so input doesn't lose focus
    e.preventDefault();
    e.stopPropagation();
  }

  onHourChange(value) {
    FieldUtil.setFieldValue(this, value);
  }

  /**
   * Update value and value text. Close the calendar.
   * @param value new timestamp value
   * @param cb Callback passed into setState
   */
  setValue(value) {
    let finalValue = value;
    if (this.props.showHourSelect) {
      const oldM = this.moment(this.props.value);
      const m = this.moment(value);
      m.hour(oldM.hour()).minute(oldM.minute()).second(oldM.second()).millisecond(oldM.millisecond());
      finalValue = m.valueOf();
    }
    FieldUtil.setFieldValue(this, finalValue);
    this.setState({
      showCalendar: false,
      valueText: this.formatDateValue(finalValue),
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

  //
  // Helpers
  //

  formatDateValue(value) {
    return this.moment(value).format(this.props.dateFormat);
  }

  parseDateTextToMoment(text) {
    let result = this.moment(text, this.props.dateFormat);
    if (!result.isValid()) {
      result = this.moment(text);
    }
    return result;
  }

  renderHourSelect() {
    if (!this.props.showHourSelect) {
      return undefined;
    }
    return (
      <HourSelect
        className="input-group-btn"
        value={this.props.value}
        minValue={this.props.minValue}
        maxValue={this.props.maxValue}
        utc={this.props.utc}
        onChange={this.onHourChange}
      />
    );
  }

  render() {
    return (<span className={'dropdown' + (this.state.showCalendar ? ' open' : '')}>
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
        {this.renderHourSelect()}
      </div>
      <div className="picker dropdown-menu" onMouseDown={this.onDisableMouseDown}>
        <Calendar value={this.getCalendarValue()}
                  onSelect={this.onDaySelect}
                  minValue={this.props.minValue}
                  maxValue={this.props.maxValue}
                  utc={this.props.utc}
          {...this.props.calendarProps}/>
      </div>
    </span>);
  }
}