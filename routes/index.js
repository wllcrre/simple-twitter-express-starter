const userController = require('../controllers/userControllers')
const tweetController = require('../controllers/tweetControllers')

module.exports = (app, passport) => { // 記得這邊要接收 passport

  const authenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next()
    }
    res.redirect('/signin')
  }
  const authenticatedUser = (req, res, next) => {
    if (req.isAuthenticated()) {
      if (req.user.id == req.params.id) {
        return next()
      } else {
        req.flash('error_messages', 'Authentication error!')
        return res.redirect(`/users/${req.user.id}`)
      }
    }
  }

  app.get('/', authenticated, (req, res) => res.redirect('tweets'))
  app.get('/tweets', authenticated, tweetController.getTweets)

  app.get('/signup', userController.signUpPage)
  app.post('/signup', userController.signUp)

  app.get('/signin', userController.signInPage)
  app.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
  app.get('/logout', userController.logout)

}