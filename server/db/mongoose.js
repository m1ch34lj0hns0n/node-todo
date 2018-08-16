const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.DB_HOST);

module.exports = {
    mongoose
};