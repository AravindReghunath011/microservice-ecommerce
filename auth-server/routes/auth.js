const express = require('express')
const router = express.Router()
const User = require('../db/User')
const jwt = require('jsonwebtoken')


router.post('/register',async(req,res)=>{
    console.log(req.body)
    const {email,name,password} = req.body
    let userExist = await User.findOne({email})
    if(userExist){
        return res.json({message:'User exists'})
    }else{
        let newUser = new User({
            name:name,
            email:email,
            password:password
        })

        newUser.save()
        console.log(newUser,'newUser')

        return res.json({message:'success'})
    }

})

router.post('/login',async(req,res)=>{
    const {email,password} = req.body
    let userExist = await User.findOne({email})
    if(!userExist){
        return res.json('No user found')
    }else{
        if(userExist.password!==password){
            return res.json({message:'password is not valid'})
        }
        const payload = {
            email,
            name: userExist.name
        };
        jwt.sign(payload, "secret", (err, token) => {
            if (err) console.log(err);
            else return res.json({ token: token });
        });
    }
})




module.exports = router