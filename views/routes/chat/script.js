let socket
let expire

$(document).ready(()=>{

  socket=io();
  let str=window.location.pathname;
  const chatWith=str.slice(str.lastIndexOf('/')+1,-1)+str.charAt(str.length-1);
  let chatdata={};
  
  let myName;
  let sessionID=getCookie('session');
 
  popover();
  
  //Getting myName
  //Session ID from Cookie
  $.post('../myName',{session:sessionID},(data)=>{
    myName=data
  })
  .then(()=>{
    if(getCookie('chatdata'))
    {
        chatdata=JSON.parse(getCookie('chatdata'));
        let conversation;
        if(chatdata[myName]){
            if(chatdata[myName][chatWith] && chatdata[myName]){
              conversation=chatdata[myName][chatWith]
              for(let time in conversation){
                  if(conversation[time]['n'])
                      chatrefresh(conversation[time]['n'],false,chatWith,time);
                  if(conversation[time]['m']) 
                      chatrefresh(conversation[time]['m'],true,null,time); 
                }
             }
            else
               chatdata[myName][chatWith]={};
        }
        else{
            chatdata[myName]={};
            chatdata[myName][chatWith]={};
        }
    } 
   else{
        chatdata[myName]={};
        chatdata[myName][chatWith]={};
   } 

  })

    //event handlers
  $('.emojis').click((e)=>{
      console.log(e.target);
      console.log(this);
  })

  $('#header').text(chatWith)

  $('#sendmsg').click(()=>{
      sendmsg();
  })

  $('#message').keyup((e)=>{
      if(e.keyCode==13)
        sendmsg();
  })


  //Socket ons
  {
     socket.on('incoming',(data)=>{
       if(data.from==chatWith)
        chatrefresh(data.message,false,data.from,Date.now())

       if(getCookie('chatdata'))
       chatdata[myName][chatWith][Date.now()]={n:data.message,m:false}
       

       //update cookie
       updateCookie(chatdata)

       //received conversation
       received(myName,chatWith) 
      })
      
      socket.on('unread',(data)=>{

        if(data)
        if(data[myName])
          {
            for(let time in data[myName][chatWith])
            {
              chatrefresh(data[myName][chatWith][time],false,chatWith,time)
              if(!chatdata[myName])
                chatdata[myName]={};
              if(!chatdata[myName][chatWith])
                chatdata[myName][chatWith]={}; 
              chatdata[myName][chatWith][time]={n:data[myName][chatWith][time],m:false};
              updateCookie(chatdata);
            }
            //received conversation
            received(myName,chatWith);  
          }
      })
     
  }

  //Deliver Msg
  function sendmsg(){
      chatrefresh($('#message').val(),true);

      socket.emit('msgfor',{
          name:chatWith,
          message:$('#message').val()
      })
      if(getCookie('chatdata'))
       chatdata[myName][chatWith][Date.now()]={m:$('#message').val(),n:false};

      //update cookie
      updateCookie(chatdata)
  }


  function chatrefresh(msg,bool,from,time){
      //date  
      let date=new Date(Date.now())
      if(time)
      date=new Date(parseInt(time))
      
      img_path='../routes/chat/css/default.jpg'
      
      if(bool)
      $('#chat')
      .append(`<div role="alert" aria-live="assertive" aria-atomic="true" class="toast mytoast" data-autohide="false">
                    <div class="toast-body d-flex flex-column">
                        <div class="align-self-start">${msg}</div>
                        <div class="align-self-end">${date.toLocaleString()}</div>  
                    </div>
                </div>`)
      else
      $('#chat')
      .append(` <div class='d-flex justify-content-end notme'>
                    <div aria-live="polite" aria-atomic="true" style="position: relative;">
                        <div> 
                            <div role="alert" aria-live="assertive" aria-atomic="true" class="toast" data-autohide="false">
                                <div class="toast-header">
                                  <img src="${img_path}" class="rounded mr-2">
                                  <strong class="mr-auto">${from}</strong>
                                  <small>${date.toLocaleString()}</small>
                                </div>
                                <div class="toast-body">
                                  ${msg}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`)
        $('.toast').toast('show');        
  }

  setInterval(()=>{
    socket.emit('isAlive',{
      session:sessionID
    }) 
 },1000)

 function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return false;
} 
})

function received(name,from)
{
  socket.emit('received',{
    name,
    from
  }) 
}

function updateCookie(chatdata){
   //update cookie
   expire=new Date();
   expire.setTime(Date.now()+(9*365*24*60*60*1000));
   document.cookie=`chatdata=${JSON.stringify(chatdata)};expires=${expire.toUTCString()}`;
}

function popover(){
  $('button[data-toggle=tooltip]').tooltip({
    html:true,
    trigger:'click',
    title:` <html>
              <body>
                <div id='emoji'>
                  <a  href='#' onclick="append(🙂)">🙂</a>
                  <span>😎</span>
                  <span>😶</span>
                  <span>😛</span>
                  <span>😂</span>
                  <span>😝</span>
                </div>
              </body>
             </html>`,
    placement:'top'
  })
    //emoji insert
    $('#emoji a').click((e)=>{
      console.log('emoji')
      console.log(this)
    })
}
function append(str)
{
  $('input').append(str)
}
function insert(x){
  console.log(x)
}