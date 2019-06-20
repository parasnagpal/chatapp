
$(document).ready(()=>{


   
   let globalState
   let socket=io()
   let myName
   let sessionID
   
   //Get Identity from server
   $.post('identity',{},(data)=>{
     sessionID=data
     console.log(sessionID)
     setCookie('session',data,1);
   })

   $.post('myName',
        {session:sessionID},
        (data)=>{
          myName=data
          console.log(myName)
   })


    let listcount=0
    let newMessageCount={}
    let chats=[]
    let friendsOnline={}
    let friend;
    if(localStorage.arr)
        chats=JSON.parse(localStorage.arr) 

    for(let people of chats)
      newMessageCount[people]=0;    
    
    $('#error').hide()
    //Insert friends
        
    //update List
    updatelist(chats)
     

    //Friend Search
    $('#friend').keyup((e)=>{
      $('#error').hide()
        if(e.keyCode==13)
          findfriend()
        
    })
    $('#chatline button').click(()=>{
      $('#error').hide()       
      findfriend()
    })

    function findfriend(){

        friend=$('#friend').val()
        $.post('search',{
          friend
        },(data)=>{
          if(data)
           refreshlist(friend)
        })
    }


    function updatechats(){
        localStorage.arr=JSON.stringify(chats)
    }

    
    function updatelist(arr){
       
      for(let a of arr) 
      {
       
        $('#chats')
           .append(
            $('<div>')
            //.val(`<img src='./default.jpg' class='rounded-circle'>`)
            .attr('id',a)
            .attr('class','alert alert-light mx-3')
            .attr('role','alert')
            .append(
              $('<input disabled>')
               .attr('value',a)
               .attr('type','text')
               .attr('class','friends')
            )
            .append(
              $('<input type="submit">')
              .val('Chat')
              .attr('id','btn-'+a)
              .attr('class','chat-btns btn btn-outline-dark')
              .click(()=>{
                globalState=a;
              })
            )
         )
       

         if(friendsOnline[a])
         {
          $('#'+a).attr('class','alert alert-success mx-1')
          $(`#btn-`+a).attr('class','chat-btns btn btn-outline-success')
         }
         if(newMessageCount[a])
          {
            $(`#${a} .friends`).attr('value',a+'    ----'+newMessageCount[a]+'New Messages')
          }
      }
    }

    function refreshlist(friend){
      let isNew=true
      //check if the friend exists in list
      for(let people of chats)
       if(people==friend)
        isNew=false;
      if(isNew && friend!=myName)
      {  
        chats.push(friend)
        updatechats()
        let fr=[]
        fr.push(friend) 
        updatelist(fr)
      }
      else $('#error').html('Friend is already in your list!!').show()
    }

    $('#form').on('submit',(e)=>{
       e.preventDefault()
       //set value of hide box
       $('#send').val(globalState);
       $('#form')[0].submit()
    })
    
    //Hide send box
     $("#send").hide()

    //Listening to messages
    socket.on('incoming',(data)=>{
      newMessageCount[data.from]++;
    }) 

     //Check if online
     function isOnline()
     {
       for(let people of chats)
        socket.emit('isOnline',{name:people})
     }

    socket.on('online',(data)=>{
       if(data.answer===true)
        friendsOnline[data.name]=true
       else friendsOnline[data.name]=false 
       $('#chats').html('')
       updatelist(chats)
    })

    //Pinging Server that I am online
     setInterval(()=>{
       socket.emit('isAlive',{
         session:sessionID
       }) 
    },1000)
    //Check if friends are online
     setInterval(()=>isOnline()
     ,3000)

    function setCookie(cname, cvalue, exdays) {
      var d = new Date();
      d.setTime(d.getTime() + (exdays*24*60*60*1000));
      var expires = "expires="+ d.toUTCString();
      document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }
    
})

