const { Router } = require('express')
const playController = require('../controllers/play')
const auth = require('../utils/auth')
const router = Router()

router.get('/', auth(false), playController.get.index)
router.get('/home', auth(false), playController.get.index)
router.all('/home/*', auth(false), playController.get.notFound)
// router.all('*', auth(false), playController.get.notFound)

module.exports = router