define([
  'jquery',
  'moment',
  'PlumageRoot'
], function($, moment, Plumage) {

  Plumage.util.defaultDateFormat = 'MMM Do YYYY, HH:mm:ss';

  return Plumage.util.DateTimeUtil = {

    parseDateStringFromUser: function(value, utc) {
      if (!value) {
        return null;
      }
      return utc ? moment.utc(new Date(value + ' GMT')) : moment(new Date(value));
    },

    parseRelativeDate: function(date, utc) {
      var today = utc ? moment.utc({hour: 0}) : moment({hour: 0});
      if (date === 'today') {
        date = today;
      } else if ($.isPlainObject(date)) {
        date = today.clone().add(date);
      }
      return date;
    },

    isSameDay: function(date1, date2, isUtc) {
      if (!date1 || !date2) {
        return false;
      }
      if ($.isNumeric(date1)) {
        date1 = isUtc ? moment.utc(date1) : moment(date1);
      }
      if ($.isNumeric(date2)) {
        date2 = isUtc ? moment.utc(date2) : moment(date2);
      }
      return date1.format('YYYY-MM-DD') === date2.format('YYYY-MM-DD');
    },

    isDateInRange: function(date, minDate, maxDate, isUtc) {
      if ($.isNumeric(date)) {
        date = isUtc ? moment.utc(date) : moment(date);
      }

      return !((minDate && ! Plumage.util.DateTimeUtil.isSameDay(date, minDate) && date.isBefore(minDate)) || (
          maxDate && ! Plumage.util.DateTimeUtil.isSameDay(date, maxDate, isUtc) && date.isAfter(maxDate)));
    },

    formatDate: function(timestamp, dateFormat) {
      dateFormat = dateFormat || Plumage.util.defaultDateFormat;
      return new moment(Number(timestamp)).format(dateFormat);
    },

    formatDateUTC: function(timestamp, dateFormat) {
      dateFormat = dateFormat || Plumage.util.defaultDateFormat;
      return new moment(Number(timestamp)).utc().format(dateFormat);
    },

    formatDateFromNow: function(timestamp) {
      return moment(Number(timestamp)).fromNow();
    },

    formatDuration: function(millis) {
      if (millis <= 0) {
        return 'None';
      }
      var d = moment.duration(millis), result = '',
        days = Math.floor(d.valueOf()/(3600000*24)),
        hours = d.hours(),
        minutes = d.minutes(),
        started = false;

      if (millis < 60000) {
        return d.seconds() + ' seconds';
      }
      if(days > 0) {
        started = true;
        result += days + (days === 1 ? ' day ' : ' days ');
      }

      if(hours > 0 || started) {
        started = true;
        result += hours + (hours === 1 ? ' hour ' : ' hours ');
      }

      if(minutes > 0 || started) {
        started = true;
        result += minutes + (minutes === 1 ? ' minute' : ' minutes');
      }

      return result;
    },

    formatDurationShort: function(millis) {
      if (millis <= 0) {
        return 'None';
      }
      var d = moment.duration(millis), result = '',
        days = Math.floor(d.valueOf()/(3600000*24)),
        hours = d.hours(),
        minutes = d.minutes(),
        started = false;

      if (millis < 60000) {
        return d.seconds() + 's';
      }

      if(days > 0) {
        started = true;
        result += days + 'd ';
      }

      if(hours > 0 || started) {
        started = true;
        result += hours + 'h ';
      }

      if(minutes > 0 || started) {
        started = true;
        result += minutes + 'm';
      }
      return result;
    }
  };
});
