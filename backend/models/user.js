const mongoose = require('mongoose')

const user=new mongoose.Schema({
    username :{
        type: String,
        required: true,
        unique: true
    },
    email :{
        type: String,
        required: true,
        unique: true
    },
    password :{
        type: String,
        required: true
    },
    leetcodeId :{
        type: String,
        unique: true
    },
    githubId :{
        type: String,
        unique: true
    },
    role :{
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    phone :{
        type: String,
        unique: true
    },
    about: {
        type: String,
        default: ''
    },
},
{
    timestamps: true
})
const User = mongoose.model('User', user)

module.exports = User