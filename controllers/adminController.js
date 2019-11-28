const db = require('../models')
const Tweet = db.Tweet


const adminController = {
  getTweets: (req, res) => {
    // return res.render('admin/tweets')
    return Tweet.findAll().then(tweets => {
      return res.render('admin/tweets', { tweets: tweets })
    })
  }
}

module.exports = adminController
