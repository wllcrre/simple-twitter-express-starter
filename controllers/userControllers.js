const bcrypt = require('bcrypt-nodejs')
const db = require('../models')
const User = db.User
const Tweet = db.Tweet
const Like = db.Like
const Reply = db.Reply

const userController = {
  getUserLikes: (req, res) => {
    return User.findByPk(req.params.id, {
      include:
        [
          {
            model: Tweet,
            as: "LikedTweets",
            order: [
              [{ Like }, 'createdAt', 'DESC']
            ],
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
      user.LikedTweets = user.LikedTweets.sort((a, b) => b.createdAt - a.createdAt)
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
