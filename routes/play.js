const { Router } = require('express')
const playController = require('../controllers/play')
const auth = require('../utils/auth')
const router = Router()

router.get('/create', auth(), playController.get.create)
router.post('/create', auth(), playController.post.create)

router.get('/details/:id', auth(), playController.get.details)

router.get('/sort-likes', auth(), playController.get.sortLikes)
router.get('/sort-date', auth(), playController.get.sortDate)
router.get('/my-plays', auth(), playController.get.myPlays)
router.get('/edit/:id', auth(), playController.get.edit)
router.post('/edit/:id', auth(), playController.post.edit)

router.get('/delete/:id', auth(), playController.get.delete)
router.post('/delete/:id', auth(), playController.post.delete)
router.get('/like/:id', auth(), playController.get.like)
router.all('*', auth(false), playController.get.notFound)

module.exports = router