$('document').ready(()=>{
  

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
           console.log($('#userverify').val()+$('#password').val())
            $.post('/login',{
                 username:$('#userverify').val(),
                 password:$('#password').val()
             })
             
         }  
     })
})
