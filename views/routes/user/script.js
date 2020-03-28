let expire;
let chatWith;
let userdata={};

$(document).ready(()=>{

    popover();

    let socket=io();
    let myName;
    let sessionID=getCookie('session');
    let checkphoto={};
    let unreaddata;
    
    let chatdata={};
   
    //Get Identity from server
    $.post("identity",{},(data)=>{
      sessionID=data;
      setCookie("session",data,1);
    })

    $.post("myName",
      {session:sessionID},
      (data)=>{
        myName=data
      })

     .then(()=>{
        socket.emit('unread');
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

    let newMessageCount={};
    let chats=[];
    let friendsOnline={};
    let friend;
    if(localStorage.arr)
        chats=JSON.parse(localStorage.arr);

    for(let people of chats)
     {
        newMessageCount[people]=0;
        $.post("/user",{name:people},(data)=>{
          userdata[people]=data
        })    
     }
    $("#error").hide();
        
    //update List
    updatelist(chats);
    
    // Events handlers
    //Friend Search
    $("#friend").keyup((e)=>{
      $("#error").hide();
        if(e.keyCode==13)
          findfriend();
    })

    $("#chatline button").click(()=>{
      $("#error").hide();      
      findfriend();
    })

    //fired when tooltip is shown and stays active 
    $('button[data-toggle=tooltip]').on('shown.bs.tooltip',function(){
      $('#emoji a').click((e)=>{
        $('#message').val(e.target.text);
      })
    })

    $('#sendmsg').click(()=>{
      sendmsg();
    })

    $('#message').keyup((e)=>{
      if(e.keyCode==13)
        sendmsg();
    })

    function findfriend(){

        friend=$("#friend").val()
        $.post("search",{
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
        let image="https://image.flaticon.com/icons/png/512/37/37943.png";   //hardcoded
        $("#chats")
           .append(card(a,image,userdata[a]));
           
        //check unread
        if(unreaddata)
          if(unreaddata[myName])
            if(unreaddata[myName][a])
            {
              $("#"+a+" span").html(`<span class="badge badge-pill badge-danger">New Message</span>`);
            }
        //Check if photo request has been made earlier
        if(!checkphoto[a])
         {
           //Fetch photo
            fetch("/photo",{
                method:"POST",
                body:JSON.stringify({"name":a}),
                headers: {"Content-Type": "application/json"}
              })
            .then(function(response) {
                if(response.ok) {
                  return response.blob();    //convert response to blob - blob constructor
                }
             throw new Error("Network response was not ok.");
             })
             .then(function(myBlob) { 
                    let reader=new FileReader();
                    reader.readAsDataURL(myBlob);
                    reader.onloadend=()=>{
                    checkphoto[a]=reader.result;
              }
             }).catch(function(error) {
               console.log("There has been a problem with your fetch operation: ", error.message);
            });
         }
         
         if(checkphoto[a])
          {
            if(checkphoto[a].slice(5,9)!="text")
              $(`#${a} img`).attr("src",checkphoto[a]);
          }

         if(friendsOnline[a])
          {
            $("#"+a).attr("class","alert alert-danger d-flex");
            $(`#btn-`+a).attr("class","chat-btns btn btn-outline-danger");
          }
         if(newMessageCount[a])
          {
            $(`#${a} .friends`).attr("value",a+"    ----"+newMessageCount[a]+"New Messages");
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
      else $("#error").html("Friend is already in your list!!").show();

    }

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
    
    function setCookie(cname, cvalue, exdays) {
      var d = new Date();
      d.setTime(d.getTime() + (exdays*24*60*60*1000));
      var expires = "expires="+ d.toUTCString();
      document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

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

    function isOnline()
     {
       for(let people of chats)
         socket.emit("isOnline",{name:people});
    }

    //Hide send box
     $("#send").hide();

    //Listening to messages
    socket.on("incoming",(data)=>{
      newMessageCount[data.from]++;
      //copied from user script--
      if(data.from==chatWith)
        chatrefresh(data.message,false,data.from,Date.now())

       if(getCookie('chatdata'))
       chatdata[myName][chatWith][Date.now()]={n:data.message,m:false}
       
       //update cookie
       updateCookie(chatdata)

       //received conversation
       received(myName,chatWith) 
       
    }) 

    socket.on("online",(data)=>{
      if(data.answer===true)
        friendsOnline[data.name]=true;
      else 
        friendsOnline[data.name]=false; 
        $("#chats").html("");
        updatelist(chats);
    })

        //get unread data
    socket.emit("unread"); 
    socket.on("unread",(data)=>{
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
          //copied from chat script--
          if(data)
          if(data[myName])
            {
              for(let time in data[myName][chatWith])
                {
                  chatrefresh(data[myName][chatWith][time],false,chatWith,time);
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
    
    //Pinging Server that I am online
    setInterval(()=>{
      socket.emit("isAlive",{
        session:sessionID
      }) 
    },1000)

    //Check if friends are online
    setInterval(()=>isOnline()
    ,3000)
    
})

//layout
function card(username,img_src,info){
  if(info)
      return(`
              <div id="${username}" class="alert alert-light d-flex" role="alert" >
                  <img src="${img_src}" >
                  <div class="flex-grow-1 mx-2">${info.fname+" "+info.lname}</div>
                  <div class="online" style="display:none;">
                      Online
                  </div>
                  <span ></span>
                  <div >
                      <button id="btn-${username}" class="chat-btns btn btn-outline-dark" onClick="stateChange($(${username}).attr('id'))">
                          <i class="far fa-comment-alt"></i>
                      </button>
                      <button id="btn--${username}" class="chat-btns btn btn-outline-dark" onclick="stateChange("${username}")" >
                          <i class="fas fa-video"></i>
                      </button>
                  </div>
              </div>
            `)        
  else
      return(`
              <div id="${username}" class="alert alert-light d-flex" role="alert" >
                  <img src="${img_src}">
                  <div class="flex-grow-1 mx-2">${username}</div>
                  <span></span>
                  <div>
                      <button id="btn-${username}" class="chat-btns btn btn-outline-dark"  onClick="{stateChange($(${username}).attr('id'))}">
                          <i class="far fa-comment-alt"></i>
                      </button>
                      <button id="btn--${username}" class="chat-btns btn btn-outline-dark" onclick="stateChange("${username}")" >
                          <i class="fas fa-video"></i>
                      </button>
                  </div>
              </div>
            `)
  
}

//Add chat cards
function chatrefresh(msg,bool,from,time){
  //date  
  let date=new Date(Date.now())
  if(time)
    date=new Date(parseInt(time))
  
  img_path='../routes/chat/css/default.jpg';
  
  if(bool)
    $('#chat')
      .append(` <div role="alert" aria-live="assertive" aria-atomic="true" class="toast mytoast" data-autohide="false">
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

function popover(){
  $('button[data-toggle=tooltip]').tooltip({
    html:true,
    trigger:'click',
    title:` <html>
              <body>
                <div id='emoji'>
                  <a class='smile' href='#'>🙂</a>
                  <a class='smile' href='#'>😎</a>
                  <a class='smile' href='#'>😶</a>
                  <a class='smile' href='#'>😛</a>
                  <a class='smile' href='#'>😂</a>
                </div>
              </body>
             </html>`,
    placement:'top'
  })
}

function stateChange(username){
  if(!chatWith)
  {
    $('.hide-toggle').removeClass('hide-toggle')
    $('.show-toggle').addClass('hide-toggle').removeClass('show-toggle')
  }
  chatWith=username;
  if(userdata[username])
    $('.chatWith').text(userdata[username].fname+" "+userdata[username].lname);
  else
    $('.chatWith').text(username);
}