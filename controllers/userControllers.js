const bcrypt = require('bcrypt-nodejs')
const db = require('../models')
const User = db.User
const Tweet = db.Tweet
const Like = db.Like
const Reply = db.Reply
const Followship = db.Followship

const userController = {
  getUserLikes: (req, res) => {
    return User.findByPk(req.params.id, {
      include:
        [
          {
            model: Tweet,
            as: "LikedTweets",
            include: [
              { model: User },
              { model: Reply },
              {
                model: User,
                as: "LikedUsers"
              }
            ]
          }
        ]
    }).then(user => {
      // console.log(user.LikedTweets)

      // console.log('====================')
      // console.log('====================')
      // user.LikedTweets.forEach((tweet) => {
      //   console.log(tweet.createdAt)
      //   console.log(tweet.Like.dataValues.createdAt)
      // })

      // user.LikedTweets = user.LikedTweets.sort((a, b) => b.createdAt - a.createdAt)
      user.LikedTweets = user.LikedTweets.sort((a, b) => b.Like.dataValues.createdAt - a.Like.dataValues.createdAt)

      return res.render('userLikes', { user: user })
    })
  },

  getUserFollowings: (req, res) => {
    return User.findByPk(req.params.id, {
      include:
        [
          {
            model: User,
            as: "Followings"
          }
        ]
    }).then(user => {
      // console.log(user.Followings)

      // console.log('====================')
      // console.log('====================')
      // user.Followings.forEach((user) => {
      //   console.log(user.createdAt)
      //   console.log(user.Followship.dataValues.createdAt)
      // })

      //排序依照追蹤紀錄成立的時間，愈新的在愈前面
      user.Followings = user.Followings.sort((a, b) => b.Followship.dataValues.createdAt - a.Followship.dataValues.createdAt)
      return res.render('userFollowings', { user: user })
    })
  },

  getUserFollowers: (req, res) => {
    return User.findByPk(req.params.id, {
      include:
        [
          {
            model: User,
            as: "Followers"
          }
        ]
    }).then(user => {
      // console.log(user.Followings)

      // console.log('====================')
      // console.log('====================')
      // user.Followings.forEach((user) => {
      //   console.log(user.createdAt)
      //   console.log(user.Followship.dataValues.createdAt)
      // })

      //排序依照追蹤紀錄成立的時間，愈新的在愈前面
      user.Followers = user.Followers.sort((a, b) => b.Followship.dataValues.createdAt - a.Followship.dataValues.createdAt)
      return res.render('userFollowers', { user: user })
    })
  },

  getUser: (req, res) => {
    return User.findByPk(req.params.id, {

      include: [
        Tweet,
        Like,
        { model: User, as: 'Followers' },
        { model: User, as: 'Followings' }
      ]
    }).then(user => {
      const isFollowed = req.user.Followings.map(d => d.id).includes(user.id)
      user.introduction = user.introduction.substring(0, 140)

      Tweet.findAll({
        where: { UserId: req.params.id },
        order: [['createdAt', 'DESC']],
        include: [Like, Reply, User]
      }).then(tweets => {

        tweets = tweets.map(tweet => ({
          ...tweet.dataValues,
          description: tweet.dataValues.description.substring(0, 140),
          isLiked: req.user.LikedTweets.map(d => d.id).includes(tweet.id)
        }))

        return res.render('users/profile', {
          profile: user,
          isFollowed: isFollowed,
          tweets: tweets
        })
      })

    })
  },

  addFollowing: (req, res) => {
    return Followship.create({
      followerId: req.user.id,
      followingId: req.params.userId
    })
      .then((followship) => {
        return res.redirect('back')
      })
  },

  removeFollowing: (req, res) => {
    return Followship.findOne({
      where: {
        followerId: req.user.id,
        followingId: req.params.userId
      }
    })
      .then((followship) => {
        followship.destroy()
          .then((followship) => {
            return res.redirect('back')
          })
      })
  },

  addLike: (req, res) => {
    return Like.create({
      UserId: req.user.id,
      TweetId: req.params.id
    })
      .then((tweet) => {
        return res.redirect('back')
      })
  },

  removeLike: (req, res) => {
    return Like.findOne({
      where: {
        UserId: req.user.id,
        TweetId: req.params.id
      }
    })
      .then((Like) => {
        Like.destroy()
          .then((tweet) => {
            return res.redirect('back')
          })
      })
  },

  signUpPage: (req, res) => {
    return res.render('signup')
  },

  signUp: (req, res) => {
    // confirm password
    if (req.body.passwordCheck !== req.body.password) {
      req.flash('error_messages', '兩次密碼輸入不同！')
      return res.redirect('/signup')
    } else {
      // confirm unique user
      User.findOne({ where: { email: req.body.email } }).then(user => {
        if (user) {
          req.flash('error_messages', '信箱重複！')
          return res.redirect('/signup')
        } else {
          User.create({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
          }).then(user => {
            req.flash('success_messages', '成功註冊帳號！')
            return res.redirect('/signin')
          })
        }
      })
    }
  },

  signInPage: (req, res) => {
    return res.render('signin')
  },

  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/')
  },

  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  }

}

module.exports = userController
