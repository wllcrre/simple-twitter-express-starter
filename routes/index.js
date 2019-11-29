const userController = require('../controllers/userControllers')
const adminController = require('../controllers/adminController.js')

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



  app.get('/', authenticated, (req, res) => res.render('tweets'))

  app.get('/signup', userController.signUpPage)
  app.post('/signup', userController.signUp)

  app.get('/signin', userController.signInPage)
  app.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
  app.get('/logout', userController.logout)


  // 後台
  app.get('/admin', (req, res) => res.redirect('/admin/tweets'))

  // 在 /admin/tweets 底下則交給 adminController.getTweets 處理
  app.get('/admin/tweets', authenticatedAdmin, adminController.getTweets)
  app.delete('/admin/tweets/:id', authenticatedAdmin, adminController.deleteTweet)






}