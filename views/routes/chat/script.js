

$(document).ready(()=>{

  let socket=io()
  let str=window.location.pathname
  const chatWith=str.slice(str.lastIndexOf('/')+1,-1)+str.charAt(str.length-1)
  let chatdata
  let expire

  let myName
  let sessionID=getCookie('session')


  //Getting myName
  //Session ID from Cookie
  $.post('../myName',{session:sessionID},(data)=>{
    myName=data
    console.log(myName)
  })

  if(getCookie('chatdata'))
   {
     chatdata=JSON.parse(getCookie('chatdata'))
     let conversation=chatdata.myName.chatWith
     for(let time in conversation)
       {
         console.log(conversation[time]['n'])
         if(conversation[time]['n'])
          chatrefresh(conversation[time]['n'],true)
         if(conversation[time]['m']) 
          chatrefresh(conversation[time]['m'],false,chatWith) 
       }
   }
  else{
    chatdata[myName]={}
    chatdata[myName][chatWith]={}
  } 




  $('#header').text(chatWith)

  $('#sendmsg').click(()=>{
      sendmsg()
  })


  $('#message').keyup((e)=>{
      if(e.keyCode==13)
        sendmsg()
  })


  //Socket ons
  {
     socket.on('incoming',(data)=>{
       
       chatrefresh(data.message,false,data.from)
       chatdata.myName.chatWith[Date.now()]={n:data.message,m:false}
       //Update cookie
       expire=new Date()
       expire.setTime(Date.now()+(9*365*24*60*60*1000))
       document.cookie=`chatdata=${JSON.stringify(chatdata)};expires=${expire.toUTCString()}`
     })

     
  }

  //Deliver Msg
  function sendmsg(){
      chatrefresh($('#message').val(),true)

      socket.emit('msgfor',{
          name:chatWith,
          message:$('#message').val()
      })
      chatdata.myName.chatWith[Date.now()]={m:$('#message').val(),n:false}
      //update cookie
      expire=new Date()
      expire.setTime(Date.now()+(9*365*24*60*60*1000))
      document.cookie=`chatdata=${JSON.stringify(chatdata)};expires=${expire.toUTCString()}`;
  }


  function chatrefresh(msg,bool,from){
      let img_path='../routes/chat/css/me.jpg'
      if(bool) 
      {
           from='me'
           img_path='../routes/chat/css/default.jpg'
      }
      if(bool)
      $('#chat')
      .append(`<div role="alert" aria-live="assertive" aria-atomic="true" class="toast" data-autohide="false">
                  <div class="toast-header">
                    <img src="${img_path}" class="rounded mr-2">
                    <strong class="mr-auto">${from}</strong>
                    <small>Just Now</small>
                    <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div class="toast-body">
                    ${msg}
                  </div>
                </div>`)
      else
      $('#chat')
      .append(`<div class='d-flex justify-content-end'><div aria-live="polite" aria-atomic="true" style="position: relative;">
               <div> 
               <div role="alert" aria-live="assertive" aria-atomic="true" class="toast" data-autohide="false">
                  <div class="toast-header">
                    <img src="${img_path}" class="rounded mr-2">
                    <strong class="mr-auto">${from}</strong>
                    <small>Just Now</small>
                    <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div class="toast-body">
                    ${msg}
                  </div>
                </div>
                </div>
                </div>
                </div>`)
        $('.toast').toast('show')        

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