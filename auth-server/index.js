const express = require('express')
const mongoose = require('mongoose')
const app = express()
const PORT = 8001
const auth = require('./routes/auth')

app.use(express.json())
mongoose.connect("mongodb://mongodb/auth-service")
    .then(()=>{
    console.log('db connected auth-server');
})

app.use('/auth',auth)


app.listen(PORT,()=>{
    console.log('App is listening in port 8001');
})