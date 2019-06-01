const express =require('express')
const router=express.Router();

router.get('/login',(req,res)=>{
    res.sendFile(__dirname+'/login/public.html')
})

router.get('/user',(req,res)=>{
    res.sendFile(__dirname+'/user/index.html')
})

router.get('/chat',(req,res)=>{
    res.sendFile(__dirname+'/chats/index.html')
})

module.exports=router