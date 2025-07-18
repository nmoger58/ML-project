const express=require('express')
const { fetchProfile, analyzeProfile } = require('../controllers/profileControllers')
const { signup, login } = require('../controllers/userControllers')
const router=express.Router()

router.get('/',(req,res)=>{
    return res.status(200).json({
        success : true,
        message : "This is the user Route"
    })
})
router.get('/profile/:username',fetchProfile)
router.get('/analyze/:username',analyzeProfile)
router.post('/signup',signup)
router.post('/login',login)
module.exports=router;