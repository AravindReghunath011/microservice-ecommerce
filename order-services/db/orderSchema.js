const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    products:Array,
    total:Number,
    userEmail:String

})

module.exports = mongoose.model("order",orderSchema)