$(document).ready(()=>{

    let myName
    let sessionID=getCookie('session')
    
    $('#submit').prop('disabled',true)
    
    
    //get identity from server
    $.post('myName',
         {session:sessionID},
         (data)=>{
           myName=data
           $.post('user',
               {name:myName},
               (data)=>{
                 console.log(data)
                 $('#name').val(myName).hide()
                 $('.name').text(data.fname+" "+data.lname)
                 $('.username').text(data.username)
                 $('.email').text(data.email)
                 $('.mobile').text(data.mobile)
            })   
    }).then(()=>{
      fetch()
    })
   
  

    

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

    function fetch(){
      //Fetch photo
      fetch('/photo',{
        method:'POST'
       ,body:JSON.stringify({'name':myName}),
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
            if(reader.result.slice(5,9)!='text')  
             document.querySelector('image').src=reader.result
       }
       }).catch(function(error) {
       console.log('There has been a problem with your fetch operation: ', error.message);
       });
      }
})

function previewfile(){
  let file=document.querySelector('input[type=file]').files[0]
  let reader =new FileReader()
  let display=document.getElementById('image')

  reader.onloadend=()=>{
    display.src=reader.result
  }

  if(file)
   {
     reader.readAsDataURL(file)
    $('#submit').prop('disabled',false)

   }else
   {
     display.src=""
   }
}