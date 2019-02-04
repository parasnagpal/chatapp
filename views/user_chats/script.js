$(document).ready(()=>{

    let socket=io()

    $('head').append(
        $('<link>').attr('rel','stylesheet')
                   .attr('href','/user_chats/css/style.css')
    )


    $('#sendmsg').click(()=>{
        sendmsg()
    })


    $('#message').keyup((e)=>{
        if(e.keyCode==13)
          sendmsg()
    })

    $('body').keydown((e)=>{
        if(e.keyCode==100)
        {
           console.log('back')
           $.get('http://localhost:4000/body')
        }
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
        let img_path='./me.jpg'
        if(bool) 
        {
             from='me'
             img_path='./default.jpg'
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