

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
        let reader
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
        if(!checkphoto[a])
         {
           checkphoto[a]='nul'
           //$.post('photo',{name:a},(data)=>{
             /*if(data)
               {
                 reader=new FileReader()
                 reader.readAsDataURL(data)
                 reader.onloadend=()=>{
                   $(`#${a} img`).src=reader.result
                 }
               }
              if(data){ 
                checkphoto[a]=data
                $(`#${a} img`).src=data
              }
           }) */
/*
           async function photo(){
            let blob=fetch('/photo').then(r=>r.blob())
            let dataUrl = await new Promise(resolve => {
              let reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.readAsDataURL(blob);
            });
            $(`#${a} img`).src=dataUrl
            checkphoto[a]=dataUrl
           }
           photo()*/

           fetch('/photo').then(function(response) {
            if(response.ok) {
              return response.blob();
            }
            throw new Error('Network response was not ok.');
          }).then(function(myBlob) { 
            var objectURL = URL.createObjectURL(myBlob); 
            checkphoto[a] = objectURL; 
          }).catch(function(error) {
            console.log('There has been a problem with your fetch operation: ', error.message);
          });
         }
         
         if(checkphoto[a])
         {
           if(checkphoto[a]!='nul')
            $(`#${a} img`).attr('src',checkphoto[a])
           console.log(checkphoto) 
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

