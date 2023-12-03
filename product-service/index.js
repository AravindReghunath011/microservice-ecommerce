const express = require('express')
const app = express()
const mongoose = require('mongoose')
const PORT = 8002
const product = require('./routes/product')

app.use(express.json())

mongoose.connect('mongodb://mongodb/product-service')
.then(()=>{
    console.log('db conected product service')
})

app.use('/product',product)


app.listen(PORT,()=>{
    console.log('product service running in port 8002');
})