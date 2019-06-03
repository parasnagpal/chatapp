function setCookie(cname,cvalue)
{
  console.log("setting cookie")
  let date=new Date();
  date.setTime(date.getTime()+(24*60*60*1000))
  let expires="expires"+date.toUTCString();
  document.cookie=cname+"="+cvalue+";"+expires+";path=/";
}

$('document').ready(()=>{
  setCookie('Name','Paras')

    $('#error').hide()
    $('#error2').hide()     
    $('#signup').click(()=>{
         if($('#fname').val()==''|| $('#username').val()||$('#pass1').val()||$('#pass2').val())
            $('#error').show()
         else if($('#pass1').val()!=$('#pass2').val())
           $('#error2').show()
         else
           {
            $.post('/signup',{
                username:$('#username').val(),
                fname:$('#fname').val(),
                lname:$('#lname').val()  ,
                password:$('#pass1').val()
             })
           }   
     })
     $('#login').click(()=>{
         if($('#userverify').val()==''||$('#password').val()=='')
           $('#err').show()
         else{
            $.post('/login',{
                 username:$('#userverify').val(),
                 password:$('#password').val()
             })
             
         }  
     })
})
