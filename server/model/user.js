const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const validator = require('validator');

let UserSchema = new mongoose.Schema({
    email: {
        trim: true,
        type: String,
        unique: true,
        minlength: 1,
        required: true,
        validate: {
            validator: validator.isEmail,
            message: 'Not a validate email address'
        }
    },
    password: {
        type: String,
        minlength: 8,
        required: true
    },
    tokens: [
        {
            access: {
                type: String,
                required: true
            },
            token: {
                type: String,
                required: true
            }
        }
    ]
});

UserSchema.methods.toJSON = function() {
    let user = this;
    let userObject = user.toObject();

    return { 
        _id: userObject._id,
        email: userObject.email
    };
};

UserSchema.methods.generateAuthToken = function() {
    let user = this;
    let access = 'auth';
    let token = jwt.sign({
        _id: user._id.toHexString(),
        access
    }, 'abc123').toString();
    user.tokens.push({
        access,
        token
    });
    return user.save().then(() => token);
};

UserSchema.statics.findByToken = function(token) {
    let User = this;
    let decoded;
    try {
        decoded = jwt.verify(token, 'abc123');
    } catch (error) {
        return Promise.reject();
    }
    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};

const User = mongoose.model('User', UserSchema);

module.exports = { User };