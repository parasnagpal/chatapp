$('document').ready(()=>{

    $('#error').hide()
    $('#error2').hide()  
    $('#f1').attr('action','/login')  
    $('#f2').attr('action','/signup')  
   
    let check =document.getElementById('ischecked')
    let button =document.getElementById('signup')
  
    button.disabled=true;
    check.onchange=()=>{
      button.disabled=!check.checked
    }


    $('#signup').click((e)=>{
         e.preventDefault();
         if($('#fname').val()==''|| $('#username').val()==''||$('#pass1').val()==''||$('#pass2').val()=='')
            $('#error').show()
         else if($('#pass1').val()!=$('#pass2').val())
           $('#error2').show()
         else
             $('#f2').submit()   
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

   //Anime JS  
  // Wrap every letter in a span
   $('.ml11 .letters').each(function(){
     $(this).html($(this).text().replace(/([^\x00-\x80]|\w)/g, "<span class='letter'>$&</span>"));
   });
   
   anime.timeline({loop: true})
     .add({
       targets: '.ml11 .line',
       scaleY: [0,1],
       opacity: [0.5,1],
       easing: "easeOutExpo",
       duration: 700
     })
     .add({
       targets: '.ml11 .line',
       translateX: [0,$(".ml11 .letters").width()],
       easing: "easeOutExpo",
       duration: 700,
       delay: 100
     }).add({
       targets: '.ml11 .letter',
       opacity: [0,1],
       easing: "easeOutExpo",
       duration: 600,
       offset: '-=775',
       delay: function(el, i) {
         return 34 * (i+1)
       }
     }).add({
       targets: '.ml11',
       opacity: 0,
       duration: 1000,
       easing: "easeOutExpo",
       delay: 1000
     });
        
   })
