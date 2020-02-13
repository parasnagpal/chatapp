let globalState

$(document).ready(()=>{

   $('#form').attr('action','/chats')

   let socket=io()
   let myName
   let sessionID
   let checkphoto={}
   let unreaddata
   let userdata={}
   
   //Get Identity from server
   $.post('identity',{},(data)=>{
      sessionID=data;
      setCookie('session',data,1);
   })

   $.post('myName',
      {session:sessionID},
      (data)=>{
        myName=data
      })
   .then(()=>{
    socket.emit('unread');
   })

    let newMessageCount={};
    let chats=[];
    let friendsOnline={};
    let friend;
    if(localStorage.arr)
        chats=JSON.parse(localStorage.arr);

    for(let people of chats)
     {
      newMessageCount[people]=0;
      $.post('/user',{name:people},(data)=>{
        userdata[people]=data
      })    
     }
    $('#error').hide();
        
    //update List
    updatelist(chats);
     
    //Friend Search
    $('#friend').keyup((e)=>{
      $('#error').hide();
        if(e.keyCode==13)
          findfriend();
        
    })
    $('#chatline button').click(()=>{
      $('#error').hide();      
      findfriend();
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
        localStorage.arr=JSON.stringify(chats);
    }

    function updatelist(arr){
       
      for(let a of arr) 
      { 
        let image='https://image.flaticon.com/icons/png/512/37/37943.png';   //hardcoded
        $('#chats')
           .append(card(a,image,userdata[a]));
           
        //check unread
        if(unreaddata)
          if(unreaddata[myName])
            if(unreaddata[myName][a])
            {
              $('#'+a+" span").html(`<span class="badge badge-pill badge-danger">New Message</span>`);
            }
        //Check if photo request has been made earlier
        if(!checkphoto[a])
         {
           //Fetch photo
           fetch('/photo',{
                method:'POST',
                body:JSON.stringify({'name':a}),
                headers: {"Content-Type": "application/json"}
              })
            .then(function(response) {
                if(response.ok) {
                  return response.blob();    //convert response to blob - blob constructor
                }
             throw new Error('Network response was not ok.');
             })
             .then(function(myBlob) { 
                    let reader=new FileReader();
                    reader.readAsDataURL(myBlob);
                    reader.onloadend=()=>{
                    checkphoto[a]=reader.result;
              }
             }).catch(function(error) {
               console.log('There has been a problem with your fetch operation: ', error.message);
            });
         }
         
         if(checkphoto[a])
          {
            if(checkphoto[a].slice(5,9)!='text')
              $(`#${a} img`).attr('src',checkphoto[a]);
          }

         if(friendsOnline[a])
          {
            $('#'+a).attr('class','alert alert-danger mx-1');
            $(`#btn-`+a).attr('class','chat-btns btn btn-outline-danger');
          }
         if(newMessageCount[a])
          {
            $(`#${a} .friends`).attr('value',a+'    ----'+newMessageCount[a]+'New Messages');
          }
      }
    }

    function refreshlist(friend){
      let isNew=true;
      //check if the friend exists in list
      for(let people of chats)
        if(people==friend)
          isNew=false;

      if(isNew && friend!=myName)
      {  
          chats.push(friend);
          updatechats();
          let fr=[];
          fr.push(friend);
          updatelist(fr);
      }
      else $('#error').html('Friend is already in your list!!').show();

    }

    $('#form').on('submit',(e)=>{
       e.preventDefault();
       //set value of hide box
       $('#send').val(globalState);
       $('#form')[0].submit();
    })
    
    //Hide send box
     $("#send").hide();

    //Listening to messages
    socket.on('incoming',(data)=>{
      newMessageCount[data.from]++;
    }) 

     //Check if online
     function isOnline()
     {
        for(let people of chats)
          socket.emit('isOnline',{name:people});
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


    //get unread data
    socket.emit('unread') 
    socket.on('unread',(data)=>{
          unreaddata=data;
          
          if(data)
            if(data[myName])
            { 
              for(let x in data[myName])
              {
                if(!chats.find((name)=>{ return name==x}))
                {
                  chats.push(x);
                  updatechats();
                  let fr=[];
                  fr.push(x);
                  updatelist(fr);
                }
              }
            }  
           /* if(!chats.find(people))
             {
              chats.push(people)
              updatechats()
              let fr=[]
              fr.push(people) 
              updatelist(fr)
             }*/
        })

    function setCookie(cname, cvalue, exdays) {
      var d = new Date();
      d.setTime(d.getTime() + (exdays*24*60*60*1000));
      var expires = "expires="+ d.toUTCString();
      document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }
    
})

//layout
function card(username,img_src,info){
  
  if(info)
      return(`
              <div id='${username}' class='alert alert-light mx-3 row' role='alert' onclick="stateChange('${username}')">
                  <img src='${img_src}' >
                  <div class='flex-grow-1 mx-2'>${info.fname+" "+info.lname}</div>
                  <div class='flex-grow-1 mx-2 '>
                      <label class='align-self-start'>Username</label>
                      <div style="padding-top:0;">${info.username}</div>
                  </div>
                  <span ></span>
                  <div >
                      <button id='btn-${username}' class="chat-btns btn btn-outline-dark" onclick="stateChange('${username}')" >
                          <i class='far fa-comment-alt'></i>
                      </button>
                      <button id='btn--${username}' class="chat-btns btn btn-outline-dark" onclick="stateChange('${username}')" >
                          <i class='fas fa-video'></i>
                      </button>
                  </div>
              </div>
            `)        
  else
      return(`
              <div id='${username}' class='alert alert-light mx-3 d-flex' role='alert' onclick="stateChange('${username}')">
                  <img src='${img_src}'>
                  <div class='flex-grow-1 mx-2'>${username}</div>
                  <span></span>
                  <div>
                      <button id='btn-${username}' class="chat-btns btn btn-outline-dark" onclick="stateChange('${username}')" >
                          <i class='far fa-comment-alt'></i>
                      </button>
                      <button id='btn--${username}' class="chat-btns btn btn-outline-dark" onclick="stateChange('${username}')" >
                          <i class='fas fa-video'></i>
                      </button>
                  </div>
              </div>
            `)
  
}

function stateChange(name){
  globalState=name;
  $("#form")[0].submit();
}