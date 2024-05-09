const Router = require('express')
const router = new Router()
const userController = require('../controllers/userController')
const {body} = require('express-validator')
const ConferencesController = require("../controllers/conferencesController");

router.post('/registration',
    body('email').isEmail(),
    body('password').isLength({min: 8, max: 32}),
    userController.registration)
router.post('/login', userController.login)
router.post('/logout', userController.logout)
router.get('/activate/:link', userController.activate)
router.get('/refresh', userController.refresh)
router.get('/userinfo', userController.userInfo)
router.get('/getallusers', userController.getAllUser)
router.get('/edituser', userController.editUser)
router.get('/conferenceuser', userController.conferenceUser)
router.get('/aaarole', userController.Role)
router.get('/onearticle', userController.oneArticle)
router.post('/teacherarticle', userController.uploadTeacherArticle)
router.post('/addarticle', userController.AddArticle)
router.get('/getoneuserinfo', userController.GetOneUserInfo)

module.exports = router