$(document).ready(function(){
    var gloabl_BGImage = new Image();
        gloabl_BGImage.src = '/img/space.jpg';
   
    // On finished loading - run program
    gloabl_BGImage.onload = function(){ 
        console.log('Background loaded'); 
        var background = bg();
    };
    
    // renders the background image 
    function bg(){
         var canvas = document.getElementById("bg"),
             ctx = canvas.getContext("2d"),
             bgPos = { x: 0, y: 0, width: 800, height: 600 },
             moveDirection = "left",
             moveSpeed = -.20;
         
         // move the background image slightly 
         function moveBG(){
            if((bgPos.x+bgPos.width) < (bgPos.width - canvas.width))
            {   
                moveDirection = "right";
            } 
            if((bgPos.x > (canvas.width - bgPos.width))){
                moveDirection = "left";
            }
            if(moveDirection === "left"){ moveSpeed = -.20; }
            if(moveDirection === "right"){ moveSpeed = .20; }
            bgPos.x += moveSpeed;
         }
        
        function renderBG(){
            ctx.drawImage(gloabl_BGImage, bgPos.x, bgPos.y);
            
         } 
         
         // Rerender the background ever 100ms
         setInterval(function(){
            moveBG();
            renderBG();
         }, 100);
    }

    
   
});