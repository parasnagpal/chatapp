

$(document).ready(()=>{

   $('#form').attr('action','/chats')

   
   let globalState
   let socket=io()
   let myName
   let sessionID
   let checkphoto={}
   
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
   }).then(()=>{
    socket.emit('unread')
   })


    
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
        let image='https://image.flaticon.com/icons/png/512/37/37943.png'
        $('#chats')
           .append(
            $('<div>')
            .attr('id',a)
            .attr('class','alert alert-light mx-3')
            .attr('role','alert')
            .click(()=>{
              globalState=a;
              $('#form').submit()
            })
            .append(`<img src='${image}' class="rounded-circle" >`)
            .append(
              $('<input disabled>')
               .attr('value',a)
               .attr('type','text')
               .attr('class','friends')
            )
            .append('<span>')
            .append(
              $('<input type="submit">')
              .val('Chat')
              .attr('id','btn-'+a)
              .attr('class','chat-btns btn btn-outline-dark ')
              .click(()=>{
                globalState=a;
              })
            )
         )
        socket.emit('unread') 
        socket.on('unread',(data)=>{
          if(data)
           if(data[myName])
            if(data[myName][a])
             {
               $('#'+a+" span").html(`
                               <span class="badge badge-pill badge-danger">New Message</span>
                               `)
             }
        })
        //Check if photo request has been made earlier
        if(!checkphoto[a])
         {
           //Fetch photo
           fetch('/photo',{
                            method:'POST'
                           ,body:JSON.stringify({'name':a}),
                           headers: {"Content-Type": "application/json"}
                          })
            .then(function(response) {
                if(response.ok) {
                  return response.blob();    //convert response to blob - blob constructor
                }
             throw new Error('Network response was not ok.');
             })
             .then(function(myBlob) { 
                    let reader=new FileReader()
                    reader.readAsDataURL(myBlob)
                    reader.onloadend=()=>{
                    checkphoto[a]=reader.result
              }
             }).catch(function(error) {
               console.log('There has been a problem with your fetch operation: ', error.message);
            });
         }
         
         if(checkphoto[a])
         {
           if(checkphoto[a].slice(5,9)!='text')
            $(`#${a} img`).attr('src',checkphoto[a])
         }

         if(friendsOnline[a])
         {
          $('#'+a).attr('class','alert alert-danger mx-1')
          $(`#btn-`+a).attr('class','chat-btns btn btn-outline-danger')
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

