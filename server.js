
//Requirements
//express
const express=require('express')
const session=require('express-session')

//passport js
let passport= require('passport')
let LocalStrategy=require('passport-local').Strategy


//database
const database =require('./views/database/sqlite_handle')


//Socket files
const socketio=require('socket.io')
const http=require('http')
const app=express()
const server=http.createServer(app)
const io=socketio(server)
//fsops
const fs=require('fs')
const data_path='./db/data.json'
const connection='./db/map.json'
const rev_con='./db/rev_map.json'
//chats
const chat_path='./views/chat/chats'
//countpath
const count_path='./db/count.json'
const map_path='./db/mapit.json'

//People
let people=[]
let peoplecount=0
let users={}
let map={}
let revmap={}




//file 
{
fs.readFile(map_path,(err,data)=>{
    if(err) console.log('Error in reading map file')
    else users=JSON.parse(data)
})

fs.readFile(count_path,(err,data)=>{
    if(err) console.log('Error in reading count file')
    else peoplecount=JSON.parse(data)
})

fs.readFile(data_path,(err,data)=>{
    if(err) console.log('File read unsuccessful')
    else people=JSON.parse(data)
})


fs.readFile(connection,(err,data)=>{
    if(err) console.log('mapping error')
    else map=JSON.parse(data)
})

fs.readFile(rev_con,(err,data)=>{
    if(err) console.log('mapping error')
    else revmap=JSON.parse(data)
    
})
}





//file write
function appendFile(){
    fs.writeFile(data_path,JSON.stringify(people),(err)=>{
        if(err) console.log('File write failed')
    })
    fs.writeFile(count_path,JSON.stringify(peoplecount),(err)=>{
        if(err) console.log('File write failed')
    })
    fs.writeFile(map_path,JSON.stringify(users),(err)=>{
        if(err) console.log('File write failed')
    })
    
}
function updatefile(){
    fs.writeFile(connection,JSON.stringify(map),(err)=>{
        if(err) console.log('error')
    })
    fs.writeFile(rev_con,JSON.stringify(revmap),(err)=>{
        if(err) console.log('error')
    })
}


//Fetch chat data
function readfile(name){
   fs.readFile(chat_path+`/${name}.json`,(err,data)=>{
       if(err)
         fs.writeFile(chat_path+`/${name}.json`,JSON.stringify([]),(err)=>{
             if(err) console.log('Error creating File')

         })
         //Send Data
        else return data 
   })
}




app.use(express.json())
app.use(express.urlencoded({
    extended:true
}))



let user_name
//post requests
{
   app.post('/signup',(req,res)=>{
    a={
        username:req.body.username,
        fname:req.body.fname,
        lname:req.body.lname,
        password:req.body.password
    };
    people.push(a);
    //database insert query
    database.run(`insert into USERS(fname,lname,USERNAME,PASSWORD) VALUES ('${a.fname}','${a.lname}','${a.username}','${a.password}');`,(err)=>{
       if(err) console.log('Database Error:'+err)
    });
    users[a.username]=++peoplecount;
    appendFile()   
    res.redirect('/login')
   })

   app.post('/login',(req,res)=>{
       //database search query
       database.each(`SELECT * from USERS WHERE username='${req.body.username}'`,(err,data)=>{
           if(err) console.log("Database Error:"+err)
           if(data.password===req.body.password) 
           {
            if(req.session)
              req.session.log=true;
            
            console.log(req.session)  
            console.log("Logged in")
            //attachSocket(revmap[req.body.username])
            res.redirect('/user')
           }
           else
            { 
              console.log("Invalid password")
              res.redirect('/login')  
            }

       })
    user_name=req.body.username
    /*if(users[req.body.username])
      res.redirect('/body')
    else
      res.redirect('/home')*/
   })
    

}  


//Socket Connections
{
   io.on('connection',(socket)=>{
      let t=false
      map[socket.id]=user_name
      revmap[user_name]=socket.id

      
      //attachSocket(socket)

      updatefile()

      socket.on('msgfor',(data)=>{
          let to
          database.each(`SELECT username FROM users where SocketID='${data.name}'`,(err,data)=>{
              if(err) console.log(err)
              else to=data
          })
        socket.to(to).emit('incoming',{
            from:map[socket.id],
            message:data.message
        })
      })

     
      socket.on('find',(data)=>{
         /*for(let p of people)
           if(p.username==data.name)
           {
              t=true
              break
           }   */
           database.each(`SELECT * FROM users where username='${data.name}'`,(err,data)=>{
               if(err) console.log(err)
               else t=true
           })
            socket.emit('reply',{
                success:t
            })    
            t=false  
       })
     
     socket.on('fetch',(data)=>{
         let dat=readfile(data.name)
         socket.emit(dat)
     })

     

   })
}

function attachSocket(socketID){
    //Update Socket ID in database
    database.each(`INSERT INTO users(SocketID) VALUES ('${socketID}') WHERE username='${user_name}'`,err=>{
        if(err) console.log("error attaching socket id to User:"+err)
    })
}

//Configuration
{
app.set('view engine','hbs')

app.use(session({
    secret:'this is MY secret!!!!',
    resave:true,
    saveUninitialized:false,
    cookie:{
      maxAge:24*60*60*1000
    }
}))

app.use((req,res,next)=>{
    if(!req.session.user)
    {
        req.session.user=true;
        res.redirect('/login')
    }  
    next()
})

app.use('/',express.static(__dirname+'/views'))
app.use('/',require('./views/routes/route'))
}

server.listen(process.env.PORT||4000,()=>{
    console.log('Server started at http://localhost:4000')
})

