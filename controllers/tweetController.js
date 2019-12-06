const db = require('../models')
const Tweet = db.Tweet
const User = db.User
const Like = db.Like
const Followship = db.Followship
const Reply = db.Reply

const tweetController = {

  getTweets: (req, res) => {
    return User.findAll({
      where: { id: { $not: req.user.id } },
      include: [
        { model: User, as: 'Followers' },
        // { model: Tweet, as: 'LikedTweets' }
      ]
    }).then(users => {
      users = users.map(user => ({
        ...user.dataValues,
        introduction: user.dataValues.introduction.substring(0, 140),
        FollowerCount: user.Followers.length,

      }))
      users = users.sort((a, b) => b.FollowerCount - a.FollowerCount).splice(0, 10)

      Tweet.findAll({
        order: [['createdAt', 'DESC']],
        include: [Like, Reply, User]
      }).then(tweets => {
        tweets = tweets.map(tweet => ({
          ...tweet.dataValues,
          description: tweet.dataValues.description.substring(0, 140),
          isLiked: req.user.LikedTweets.map(d => d.id).includes(tweet.id)
        }))

        return res.render('Tweets', {
          users: users,
          tweets: tweets
        })
      })
    })
  },
}

module.exports = tweetController