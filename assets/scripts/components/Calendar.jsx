import React, { PropTypes } from 'react';
import moment from 'moment';
import _ from 'underscore';

export default class Calendar extends React.Component {

  static propTypes = {
    daysOfWeek: PropTypes.array,
    monthNames: PropTypes.array,
    firstDayOfWeek: PropTypes.number,
    fromValue: PropTypes.number, // for showing range
    toValue: PropTypes.number,
    minValue: PropTypes.number,
    maxValue: PropTypes.number,
    value: PropTypes.number,
    month: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    year: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    utc: PropTypes.bool,
    onSelect: PropTypes.func
  };

  static defaultProps = {
    daysOfWeek: moment.weekdaysMin().slice(),
    monthNames: moment.monthsShort().slice(),
    firstDayOfWeek: 0
  };

  constructor(props) {
    super(props);
    this.state = {
      value: this.props.value,
      month: this.props.month !== undefined ? Number(this.props.month) : moment(this.props.value).month(),
      year: this.props.year !== undefined ? Number(this.props.year) : moment(this.props.value).year()
    };

    this.onNextMonthClick = this.onNextMonthClick.bind(this);
    this.onPrevMonthClick = this.onPrevMonthClick.bind(this);
    this.onDayClick = this.onDayClick.bind(this);
  }

  componentWillReceiveProps(props) {
    this.setState( {
      value: props.value,
      month: props.month !== undefined ? Number(props.month) : moment(props.value).month(),
      year: props.year !== undefined ? Number(props.year) : moment(props.value).year()
    });
  }

  //
  // Events
  //

  onNextMonthClick() {
    let m = moment([this.state.year, this.state.month]).add(1, 'month');
    this.setState({month: m.month(), year: m.year()});
  }

  onPrevMonthClick() {
    let m = moment([this.state.year, this.state.month]).subtract(1, 'month');
    this.setState({month: m.month(), year: m.year()});
  }

  onDayClick(e) {
    let td = e.target.parentNode;
    if (!td.classList.contains('disabled')) {
      let date = this.getDateFromDayEl(e.target);
      let m = this.utc ? moment.utc(date) : moment(date);
      this.setState({value: m.valueOf()}, function() {
        if (this.props.onSelect) {
          this.props.onSelect(this.state.value);
        }
      });
    }
  }

  //
  // Helpers
  //

  getSelectedDate() {
    let value = this.state.value;
    if (value) {
      return this.toDateTuple(value);
    }
    return null;
  }

  getFromDateTuple() {
    if (this.props.fromValue) {
      return this.toDateTuple(this.props.fromValue);
    }
    return null;
  }

  getToDateTuple() {
    if (this.props.toValue) {
      return this.toDateTuple(this.props.toValue);
    }
    return null;
  }

  //
  // Helpers
  //

  /**
   * Helper: Get 2d array of days
   */
  getCalendarDates(month, year) {
    let calendar = [];
    let curDate = this.getFirstDateTuple(month, year);
    for (let i = 0; i < 6; i++) {
      let week = [];
      for (let j = 0; j < 7; j++) {
        week.push({
          date: curDate,
          className: this.getClassesForDate(curDate, i, j).join(' ')
        });
        let m = moment(curDate).add(1, 'day');
        curDate = [m.year(), m.month(), m.date()];
      }
      calendar.push(week);
    }
    return calendar;
  }

  /**
   * Helper: Get first day on calendar page for month, year
   */
  getFirstDateTuple(month, year) {
    let firstDay = moment([year, month, 1]);
    let monthAgo = moment(firstDay).subtract(1, 'month');

    let daysInLastMonth = monthAgo.daysInMonth();
    let dayOfWeek = firstDay.day();
    let firstDate = daysInLastMonth - dayOfWeek + this.props.firstDayOfWeek + 1;

    if (firstDate > daysInLastMonth) {
      firstDate -= 7;
    }
    if (dayOfWeek === this.props.firstDayOfWeek) {
      firstDate = daysInLastMonth - 6;
    }
    return [monthAgo.year(), monthAgo.month(), firstDate];
  }

  /**
   * Helper: Get CSS classes for a day element.
   */
  getClassesForDate(date, row, col) {
    let inMonth = this.isDateTupleInMonth(date);
    let classes = [
      this.isDateInMinMax(date) ? 'active' : 'disabled',
      inMonth ? null : 'off',
      _.isEqual(date, this.getSelectedDate()) ? 'selected' : null,
      inMonth && _.isEqual(date, this.getFromDateTuple()) ? 'start-date' : null,
      inMonth && _.isEqual(date, this.getToDateTuple()) ? 'end-date' : null,
      this.isDateInSelectedRange(date) ? 'in-range' : null,
      this.getShadowClass(date, row, col)
    ];

    return _.compact(classes);
  }

  /**
   * Helper: Get box shadow class for dates off the current month.
   */
  getShadowClass(date, row, col) {
    if (!this.isDateTupleInMonth(date)) {
      if (row < 2) {
        let nextWeek = this.toDateTuple(moment(date).add(7, 'day'));
        let tomorrow = this.toDateTuple(moment(date).add(1, 'day'));
        if (this.isDateTupleInMonth(nextWeek)) {
          if (col < 6 && this.isDateTupleInMonth(tomorrow)) {
            return 'shadow-bottom-right';
          }
          return 'shadow-bottom';
        }
      } else {
        let lastWeek = this.toDateTuple(moment(date).subtract(7, 'day'));
        let yesterday = this.toDateTuple(moment(date).subtract(1, 'day'));
        if (this.isDateTupleInMonth(lastWeek)) {
          if (col > 0 && this.isDateTupleInMonth(yesterday)) {
            return 'shadow-top-left';
          }
          return 'shadow-top';
        }
      }
    }
    return null;
  }

  getDateFromDayEl(el) {
    return [Number(el.getAttribute('data-year')), Number(el.getAttribute('data-month')), Number(el.innerHTML)];
  }

  isDateTupleInRange(date, minDate, maxDate) {
    return (!minDate || moment(date) >= moment(minDate)) && (!maxDate || moment(date) <= moment(maxDate));
  }

  isDateInSelectedRange(date) {
    let fromDate = this.getFromDateTuple();
    let toDate = this.getToDateTuple();

    if (!fromDate || !toDate) {
      return false;
    }
    return this.isDateTupleInRange(date, fromDate, toDate);
  }

  isDateInMinMax(date) {
    let dateTuple = this.toDateTuple(date);
    return this.isDateTupleInRange(dateTuple, this.props.minValue, this.props.maxValue);
  }

  isDateTupleInMonth(date) {
    return date[1] === this.state.month;
  }

  toDateTuple(date) {
    if (!date) {
      return null;
    }
    if (Array.isArray(date)) {
      return date;
    }
    let m = date;
    if (typeof(m) === 'number') {
      m = this.props.utc ? moment.utc(m) : moment(m);
    } else {
      m = moment(m);
    }
    return [m.year(), m.month(), m.date()];
  }

  render() {
    let month = this.props.monthNames[this.state.month];
    let calendar = this.getCalendarDates(this.state.month, this.state.year);
    let calendarEls = calendar.map((week, i) =>{
      return (<tr key={'week-' + i}>{week.map((day, j) => {
        return (
          <td className={day.className} key={'day-' + i + '-' + j}>
            <div className="day" onClick={this.onDayClick} data-year={day.date[0]} data-month={day.date[1]}>
              {day.date[2]}
            </div>
          </td>);
      })}</tr>);
    });

    return (<div className="calendar-view">
      <table>
        <thead>
        <tr>
          <th className="prev available" onClick={this.onPrevMonthClick}><span className="glyphicon glyphicon-arrow-left"></span></th>
          <th colSpan="5" className="calendar-title">{month + ' ' + this.state.year}</th>
          <th className="next available" onClick={this.onNextMonthClick}><span className="glyphicon glyphicon-arrow-right"></span></th>
        </tr>
        <tr>
          {this.props.daysOfWeek.map((name) => {
            return <th key={name}>{name}</th>;
          })}
        </tr>
        </thead>
        <tbody>
        {calendarEls}
        </tbody>
      </table>
    </div>);
  }
}