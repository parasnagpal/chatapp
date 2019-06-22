$(document).ready(()=>{

    let myName
    let sessionID=getCookie('session')
    
    
    //get identity from server
    $.post('myName',
         {session:sessionID},
         (data)=>{
           myName=data
           $.post('user',
               {name:myName},
               (data)=>{
                 console.log(data)
                 $('.name').text(data.fname+" "+data.lname)
                 $('.username').text(data.username)
                 $('.email').text(data.email)
                 $('.mobile').text(data.mobile)
            })   
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
})