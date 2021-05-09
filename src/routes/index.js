const express = require('express');
const router = express.Router();

router.get('/', (_req, res) => {
    res.status(200).send(`<h1>Welcome to node-apis</h1>`);
})



module.exports = router;