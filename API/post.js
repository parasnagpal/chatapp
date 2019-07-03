const express=require('express')
const app=express()

//database
const database =require('../views/database/sqlite_handle')

let session_username_map={}



//post requests
{
    app.post('/signup',(req,res)=>{
         a={
             username:req.body.username,
             fname:req.body.fname,
             lname:req.body.lname,
             password:req.body.password,
             email:req.body.mail,
             mobile:req.body.mobile
         };
         //database insert query
         database.run(`insert into USERS(fname,lname,USERNAME,PASSWORD,email,mobile) VALUES ('${a.fname}','${a.lname}','${a.username}','${a.password}','${a.email}','${a.mobile}');`,(err)=>{
            if(err) console.log('Database Error:'+err)
         }); 
         res.redirect('/login')
    })
 
    app.post('/login',(req,res)=>{
        //database search query
        database.each(`SELECT * from USERS WHERE username='${req.body.username}'`,(err,data)=>{
            if(err) console.log("Database Error:"+err)
            if(data.password===req.body.password) 
            {
             req.session.logged=true;
             session_username_map[req.session.id]=req.body.username
             res.redirect('/user')
            }
            else
             { 
               res.redirect('/login')  
             }
 
        })
        user_name=req.body.username
    })
 
 
     
    app.post('/chats',(req,res)=>{
         res.redirect('/chat/'+req.body.chatWith)
    })
 
 
    app.post('/search',(req,res)=>{
   
       database.each(`SELECT * from USERS WHERE username='${req.body.friend}'`,(err,data)=>{
         if(err) console.log(err)
         if(data)
           res.send(data.username)  
         })
  
     })
 
    //send user data
    app.post('/user',(req,res)=>{
       database.each(`SELECT * from USERS WHERE username='${req.body.name}'`,(err,data)=>{
         if(err) console.log(err)
         if(data)
            res.send(data)    
      }) 
    })
 
 
     //Tells the identity to the user
    app.post('/identity',(req,res)=>{
     res.send(req.session.id)
    })
 
    app.post('/myName',(req,res)=>{
        res.send(session_username_map[req.body.session])
    })

    app.post('/profile_image',(req,res)=>{
       console.log('image received')
       database.each(`Update USERS SET photo='${req.body.image}' WHERE username='${req.body.name}'`)
       res.send('hello')
    })
 
} 

module.exports={app,session_username_map}