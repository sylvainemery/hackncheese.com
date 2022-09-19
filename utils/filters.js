const { DateTime } = require('luxon');

module.exports = {
  head: function (array, n) {
    if (!Array.isArray(array) || array.length === 0) {
      return [];
    }
    if (n < 0) {
      return array.slice(n);
    }
    return array.slice(0, n);
  },

  dateToFormat: function (date, format) {
    return DateTime.fromJSDate(date, { zone: 'utc' }).toFormat(String(format));
  },
};
