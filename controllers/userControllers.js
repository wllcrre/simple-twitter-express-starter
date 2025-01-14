const bcrypt = require('bcryptjs')
const db = require('../models')
const fs = require('fs')
const User = db.User
const Tweet = db.Tweet
const Like = db.Like
const Reply = db.Reply
const Followship = db.Followship
require('dotenv').config()
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const userController = {
  getUserLikes: (req, res) => {
    return User.findByPk(req.params.id, {
      include:
        [
          {
            model: Tweet,
            as: "LikedTweets",
            include: [
              { model: User, attributes: ['id', 'name', 'avatar'] },
              { model: Reply, attributes: ['id'] },
              {
                model: User,
                as: "LikedUsers",
                attributes: ['id']
              }
            ]
          },
          {
            model: Like,
            attributes: ['id']
          },
          {
            model: User,
            as: 'Followers',
            attributes: ['id']
          },
          {
            model: User,
            as: 'Followings',
            attributes: ['id']
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
      LikedTweets = user.LikedTweets.sort((a, b) => b.Like.dataValues.createdAt - a.Like.dataValues.createdAt)

      LikedTweets = LikedTweets.map(tweet => ({
        ...tweet.dataValues,
        description: tweet.dataValues.description.substring(0, 140)
      }))

      return res.render('userLikes', {
        profile: user,
        LikedTweets: LikedTweets
      })
    })
  },

  getUserFollowings: (req, res) => {
    return User.findByPk(req.params.id, {

      include: [
        Tweet,
        Like,
        { model: User, as: 'Followers' },
        { model: User, as: 'Followings' }
      ]
    }).then(user => {

      //排序依照追蹤紀錄成立的時間，愈新的在愈前面
      Followings = user.Followings.sort((a, b) => b.Followship.dataValues.createdAt - a.Followship.dataValues.createdAt)

      Followings = user.Followings.map(user => ({
        ...user.dataValues,
        introduction: user.dataValues.introduction ? user.dataValues.introduction.substring(0, 140) : "",
        isFollowed: req.user.Followings.map(d => d.id).includes(user.id)
      }))

      user.introduction = user.introduction.substring(0, 140)

      return res.render('userFollowings', {
        profile: user,
        Followings: Followings
      })

    })
  },

  getUserFollowers: (req, res) => {
    return User.findByPk(req.params.id, {

      include: [
        Tweet,
        Like,
        { model: User, as: 'Followers' },
        { model: User, as: 'Followings' }
      ]
    }).then(user => {

      //排序依照追蹤紀錄成立的時間，愈新的在愈前面
      Followers = user.Followers.sort((a, b) => b.Followship.dataValues.createdAt - a.Followship.dataValues.createdAt)

      Followers = user.Followers.map(user => ({
        ...user.dataValues,
        introduction: user.dataValues.introduction ? user.dataValues.introduction.substring(0, 140) : "",
        isFollowed: req.user.Followings.map(d => d.id).includes(user.id)
      }))

      user.introduction = user.introduction.substring(0, 140)

      return res.render('userFollowers', {
        profile: user,
        Followers: Followers
      })

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
      user.introduction = user.introduction ? user.introduction.substring(0, 140) : ""

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
  editUser: (req, res) => {
    return User.findByPk(req.params.id).then(user => {
      return res.render('users/edit', { user: user })
    })
  },
  putUser: (req, res) => {
    if (Number(req.params.id) !== Number(req.user.id)) {
      return res.redirect(`/users/${req.params.id}`)
    }
    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return User.findByPk(req.params.id)
          .then((user) => {
            user.update({
              name: req.body.name,
              introduction: req.body.introduction,
              avatar: file ? img.data.link : null
            }).then((user) => {
              res.redirect(`/users/${req.params.id}/tweets`)
            })
          })
      })
    } else {
      return User.findByPk(req.params.id)
        .then((user) => {
          user.update({
            name: req.body.name,
            introduction: req.body.introduction,
          }).then((user) => {
            res.redirect(`/users/${req.params.id}/tweets`)
          })
        })
    }
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
