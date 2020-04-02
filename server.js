const express=require('express');
const session=require('express-session');

//load environment variables
require('dotenv').config()

//Body Parser to set linit to req size
const bodyparser=require('body-parser');

//import from API folder
const App=require('./API/post')

let tempChatData={}

//Socket files
const socketio=require('socket.io')
const http=require('http')
const app=express()
const server=http.createServer(app)
const io=socketio(server)

//Peoples
let map={};
let mapAlive={};
let revmap={};
let session_username_map=App.session_username_map;
let user_name;

app.use(bodyparser.json({limit:'2MB'}))
app.use(bodyparser.urlencoded({
    extended:true,
    limit:'2MB'
}))

app.use(session({
    secret:'this is MY secret!!!!',
    resave:false,
    saveUninitialized:true,
    cookie:{
        maxAge:24*60*60*1000
    }
}))

//Socket Connections
{
    io.on('connection',(socket)=>{
        map[socket.id]=user_name;
        mapAlive[user_name]=false;
        revmap[user_name]=socket.id;
      
        socket.on('msgfor',(data)=>{
            console.log(data);
            io.to(revmap[data.name]).emit('incoming',{
                from:map[socket.id],
                message:data.message
              })
             //save chat to server
            if(!tempChatData[data.name])
                tempChatData[data.name]={};
            
            if(!tempChatData[data.name][map[socket.id]])
                tempChatData[data.name][map[socket.id]]={};
            
            tempChatData[data.name][map[socket.id]][Date.now()]=data.message;
            socket.emit('unread',tempChatData);
        })
      
        socket.emit('unread',tempChatData)
        socket.on('unread',()=>{
            socket.emit('unread',tempChatData)
        })
      
        socket.on('received',(data)=>{
          //clear chat stored on server
          tempChatData[data.name][data.from]={}
        })

        socket.on('isOnline',(data)=>{
            socket.emit('online',{
                name:data.name,
                answer:mapAlive[data.name]
            })     
        })

        socket.on('isAlive',(data)=>{
            let username=session_username_map[data.session];
            let socketid=socket.id;
            mapAlive[username]=true;
            revmap[username]=socketid;
            map[socketid]=username;
            console.log(mapAlive);
            broadcast_online(username);
        })

        socket.on('disconnect',()=>{
            let socketid=socket.id;
            let username=map[socketid];
            console.log(username+"offline");
            delete map[socketid];
            delete revmap[username];
            delete mapAlive[username];   
            broadcast_offline(username); 
        })
      
        io.to(socket.id).emit('identity',{
            id:socket.id,
            name:user_name
        })

        function broadcast_online(username){
            io.emit('online',{
                name:username,
                answer:(mapAlive[username])?true:false
            })
        }
    
        function broadcast_offline(username){
            io.emit('offline',{
                name:username
            })
        }

    })

   setInterval(deactivate,10000);

    function deactivate(){
        for(let obj in revmap)
            mapAlive[obj]=false;
    }

}

//Configuration
{
  app.set('view engine','hbs')

  app.use((req,res,next)=>{
    
    if(!req.session.user){
        //console.log("New user")
        req.session.user=true;
        req.session.logged=false;
        return res.redirect('/login');
    }  
    else  
        next();
        
  })

  app.get('/parasnagpal',(req,res)=>{
      res.render('/login')
  })

  app.use(express.static(__dirname+'/views'));
  app.use(express.static(__dirname+'/chat'));
  app.use('/',App.app);
  app.use('/',require('./views/routes/route'));


}

function send_message(username,message){
    io.on('connection',(socket)=>{
        socket.emit('msgfor',{
            name:username,
            message:message
        })
    })
}

server.listen(process.env.PORT||4000,()=>{
    console.log('Server started at http://localhost:4000')
})

