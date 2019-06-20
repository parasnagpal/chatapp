$(document).ready(()=>{

    let myName
    let sessionID=getCookie('session')
    
    
    //get identity from server
    $.post('myName',
         {session:sessionID},
         (data)=>{
           myName=data
           console.log(myName)
           $.post('user',
               {name:myName},
               (data)=>{
                 console.log(data)
                 myName=data.fname
                 $('.name').text(data.fname+" "+data.lname)
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