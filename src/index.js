require('dotenv').config();
const express = require('express');
const { PORT, CORS_ORIGIN, DB_URL } = require('./constant/common');
const router = require('./routes');
const apiRouter = require('./routes/api');
const mongoose = require('mongoose');

(async () => {
    const app = express();

    app.use(express.json());

    // allow cross origin
    // app.use(cors({
    //     origin: CORS_ORIGIN
    // }))

    // static 
    app.use('/uploads', express.static('uploads'));
    // app.use(express.static(__dirname));

    // app routes
    app.use('/', router);
    app.use('/api/', apiRouter);


    // mongodb connection
    mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
        console.info(`Successfully connected to ${DB_URL}`);

        // start listening 
        app.listen(PORT, () => {
            console.info(`Server successfully started at PORT:${PORT}`);
        })
    }).catch(err => {
        console.error(`Error in connecting database ${DB_URL}`);
        process.exit(1);
    })
})();