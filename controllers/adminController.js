const db = require('../models')
const Tweet = db.Tweet


const adminController = {
  getTweets: (req, res) => {
    // return res.render('admin/tweets')
    return Tweet.findAll().then(tweets => {
      return res.render('admin/tweets', { tweets: tweets })
    })
  },
  deleteTweet: (req, res) => {
    return Tweet.findByPk(req.params.id)
      .then((tweet) => {
        tweet.destroy()
          .then((tweet) => {
            res.redirect('/admin/tweets')
          })
      })
  }

}

module.exports = adminController
