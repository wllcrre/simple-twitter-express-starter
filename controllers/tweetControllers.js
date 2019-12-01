const db = require('../models')
const Tweet = db.Tweet
const User = db.User
const Like = db.Like
const Followship = db.Followship
/*const Followship = db.Followship
const Reply = db.Reply

*/

const tweetController = {

  getTweets: (req, res) => {
    return User.findAll({
      where: { id: { $not: req.user.id } },
      include: [
        { model: User, as: 'Followers' }
      ]
    }).then(users => {
      users = users.map(user => ({
        ...user.dataValues,
        introduction: user.dataValues.introduction.substring(0, 140),
        FollowerCount: user.Followers.length,
        isFollowed: req.user.Followings.map(d => d.id).includes(user.id)
      }))
      users = users.sort((a, b) => b.FollowerCount - a.FollowerCount).splice(0, 10)


      Tweet.findAll({
        where: { UserId: req.user.id },
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [User]
      }).then(tweets => {

        tweets = tweets.map(tweet => ({
          ...tweet.dataValues,
          description: tweet.dataValues.description.substring(0, 140),
        }))

        return res.render('Tweets', {
          users: users,
          tweets: tweets
        })
      })
    })
  },

  postTweets: (req, res) => {
    return Tweet.create({
      description: req.body.text,
      UserId: req.user.id
    })
      .then((tweet) => {
        return res.redirect('Tweets')
      })
  },


}

module.exports = tweetController