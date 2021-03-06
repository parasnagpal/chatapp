let expire;
let chatWith;
let myName;
let userdata={};
let chatdata={};
let conversation;
let newMessageCount={};
let chats=[];
let friendsOnline={};
let friend;
let checkphoto={};
let unreaddata;
let default_image=fetchphoto('default')

window.onload=async function(){

    popover();
    popover_bottom();
    open_display(2);

    let socket=io();
    let sessionID=getCookie('session');
    $('#submit').prop('disabled',true);
   
    //Get Identity from server
    await $.post("identity",{},(data)=>{
      sessionID=data;
      setCookie("session",data,1);
    })

    await $.post("myName",
      {session:sessionID},
      (data)=>{
        myName=data
    })
    .then(()=>{
        socket.emit('unread');
        if(getCookie('chatdata'))
        {
          chatdata=JSON.parse(getCookie('chatdata'));
          iterate_chatdata();
        } 
    })

    fetchphoto(myName,'.my-photo');
    
    if(localStorage.arr)
        chats=JSON.parse(localStorage.arr);

    if(!chats.length)
      chats.push('paras');
          
    for(let people of chats)
     {
        newMessageCount[people]=0;
        $.post("/user",{name:people},(data)=>{
          if(data.username)
            userdata[people]=data; 
          else chats.pop(people);
        })    
     }
    $("#error").hide();
        
    //update List
    clearlist();
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

    $('i[data-toggle=popover]').on('shown.bs.popover', function () {
      $('div.profile-popover').click(()=>open_display(1));
      $('.logout').click(()=>{
        $.post("logout",{},(data)=>{
          console.log(data);
        })
      })
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

    $('.friend-search input').focus(function(){
      $('.header2').css('background-color','white');
      $('.friend-search').css('border','white solid 1px');
    })

    $('.friend-search input').blur(function(){
      $('.friend-search').css('border','rgb(192,192,192) solid 1px');
      $('.header2').css('background-color','rgb(245, 245, 245)');
    })

    $('#submit').click(()=>{
      let file=document.querySelector('input[type=file]').files[0];
     
      if(file)
        $.post('/profile_photo',{
          profile:file
        })
    })

    function findfriend(){
        console.log("findfriend called "+$("#friend").val());
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

    async function updatelist(arr){ 
      for(let a of arr) 
      { 
        let image="https://image.flaticon.com/icons/png/512/37/37943.png";   //hardcoded
        if(checkphoto[a] && checkphoto[a].slice(5,9)!="text")
          image=checkphoto[a];
        $("#chats")
          .append(card(a,image,userdata[a]));
        
           
        //check unread
        if(unreaddata)
          if(unreaddata[myName])
            if(unreaddata[myName][a])
            {
              $("#"+a+" span").html(`<div class="dot rounded-circle align-middle p-2"></div>`);
            }
        //Check if photo request has been made earlier
        if(!checkphoto[a])
            fetchphoto(a,`#${a} img`);
         
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

      update_chatdata(chatdata,Date.now(),{m:$('#message').val(),n:false});
      
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

    function clearlist(){
      $("#chats").html("");
    }

    //Hide send box
     $("#send").hide();

    //Listening to messages
    socket.on("incoming",(data)=>{
      console.log(data);
      newMessageCount[data.from]++;
      //copied from user script--
      if(data.from==chatWith)
        chatrefresh(data.message,false,data.from,Date.now())

      update_chatdata(chatdata,Date.now(),{n:data.message,m:false});
       
      //update cookie
      updateCookie(chatdata)

      //received conversation
      received(myName,chatWith) 
    }) 

    socket.on("online",(data)=>{
      if(data.answer)
        friendsOnline[data.name]=true;
      clearlist();  
      updatelist(chats);
    })

    socket.on("offline",(data)=>{
      delete friendsOnline[data.name];
      clearlist();
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
    })
    
    //Tell Server that I am online
    socket.emit("isAlive",{
      session:sessionID
    }) 
    
    //check once
    isOnline();
    viewport(0);
}

//layout
function card(username,img_src,info){
  
  if(info)
      return(`
              <div id="${username}" class="alert alert-light d-flex" role="alert" >
                  <img src="${img_src}" >
                  <div class="flex-grow-1 mx-2 align-self-center">${info.fname+" "+info.lname}</div>
                  <div class="online align-self-center" style="display:none;">
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

function iterate_chatdata(){
  $('#chat').html("");
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
}

//Add chat cards
function chatrefresh(msg,bool,from,time){
  //date  
  let date=new Date(Date.now())
  if(time)
    date=new Date(parseInt(time))
  
  img_path='../routes/user/css/default.jpg';
  
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

function popover_bottom(){
  console.log('popover_bottom')
  $('i[data-toggle=popover]').popover({
    html:true,
    trigger:'click',
    content:`<html>
              <body class="popover-body">
                <div class='border-bottom profile-popover crsr-ptr' onclick="open_display(0)">Profile</div>
                <div class='crsr-ptr logout' >Logout</div>
              </body>
             </html>`,
    placement:'bottom'
  })
  
}

function stateChange(username){
  if(!chatWith)
  {
    open_display(3);
  }
  viewport(1);
  chatWith=username;
  iterate_chatdata();

  fetchphoto(chatWith,'.chatwith-photo');

  if(userdata[username])
    $('.chatWith').text(userdata[username].fname+" "+userdata[username].lname);
  else
    $('.chatWith').text(username);
}

function update_chatdata(variable,time,obj){
  if(!variable)
    variable={};
  if(!variable[myName])
    variable[myName]={};
  if(!variable[myName][chatWith])
    variable[myName][chatWith]={};
  variable[myName][chatWith][time]=obj;      
}

function updateCookie(chatdata){
  //update cookie
  expire=new Date();
  expire.setTime(Date.now()+(9*365*24*60*60*1000));
  document.cookie=`chatdata=${JSON.stringify(chatdata)};expires=${expire.toUTCString()}`;
}

function fetchphoto(username,classname){
  let default_image="https://image.flaticon.com/icons/png/512/37/37943.png";
  fetch("/photo",{
      method:"POST",
      body:JSON.stringify({"name":username}),
      headers: {"Content-Type": "application/json"}
  })
  .then(function(response) {
      console.log(response.ok);
      if(response.ok) {
        return response.blob();    //convert response to blob - blob constructor
      }
      throw new Error("Network response was not ok.");
  })
  .then(function(myBlob) { 
      let reader=new FileReader();
      reader.readAsDataURL(myBlob);
      reader.onloadend=()=>{
      checkphoto[username]=reader.result;
      if(classname && checkphoto[username].slice(5,9)!="text")
          $(classname).attr('src',checkphoto[username]);
      else  $(classname).attr('src',default_image); 
      }
  })
  .catch(function(error) {
      if(classname)
        $(classname).attr('src',default_image);
      console.log("There has been a problem with your fetch operation: ", error.message);
  });
}

function open_display(state){
  if(state===0 || state===1)
    viewport(1);
  if(state===0)
    $('.profile-photo').attr('src',checkphoto[myName]);  
  $('.open-chat>div').addClass('hide-toggle');
  $('.state-'+state).removeClass('hide-toggle')  
}

function viewport(view){
  
  let x=window.matchMedia('(max-width:700px)')
  let other=(view==1)?0:1;

  if(x.matches)
    breakpoint(view,other);
  else 
    $('.back-arrow').addClass('hide-toggle');    

  function breakpoint(view,other){
    $(`.view-`+view).removeClass('hide-toggle');
    $(".view-"+other).addClass('hide-toggle');
  }

}

function previewfile(){
  let file=document.querySelector('input[type=file]').files[0]
  let reader =new FileReader()
  let display=document.getElementById('image')

  reader.onloadend=()=>{
    display.src=reader.result
  }

  if(file){
     reader.readAsDataURL(file)
    $('#submit').prop('disabled',false)
  }
  else{
     display.src=""
  }
}