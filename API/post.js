const express=require('express')
const app=express()

//formidable
const formidable=require('formidable')
const fs=require('fs')

const path=require('path')

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
    app.post('/photo',(req,res)=>{
        //database.each(`SELECT photo from users WHERE username='paras'`,(err,data)=>{
          /*  console.log(data)
            res.sendFile('./views/images/'+req.body.name+'.jpg')
        })*/
        let file=path.join(__dirname,`/../views/images/`+req.body.name+`.jpg`)
        fs.readFile(file,(err,data)=>{
            if(err)
             res.send(false)
            else res.sendFile(file) 
        })
        res.sendFile(file)
    })

    //set profile Image
    app.post('/profile_image',(req,res)=>{

       let form = new formidable.IncomingForm();
       form.parse(req)
       let image_name
       form.uploadDir='./views/images'
       form.keepExtensions=true
       form.maxFieldsSize = 2 * 1024 * 1024
       form.on('field',(name,value)=>{
           image_name=value
       })
       form.on('file',(name,file)=>{
         fs.rename(file.path,'./views/images/'+image_name+'.jpg',(err)=>{
               console.error(err)
          })
          database.each(`update users SET photo='./views/images/${image_name}.jpg'`)
       })
       res.redirect('/profile')
    })
 
} 

module.exports={app,session_username_map}