

$(document).ready(()=>{

    let socket=io()
    let str=window.location.pathname
    const chatWith=str.slice(str.lastIndexOf('/')+1,-1)+str.charAt(str.length-1)

    let myName
    let sessionID=getCookie('session')
    //Getting myName
    //Session ID from Cookie
     $.post('../myName',{session:sessionID},(data)=>{
       myName=data
       console.log(myName)
     })
  

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
       })

       
    }

    //Deliver Msg
    function sendmsg(){
        chatrefresh($('#message').val(),true)
        socket.emit('msgfor',{
            name:chatWith,
            message:$('#message').val()
        })
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
        .append(` <div id='snackbar' class='m-3'>
                     <div class='snack-head mx-2'>
                          <img src="${img_path}" class="rounded mr-2 m-2">
                          <b>${from}</b>
                    </div>
                     <div class='snack-body'>${msg}</div>
                  </div>`)
        else
        $('#chat')
        .append(` <div id='snackbar' class='m-3'>
                     <div class='row'>
                       <div class='snack-head mx-2'>
                          <img src="${img_path}" class="rounded mr-2 m-2">
                          <b>${from}</b>
                       </div>
                       <div class='snack-body'>${msg}</div>
                     </div>
                  </div>`)

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
    return "";
  }
    
})