const db = require('../models')
const Tweet = db.Tweet
const User = db.User
const Like = db.Like
/*const Followship = db.Followship
const Reply = db.Reply

*/

const tweetController = {

  getTweets: (req, res) => {
    return Tweet.findAll({
      where: { UserId: { $not: req.user.id } },
      //limit: 10,
      include: [User]

    }).then(tweets => {

      tweets = tweets.map(tweet => ({
        ...tweet.dataValues,
        description: tweet.dataValues.description.substring(0, 50),
        FavoriteCount: Like.length,
      }))
      tweets = tweets.sort((a, b) => b.FavoriteCount - a.FavoriteCount).splice(0, 10)


      Tweet.findAll({
        where: { UserId: req.user.id },
        include: [User]
      }).then(feeds => {

        feeds = feeds.map(feed => ({
          ...feed.dataValues,
          description: feed.dataValues.description.substring(0, 50),
        }))

        return res.render('Tweets', {
          tweets: tweets,
          feeds: feeds
        })
      })
    })
  }


}

module.exports = tweetController