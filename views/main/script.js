$(document).ready(()=>{
   
    let socket=io()
   
    let listcount=0
    let chats=[]
    let friend;
    if(localStorage.arr)
        chats=JSON.parse(localStorage.arr) 
    
    $('#error').hide()
    //Insert friends
        
    //update List
    updatelist(chats)
     

    //Friend Search
    $('#friend').keyup((e)=>{
        if(e.keyCode==13)
          findfriend()
        
    })

    
    //Socket ons 
    {
      socket.on('reply',(data)=>{
        //Friend Found
        if(data.success)
        {
          check(friend)
           $('#error').hide()
        }
        else
        $('#error').show()
        $('#friend').text('')
      })
      socket.on('data',(data)=>{
          console.log(data.arr)
      })
    }

    function domchange(e)
    {
        $('#body').html(`
          <div class='container'>
          
          <h1 class="badge badge-dark m-1" id='head'>WhatsChat</h1>
          <div class='row mx-2' id='header'><div class='mx-3'>${$(e.target).text()}</div></div>
          <div id='chat' class='row'></div>
          <div id='footer'>
            <input type='text' id='message' class='form-control col'>
            
          </div>

          <script src='/user_chats/script.js'></script>
          </div>
        `)
        socket.emit('fetch',{
            name:$(e.target).text()
        })
    }

    function findfriend(){

        friend=$('#friend').val()
            socket.emit('find',{
              name:$('#friend').val()
          })
    }


    function updatechats(){
        localStorage.arr=JSON.stringify(chats)
    }

    
    function updatelist(arr){
       for(let a of arr)
        
        $('#chats')
           .append(
            $('<div>')
            //.val(`<img src='./default.jpg' class='rounded-circle'>`)
            .attr('id',`_${listcount++}`)
            .attr('class','alert alert-light mx-3')
            .attr('role','alert')
            .text(a)
            .click((e)=>{
                console.log($(e.target).text())
                domchange(e)
            })
               
         )
    }

    function refreshlist(friend){
        chats.push(friend)
        updatechats()
        let fr=[]
        fr.push(friend) 
        updatelist(fr)
    }

    function check(friend){
        let b=true
        for(let f of chats)
          if(friend==f)
           {
               b=false
               break;
           }  
        if(b) refreshlist(friend)   
    }
})