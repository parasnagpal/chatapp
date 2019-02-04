
//Requirements
//express
const express=require('express')

/*
const add=require('./db/sql_db').add
const {find}=require('./db/sql_db')
*/
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
    if(err) console.log('ABS')
    else users=JSON.parse(data)
})

fs.readFile(count_path,(err,data)=>{
    if(err) console.log('ABS')
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
    console.log(revmap)
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

app.set('view engine','hbs')


app.use(express.json())
app.use(express.urlencoded({
    extended:true
}))




//get requests
{ 
    //home
   app.get('/home',(req,res)=>{
    res.status(200).sendFile(__dirname+'/views/home/public.html')
   })

  //chats
  app.get('/chats',(req,res)=>{
    res.render(__dirname+'/views/chat/index.hbs')
  })

  //body
  app.get('/body',(req,res)=>{
     res.status(200).sendFile(__dirname+'/views/main/index.html')
   })

}   

let user_name
//post requests
{
   app.post('/signup',(req,res)=>{
    a={
        username:req.body.username,
        name:req.body.name,
        password:req.body.password
    };
    people.push(a);
    users[a.username]=++peoplecount;
    console.log(people)
    appendFile()   
    res.redirect('/home')
   })

   app.post('/login',(req,res)=>{
       console.log(req.body)
    user_name=req.body.username
    if(users[req.body.username])
      res.redirect('/body')
    else
      res.redirect('/home')
   })
    

}  


//Socket Connections
{
   io.on('connection',(socket)=>{
      let t=false
      map[socket.id]=user_name
      revmap[user_name]=socket.id
      updatefile()

      socket.on('msgfor',(data)=>{
        console.log(data)     
        console.log(revmap[data.name])
        console.log(map[socket.id])
        socket.to(revmap[data.name]).emit('incoming',{
            from:map[socket.id],
            message:data.message
        })
     })
     socket.on('find',(data)=>{
         for(let p of people)
           if(p.username==data.name)
           {
              t=true
              break
           }   
            socket.emit('reply',{
                success:t
            })    
            t=false  
     })
     
     socket.on('fetch',(data)=>{
         //console.log(data)
         let dat=readfile(data.name)
         socket.emit(dat)
     })

     

   })
}

app.use('/',express.static(__dirname+'/views'))


server.listen(4000,()=>{
    console.log('Server started at http://localhost:4000')
})
