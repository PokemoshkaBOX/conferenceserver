const Router = require('express')
const router = new Router()
const ConferencesController = require('../controllers/conferencesController')

router.post('/')

router.get('/conferences', ConferencesController.getConferences)
router.get('/userconferences', ConferencesController.getUserConferences)
router.get('/:id', ConferencesController.getOne)
router.get('/oneparticipant/:id', ConferencesController.getOneParticipant)
router.post('/updateuserstatus', ConferencesController.updateUserStatus)
router.post('/createconference', ConferencesController.createConference)
router.post('/updateconference', ConferencesController.updateConference)
router.post('/deleteconference', ConferencesController.deleteConference)
router.post('/addarticle', ConferencesController.addArticle)



module.exports = router