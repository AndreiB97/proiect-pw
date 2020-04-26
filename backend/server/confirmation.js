const router = require('express').Router();
const mailer = require('./mailer.js');

router.post('/:id', (req, res) => {
    const id = req.params.id;
    const message = mailer.confirm(id);

    res.status(200).json(message).end();
})

module.exports = router;