define([
  'jquery',
  'backbone',
  'moment',
  'PlumageRoot',
  'util/DateTimeUtil'
], function($, Backbone, moment, Plumage, DateTimeUtil) {

  return Plumage.view.grid.Formatters = {

    MoneyFormatter: function(row, cell, value, columnDef, dataContext) {
      if (value && value.toFixed) {
        return value.toFixed(2);
      }
      return value;
    },

    DateFromNowFormatter: function(row, cell, value, columnDef, dataContext) {
      //return new Date(Number(value)*1000).toString(columnDef.dateFormat);
      return DateTimeUtil.formatDateFromNow(value);
    },

    DateFormatter: function(row, cell, value, columnDef, dataContext) {
      return DateTimeUtil.formatDate(value, columnDef.dateFormat);
    },

    DateFormatterUTC: function(row, cell, value, columnDef, dataContext) {
      return DateTimeUtil.formatDateUTC(value, columnDef.dateFormat);
    },

    DurationFormatter: function(row, cell, value, columnDef, dataContext) {
      return DateTimeUtil.formatDurationShort(Number(value)*1000);
    },

    NameWithCommentsFormatter: function(row, cell, value, columnDef, dataContext) {
      //return new Date(Number(value)*1000).toString(columnDef.dateFormat);
      var count = dataContext.get('comments_count');
      if (count > 0) {
        return value + '<span class="comments-count-icon">' + count + '</span>';
      } else {
        return value;
      }
    }
  };
});