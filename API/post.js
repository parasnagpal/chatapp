const express=require('express')
const app=express()

//formidable
const formidable=require('formidable')
const fs=require('fs')

//message API
const nexmo=require('nexmo')
require('dotenv').config()

const path=require('path')

//database
const database =require('../views/database/sqlite_handle')

let session_username_map={}

app.use(express.json())
app.use(express.urlencoded({
  extended:true
}))

//sms API
const Nexmo=new nexmo({
    apiKey: process.env.API_KEY,
    apiSecret: process.env.API_SECRET,
})


//post requests
{
    function getRandomInt(max) {
      return Math.floor(Math.random() * Math.floor(max));
    }  
    let pass=getRandomInt(1000000);

    app.post('/signup_request_with_mobileno',(req,res)=>{
        console.log(req.body)
        a={
          username:req.body.no,
          fname:req.body.no,
          password:pass,
          mobile:req.body.no
        };
        database.each(`SELECT * from USERS WHERE mobileno='+91${a.mobile}'`,(err,data)=>{
          if(err){
            //database insert query
            database.run(`insert into USERS(fname,USERNAME,PASSWORD,mobile) VALUES ('${a.fname}','${a.username}','${a.password}','+91${a.mobile}');`,(err)=>{
              if(err) console.log('Database Error:'+err)
            }); 
            Nexmo.message.sendSms('Paras',`+91${a.mobile}`,req.body.message+`Join mychat: https://mychat-chatapp.herokuapp.com/. Your username:${a.mobile} Password:${pass}`);
            res.json('user invited');
          } 
          if(data){
            Nexmo.message.sendSms('Paras',`+91${a.mobile}`,req.body.message);
            console.log(data)
            res.json('user exists');
          } 
        })
        //res.json({message:'hell yeah'});
    })

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
        
      let loginPromise=new Promise((resolve,reject)=>{
        database.each(`SELECT count(*) from USERS WHERE username='${req.body.username}'`,(err,data)=>{
          if(data['count(*)']){
            database.each(`SELECT count(*) from USERS WHERE password='${req.body.password}'`,(err,data)=>{
              if(data['count(*)'])
                resolve(data);
              else reject('Password Invalid');      
           })
          }
          else reject('Username Invalid');
        })
      });
      
      loginPromise
      .then(()=>{
        req.session.logged=true;
        session_username_map[req.session.id]=req.body.username
        res.redirect('/user')
      })
      .catch((message)=>{
        console.log(message)
        res.redirect('/login/error')
      })

    })
 
    app.post('/chats',(req,res)=>{
         res.redirect('/chat/'+req.body.chatWith)
    })
 
    app.post('/search',(req,res)=>{
      
      let promise=new Promise((resolve,reject)=>{
        database.each(`SELECT count(*) from USERS WHERE username='${req.body.name}'`,(err,data)=>{
          if(data['count(*)']){
            database.each(`SELECT username,fname,lname,email,mobile from USERS WHERE username='${req.body.name}'`,(err,data)=>{
              if(data)
                resolve(data);
              else reject();      
           })
          }
          else reject();
        })
      });
      
      promise
      .then((data)=>
        res.send(data)
      )
      .catch(err=>{
        res.send('not found');
      });
    
    })
 
    //send user data
    app.post('/user',(req,res)=>{
      
      let promise=new Promise((resolve,reject)=>{
        database.each(`SELECT count(*) from USERS WHERE username='${req.body.name}'`,(err,data)=>{
          if(data['count(*)']){
            database.each(`SELECT username,fname,lname,email,mobile from USERS WHERE username='${req.body.name}'`,(err,data)=>{
              if(data)
                resolve(data);
              else reject();      
           })
          }
          else reject();
        })
      });
      
      promise
      .then((data)=>
        res.send(data)
      )
      .catch(err=>{
        res.send('not found');
      }); 
        
    })
    
     //Tells the identity to the user
    app.post('/identity',(req,res)=>{
      res.send(req.session.id)
    })
 
    app.post('/myName',(req,res)=>{
        res.send(session_username_map[req.sessionID])
    })

    app.post('/photo',(req,res)=>{

      let promise=new Promise((resolve,reject)=>{
        database.each(`SELECT photo from users WHERE username='${req.body.name}'`,(err,data)=>{
          if(err)
           reject('err')
          if(data.photo)
           resolve(data.photo)
          else reject('photo not uploaded')  
        }) 
      })
      promise
      .then(()=>{
        let file=path.join(__dirname,`/../views/images/`+req.body.name+`.jpg`)
        res.sendFile(file)
      })
      .catch(()=>{
        res.send('NOT Found')
      })
        
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
          database.each(`update users SET photo='./views/images/${image_name}.jpg' where username='${image_name}'`)
       })
       res.redirect('/profile')
    })
 
} 

module.exports={app,session_username_map}