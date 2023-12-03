const mongoose = require('mongoose')

const Usermodel = new mongoose.Schema({
    name:String,
    email:String,
    password:String
})

module.exports = mongoose.model('user',Usermodel)