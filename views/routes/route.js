const express =require('express')
const router=express.Router();
const session=require('express-session')
const app=express()

app.use(session({
  secret:'this is MY secret!!!!',
  resave:true,
  saveUninitialized:false,
  cookie:{
    maxAge:24*60*60*1000
  }
}))



router.get('/login',(req,res)=>{
  res.sendFile(__dirname+'/login/public.html')
})

router.get('/login/error',(req,res)=>{
  res.sendFile(__dirname+'/login/loginerr.html')
})

router.get('/disclaimer',(req,res)=>{
  res.sendFile(__dirname+'/disclaimer/index.html')
})

router.get('/user',(req,res)=>{
    if(!req.session.logged)
      res.redirect('/login')
    res.sendFile(__dirname+'/user/index.html')
})

router.get('/chat/:with',(req,res)=>{
    if(!req.session.logged)
      res.redirect('/login')
    //console.log(req.params.with)  
    res.sendFile(__dirname+'/chat/index.html')
})

router.get('/chats',(req,res)=>{
  res.sendFile(__dirname+'/chat/index.html')
})

router.get('/',(req,res)=>{
  if(req.session.logged)
   res.redirect('/user')
   res.redirect('/login')
})
router.get('/profile',(req,res)=>{
  if(!req.session.logged)
   res.redirect('/login')
  res.sendFile(__dirname+'/profile/index.html')
})

router.use((req,res)=>{
  res.sendFile(__dirname+'/404/index.html')
})

module.exports=router