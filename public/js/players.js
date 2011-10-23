var global_ShipImage = new Image(),
    global_ShipThrust = new Image();
        
global_ShipImage.src = '/img/ship.png'; 
global_ShipImage.onload = function(){      
    global_ShipThrust.src =  '/img/shipThrust.png';  // Load next image
    console.log('images loaded');
};
    


// Function for the ship.  A ship is created for each player connected
function ship(obj){
    console.log('ship called');
    var canvasContext = obj.canvasContext,
        socket = obj.socket,
        canvas = obj.canvas,
        userName = obj.userName,
        startX = obj.startX,
        startY = obj.startY,
        startRotation = obj.startRotation,
        isInternet = obj.isInternet,
        _this = this;
    
    console.log(userName);
    
    
    var myShip = shipMath(startX, startY, startRotation, isInternet, canvas),
        position = myShip.updatePosition(),
        ctx = canvasContext;
    
    //Interface
    return {
        // Render this ship onto the canvas
        renderShip: function(){
            ctx.save();
            ctx.setTransform(1,0,0,1,0,0);
            ctx.fillStyle = "rgb(200,0,0)"; 
            var radian = myShip.getRotationRadian(),
                x       = myShip.updatePosition().x,
                y       = myShip.updatePosition().y,
                thrust  = 0,
                transX  = x + (0.5 * myShip.getDimension().width),
                transY  = y + (0.5 * myShip.getDimension().height);
            
            if(global_KeyHeld[global_KeyBinds.keyCode_up]) { thrust =  1; } else { thrust =  0; }
            
            
            ctx.translate(transX,transY);
            ctx.rotate(radian);
            ctx.translate(-transX,-transY);
            
            // Check to see if this object is the player on this computer or the internet to see whether to show thrust or not
            if(myShip.isFromInternet() === false){
                if(global_KeyHeld[global_KeyBinds.keyCode_up] === true){ 
                    //var audioElement = document.getElementById('thruster'); 
                    //audioElement.setAttribute('src', '/sounds/thrustersound.aiff/'); 
                    //audioElement.play();

                    ctx.drawImage(global_ShipThrust, x, y);
                } else {
                   // var audioElement = document.getElementById('thruster'); 
                   // audioElement.pause();
                   // audioElement.currentTime = 0;
                    
                    ctx.drawImage(global_ShipImage, x, y); 
                } 
            }
            else {
                if(myShip.isThrusting()){
                    ctx.drawImage(global_ShipThrust, x, y);
                } else {
                   
                    ctx.drawImage(global_ShipImage, x, y); 
                } 
                
            }
            ctx.restore(); 
            
            var sendData = { 
                uN: userName, 
                x: x, 
                y: y, 
                r: myShip.getRotation(),
                t: thrust
            };
            
            this.sendShipPosition(sendData);
                
        },
        // SOCKET - Send ships current coordinates to the server
        sendShipPosition: function(sendData){
            
            socket.emit('sendShipPosition' , sendData); 
            
        },
        turnShip: function(direction){
            myShip.turnShip(direction);
        },
        // Move ship forward
        thrustShip: function(){
            myShip.thrust();
        
        },
        // Specify the x/y and radian position of this ship
        setPosition: function(newPosition){
            myShip.setPosition(newPosition);
        }
    };       
}
 
 
 // Function which calculates the math for ever ship on the screen regarding their turning, rotating, and movement
function shipMath( startX, startY, newRotation, isInternet, canvas){
    // Private variables
    var position = { x: startX, y: startY },
        rotation = { rotationVel: 3, rotation: newRotation, radian: 0 },
        facing = { facingX: 0, facingY: 0 },       
        moving = { x: 0, y: 0 },
        thrustAccel = 0.015,
        dimensions = { width: 50, height: 50 },
        internetPlayer = isInternet,
        isInternetThrusting = 0;
    
    // Interface 
    return {
        isFromInternet: function(){
            return internetPlayer;
        },
        isThrusting: function(){
           return isInternetThrusting;
        },
        // Check that this ship is within the boundarys of the canvas
        checkBounds: function(){
            // Make sure x positiong is within the boundary limits and if not, put ship on opposite side of the screen horizotally
            if(position.x < (0 - (dimensions.width-1))){
                position.x = (canvas.width + (dimensions.width-1));
            }
            if(position.x > canvas.width + dimensions.width){
                position.x = (0 - (dimensions.width - 1));
            }
            
            // Make sure the y position is within the boundary limits and if not, put ship on opposite side of the screen vertically
            if(position.y < (0 - (dimensions.height -1))){
                position.y = canvas.height + (dimensions.height-1);
            }
            if(position.y > (canvas.height + dimensions.height-1)){
                position.y = 0 - (dimensions.height - 1);
            }
            
        },
        updatePosition: function(){
            if(!isInternet){
                position.x = position.x + moving.x;
                position.y = position.y + moving.y; 
                
                position.x = Math.round(position.x*10)/10; 
                position.y = Math.round(position.y*10)/10;
                
            }
            this.checkBounds();
            return position;
        },
        setPosition: function(newPosition){
            position.x = newPosition.x;
            position.y = newPosition.y;
            rotation.rotation = newPosition.r;
            isInternetThrusting = newPosition.t;

            
            
        },
        updateRotation: function(){
            rotation.radian = rotation.rotation * Math.PI / 180;    
        },
        turnShip: function(turn){
            if(turn === "left"){
                rotation.rotation -= rotation.rotationVel;
            
            }
            if(turn === "right"){
                rotation.rotation += rotation.rotationVel;
            }
            this.updateRotation();
        },
        getRotationRadian: function(){
            this.updateRotation();
            return rotation.radian;
            
        },
        getRotation: function(){
            return rotation.rotation;
        },
        getDimension: function(){
            return dimensions;
        },
        thrust: function(){
            facing.x = Math.cos(rotation.radian);
            facing.y = Math.sin(rotation.radian);
            
            moving.x = moving.x + thrustAccel * facing.x;
            moving.y = moving.y + thrustAccel * facing.y;
              
        }       
    };
}

