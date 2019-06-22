
//Requirements
//express
const express=require('express')
const session=require('express-session')

//import from API folder
const App=require('./API/post')

//passport js
let passport= require('passport')
let LocalStrategy=require('passport-local').Strategy





//Socket files
const socketio=require('socket.io')
const http=require('http')
const app=express()
const server=http.createServer(app)
const io=socketio(server)

//countpath


//Peoples
let map={}
let mapAlive={}
let revmap={}
let session_username_map=App.session_username_map
let user_name



app.use(express.json())
app.use(express.urlencoded({
    extended:true
}))
app.use(session({
    secret:'this is MY secret!!!!',
    resave:true,
    saveUninitialized:false,
    cookie:{
      maxAge:24*60*60*1000
    }
}))


//Socket Connections
{
   io.on('connection',(socket)=>{
      map[socket.id]=user_name
      mapAlive[user_name]=false
      revmap[user_name]=socket.id

      //updatefile()

      socket.on('msgfor',(data)=>{
           io.to(revmap[data.name]).emit('incoming',{
             from:map[socket.id],
             message:data.message
            })

      })

      socket.on('isOnline',(data)=>{
            socket.emit('online',{
                name:data.name,
                answer:mapAlive[data.name]
            })
            
      })

      socket.on('isAlive',(data)=>{
        console.log(session_username_map[data.session]+' User online')
        mapAlive[session_username_map[data.session]]=true
        revmap[session_username_map[data.session]]=socket.id
        map[socket.id]=session_username_map[data.session]
      })
      
      io.to(socket.id).emit('identity',{
          id:socket.id,
          name:user_name
      })

   })

   setInterval(deactivate,10000)

   function deactivate(){
     for(let obj in revmap)
       mapAlive[obj]=false
     }
}

//Configuration
{
app.set('view engine','hbs')


app.use((req,res,next)=>{
    
    if(!req.session.user)
      {
        console.log("New user")
        req.session.user=true;
        req.session.logged=false;
        return res.redirect('/login')
      }  
      else  next()
   })

   app.use(express.static(__dirname+'/views'))
   app.use(express.static(__dirname+'/chat'))
   app.use('/',App.app)
   app.use('/',require('./views/routes/route'))

}

server.listen(process.env.PORT||4000,()=>{
    console.log('Server started at http://localhost:4000')
})

