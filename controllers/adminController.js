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
            model: Tweet
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
      return res.render('admin/users', { users: users })
    })
  },


  getUser: (req, res, callback) => {
    return User.findByPk(req.params.id, {
      include:
        [
          {
            model: Comment,
            include: [Restaurant]
          },
          {
            model: Restaurant,
            as: "FavoritedRestaurants"
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
    }).then(user => {
      callback({
        user: user
      })
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






