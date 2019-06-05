$(document).ready(()=>{

    let socket=io()

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
            name:$('#header').text(),
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
    
})