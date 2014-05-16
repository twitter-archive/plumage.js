define([
  'jquery',
  'moment',
  'PlumageRoot'
], function($, moment, Plumage) {

  Plumage.util.defaultDateFormat = 'MMM Do YYYY, HH:mm:ss';

  return Plumage.util.DateTimeUtil = {

    formatDate: function(timestamp, dateFormat) {
      dateFormat = dateFormat || Plumage.util.defaultDateFormat;
      return new moment(Number(timestamp)*1000).format(dateFormat);
    },

    formatDateUTC: function(timestamp, dateFormat) {
      dateFormat = dateFormat || Plumage.util.defaultDateFormat;
      return new moment(Number(timestamp)*1000).utc().format(dateFormat);
    },

    formatDateFromNow: function(timestamp) {
      return moment(Number(timestamp)*1000).fromNow();
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
