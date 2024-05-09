const Router = require('express')
const router = new Router()
const conferencesRouter = require('./conferensecRouter')
const typeRouter = require('./typeRouter')
const userRouter = require('./userRouter')

router.use('/user', userRouter)
router.use('/type', typeRouter)
router.use('/conferences', conferencesRouter)

module.exports = router
