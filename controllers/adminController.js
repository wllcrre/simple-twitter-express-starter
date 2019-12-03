const db = require('../models')
const Tweet = db.Tweet
const Reply = db.Reply
const User = db.User


const adminController = {
  getUsers: (req, res) => {

    return User.findAll({
      include:
        [
          {
            model: Tweet,
            include: [{
              model: User,
              as: "LikedUsers"
            }]
          },
          {
            model: Tweet,
            as: "LikedTweets"
          },
          {
            model: User,
            as: "Followers"
          },
          {
            model: User,
            as: "Followings"
          }

        ]
    }).then(users => {

      // 整理 users 資料
      users = users.map(user => ({
        ...user.dataValues,

        TweetsCount: user.Tweets.length,

        // 計算Tweet 被Liked次數    注意: reduce 用法,他可以與前一個回傳的值再次作運算
        LikedUsersCount: user.dataValues.Tweets.reduce(function (preValue, tweet) {
          return preValue + tweet.LikedUsers.length;  // 與前一個值相加
        }, 0)

      }))

      // 按推播文數排序
      users = users.sort((a, b) => b.Tweets.length - a.Tweets.length)

      return res.render('admin/users', { users: users })
    })
  },

  getTweets: (req, res) => {
    // return res.render('admin/tweets')
    return Tweet.findAll(
      {
        include: Reply
      }
    ).then(tweets => {

      // 此處還無法改成限制 50 個字
      //   const data = restaurants.map(r => ({
      //     ...r.dataValues,
      //     description: r.dataValues.description.substring(0, 50)
      //   }))
      // return res.render('admin/tweets', { tweets: data })

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






