const express = require('express');
const cors = require('cors');
const bodyparser = require('body-parser');
const bearerToken = require('express-bearer-token');
const {
    userRouter,
    movieRouter
} = require('./router');

// main app
const app = express();

// apply middleware
app.use(bearerToken());
app.use(cors());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
// main route
const response = (req, res) => res.status(200).send('<h1>REST API JCWM-15</h1>')
app.get('/', response)
app.use('/user', userRouter);
app.use('/movies', movieRouter);

// bind to local machine
const PORT = process.env.PORT || 2000;
app.listen(PORT, () => console.log(`CONNECTED : port ${PORT}`));