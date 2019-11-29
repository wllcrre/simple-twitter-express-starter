const db = require('../models')
const Tweet = db.Tweet
const User = db.User
/*const Followship = db.Followship
const Reply = db.Reply

const Like = db.Like*/

const tweetController = {

  getTweets: (req, res) => {
    Tweet.findAll({
      where: { UserId: req.user.id },
      include: [User]
    }).then(Tweets => {

      return res.render('Tweets', {
        Tweets: Tweets
      })
    })
  }


}

module.exports = tweetController