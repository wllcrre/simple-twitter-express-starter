const userController = require('../controllers/userControllers')
const adminController = require('../controllers/adminController.js')
const tweetController = require('../controllers/tweetController')

const helpers = require('../_helpers')
const multer = require('multer')
const upload = multer({ dest: 'temp/' })

module.exports = (app, passport) => { // 記得這邊要接收 passport

  const authenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next()
    }
    res.redirect('/signin')
  }


  const authenticatedAdmin = (req, res, next) => {
    if (req.isAuthenticated()) {
      if (req.user.role === "admin") { return next() }
      return res.redirect('/')
    }
    res.redirect('/signin')
  }

  app.get('/', (req, res) => res.redirect('tweets'))
  app.get('/tweets', authenticated, tweetController.getTweets)
  app.post('/tweets', authenticated, tweetController.postTweets)

  app.get('/tweets/:tweet_id/replies', authenticated, tweetController.getReply)
  app.post('/tweets/:tweet_id/replies', authenticated, tweetController.postReply)

  app.get('/', authenticated, (req, res) => res.render('tweets'))
  app.get('/users/:id/likes', authenticated, userController.getUserLikes)
  app.get('/users/:id/followings', authenticated, userController.getUserFollowings)
  app.get('/users/:id/followers', authenticated, userController.getUserFollowers)

  app.get('/users/:id/tweets', authenticated, userController.getUser)
  app.get('/users/:id/edit', authenticated, userController.editUser)
  app.put('/users/:id', authenticated, upload.single('avatar'), userController.putUser)

  app.post('/following/:userId', authenticated, userController.addFollowing)
  app.delete('/following/:userId', authenticated, userController.removeFollowing)

  app.post('/tweets/:id/like', authenticated, userController.addLike)
  app.post('/tweets/:id/unlike', authenticated, userController.removeLike)

  app.get('/signup', userController.signUpPage)
  app.post('/signup', userController.signUp)

  app.get('/signin', userController.signInPage)
  app.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
  app.get('/logout', userController.logout)


  // 後台
  app.get('/admin', (req, res) => res.redirect('/admin/tweets'))
  app.get('/admin/users', authenticatedAdmin, adminController.getUsers)
  app.get('/admin/tweets', authenticatedAdmin, adminController.getTweets)
  app.delete('/admin/tweets/:id', authenticatedAdmin, adminController.deleteTweet)






}