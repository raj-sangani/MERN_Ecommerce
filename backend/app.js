const express = require('express');
const cookieParser = require('cookie-parser');


const app = express();

const errorMiddleware = require('./middleware/error');

app.use(express.json());
app.use(cookieParser());
//Route Imports

app.use("/api/v1", require('./routes/productRoute'));
app.use("/api/v1", require('./routes/userRoute'));

//middleware to handle errors
app.use(errorMiddleware);


module.exports = app;