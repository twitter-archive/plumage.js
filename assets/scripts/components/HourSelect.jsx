import {PropTypes} from 'react';

import classNames from 'classnames';
import moment from 'moment';

import DropdownSelect from './DropdownSelect';

export default class HourSelect extends DropdownSelect {

  static propTypes = {
    name: PropTypes.string,
    // timestamp
    value: PropTypes.number,
    hourFormat: PropTypes.string,
    minValue: PropTypes.number,
    maxValue: PropTypes.number,
    utc: PropTypes.bool
  };

  static defaultProps = {
    hourFormat: 'ha',
    utc: false
  };

  constructor(props) {
    super(props);
    this.moment = this.props.utc ? moment.utc : moment;
  }

  componentWillReceiveProps(props) {
    this.moment = props.utc ? moment.utc : moment;
  }

  getClassNames() {
    return Object.assign(super.getClassNames(), {'hour-select': true});
  }

  getSelectedHour() {
    const m = this.moment(this.props.value);
    return m.hour();
  }

  getOptions() {
    return Array.from(new Array(24).keys()).map((hour) => {
      return {
        value: this.getValueForHour(hour),
        label: moment({hour: hour}).format(this.props.hourFormat),
        className: classNames(this.getClassesForHour(hour))
      };
    });
  }

  getClassesForHour(hour) {
    return {
      disabled: !this.isHourInMinMax(hour),
      selected: hour === this.getSelectedHour()
    };
  }

  getValueForHour(hour) {
    const {value} = this.props;
    let m;
    if (value !== undefined) {
      m = this.moment(value);
    } else {
      m = this.moment().startOf('day');
    }
    return m.hour(hour).valueOf();
  }

  isHourInMinMax(hour) {
    const {minValue, maxValue} = this.props;
    const hourValue = this.getValueForHour(hour);

    return (!minValue || hourValue >= minValue) && (!maxValue || hourValue <= maxValue);
  }

  processDomValue(value) {
    return Number(value);
  }
}