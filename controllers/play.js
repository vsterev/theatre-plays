const { playModel, userModel } = require('../models')

module.exports = {
    get: {
        index: (req, res, next) => {
            const user = req.user;
            playModel.find({ isPublic: true })
                .then(plays => {
                    if (!user) {
                        let sorted = [...plays].sort((a, b) => { return b.users.length - a.users.length })
                        const topPlays = sorted.slice(0, 3);
                        res.render('indexNotAuth.hbs', { title: 'Theatre | Home page', plays: topPlays, user });
                        return;
                    }
                    const sorted = [...plays].sort((a, b) => {
                        if (b.createdAt === a.createdAt) {
                            return a.title.localeCompare(b.title)
                        }
                        return b.createdAt - a.createdAt
                    })

                    res.render('indexAuth.hbs', { title: 'Theatre | Home page', plays: sorted, user });
                    return
                })
                .catch(err => console.log(err))
        },
        create: (req, res, next) => {
            const user = req.user;
            res.render('create.hbs', { title: 'Create course | course Workshop', user })
        },
        details: (req, res, next) => {
            const id = req.params.id;
            const user = req.user || 'undefined';
            playModel.findById(id)
                .then(play => {
                    play.isCreator = play.creatorId.toString() === user.id;
                    play.isLiked = play.users.includes(user.id.toString());
                    res.render('details.hbs', { title: 'Theatre | Play details', play, user })
                })
                .catch(err => res.render('404.hbs', { msg: err }))
        },
        delete: (req, res, next) => {
            const user = req.user;
            // Promise.all([
            //     userModel.update({ plays: { $in: [req.params.id] } }, { $pull: { plays: req.params.id } }, { multi: true }),
            //     playModel.findByIdAndDelete(req.params.id)
            // ])
            //     .then(() => {
            //         res.redirect('/');
            //     })
            //     .catch(err => next(err))
            playModel.findById(req.params.id)
                .then(play => res.render('delete', { title: `Delete play ${play.title}`, play, user }))
                .catch(err => console.log(err))
        },
        like: (req, res, next) => {
            const user = req.user;
            Promise.all([
                userModel.findByIdAndUpdate(req.user.id, { $push: { plays: req.params.id } }),
                playModel.findByIdAndUpdate(req.params.id, { $push: { users: user.id }, $inc: { likesCount: +1 } })
            ])
                .then(() => res.redirect(`/play/details/${req.params.id}`))
                .catch(err => console.log(err))
        },
        notFound: (req, res, next) => {
            const user = req.user;
            res.render('404.hbs', { title: 'course | Not found page', user })
        },
        edit: (req, res, next) => {
            const playId = req.params.id;
            const user = req.user;
            playModel.findById(playId)
                .then((play) => res.render('edit', { title: 'Edit course', user, play }))
                .catch(err => console.log(err))
        },
        sortLikes: (req, res, next) => {
            const user = req.user;
            playModel.find({ isPublic: true })
                .then(plays => {
                    let sorted = [...plays].sort((a, b) => { return b.users.length - a.users.length })
                    res.render('indexAuth.hbs', { title: 'Theatre | Home page', plays: sorted, user });
                })
        },
        sortDate: (req, res, next) => {
            const user = req.user;
            playModel.find({ isPublic: true })
                .then(plays => {
                    const sorted = [...plays].sort((a, b) => {

                        return b.createdAt - a.createdAt
                    })
                    res.render('indexAuth.hbs', { title: 'Theatre | Home page', plays: sorted, user });
                })
        },
        myPlays: (req, res, next) => {
            const user = req.user;
            playModel.find({ creatorId: req.user.id })
                .then(plays =>
                    res.render('indexAuth', { title: 'My plays', user, plays })
                )
                .catch(err => console.log(err))
        }
    },
    post: {
        create: (req, res, next) => {
            const { titleF = null, description = null, imageUrl = null, isPublic } = req.body;
            const creatorId = req.user.id;
            const user = req.user;

            playModel
                .create(
                    { title: titleF, description, imageUrl, isPublic: isPublic === 'on', users: [], creatorId: creatorId, createdAt: Date.now(), likesCount: 0 }
                )
                .then(play => {
                    res.redirect('/')
                }
                )
                .catch(err => {
                    if (err.name == 'ValidationError') {
                        res.render('create.hbs', { title: 'Create play', user, errors: err.errors, titleF, description, imageUrl, isPublic: isPublic === 'on' })
                        return;
                    }
                    next(err);
                    console.log(err)
                })
        },
        edit: (req, res, next) => {
            const playId = req.params.id;
            const user = req.user;
            const { title, description, imageUrl, isPublic } = req.body;
            playModel.findByIdAndUpdate(playId, { title, description, imageUrl, isPublic: isPublic === 'on' }, { runValidators: true })
                .then(play => res.redirect(`/play/details/${play.id}`))
                .catch(err => {
                    if (err.name == 'ValidationError') {
                        playModel.findById(playId)
                            .then(play => res.render('edit.hbs', { title: 'Create theatre play', user, play, errors: err.errors }))
                            .catch(err => console.log(err))
                        return;
                    }
                    next(err);
                    console.log(err)
                })
        },
        delete: (req, res, next) => {
            const user = req.user;
            const playId = req.body
            Promise.all([
                userModel.update({ plays: { $in: [req.params.id] } }, { $pull: { plays: req.params.id } }, { multi: true }),
                playModel.findByIdAndDelete(req.params.id)
            ])
                .then(() => {
                    res.redirect('/');
                })
                .catch(err => next(err))
        }
    }
}

