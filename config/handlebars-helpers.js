const moment = require('moment')

module.exports = {
  ifCond: function (a, b, options) {
    if (a === b) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  },
  moment: function (a) {
    // return moment(a).fromNow()
    return moment(a).format('YYYY-MM-DD, HH:MM');
  }
}