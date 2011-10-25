var global_ShipImage = new Image(),
    global_ShipThrust = new Image();
        
global_ShipImage.src = '/img/ship.png'; 
global_ShipImage.onload = function(){      
    global_ShipThrust.src =  '/img/shipThrust.png';  // Load next image
    console.log('images loaded');
};
    


// Function for the ship.  A ship is created for each player connected
function ship(obj){
    this.ctx = obj.canvasContext;
    this.socket = obj.socket;
    this.canvas = obj.canvas;
    this.userName = obj.userName;
    this.startX = obj.startX;
    this.startY = obj.startY;
    this.startRotation = obj.startRotation;
    this.isInternet = obj.isInternet;
    
    this.myShip = new shipMath(this.startX, this.startY, this.startRotation, this.isInternet, this.canvas);
    this.position = this.myShip.updatePosition();
      
};

ship.prototype.setPosition = function(newPosition){
    this.myShip.setPosition(newPosition)
} 
ship.prototype.thrustShip = function(){
    this.myShip.thrust();

}
ship.prototype.turnShip = function(direction){
    this.myShip.turnShip(direction);
}
ship.prototype.sendShipPosition = function(sendData){          
    this.socket.emit('sendShipPosition' , sendData); 
            
}
ship.prototype.renderShip = function(){
            this.ctx.save();
            this.ctx.setTransform(1,0,0,1,0,0);
            this.ctx.fillStyle = "rgb(200,0,0)"; 
            var radian =  this.myShip.getRotationRadian(),
                x       = this.myShip.updatePosition().x,
                y       = this.myShip.updatePosition().y,
                thrust  = 0,
                transX  = x + (0.5 * this.myShip.getDimension().width),
                transY  = y + (0.5 * this.myShip.getDimension().height);
            
            if(global_KeyHeld[global_KeyBinds.keyCode_up]) { thrust =  1; } else { thrust =  0; }
            
            
            this.ctx.translate(transX,transY);
            this.ctx.rotate(radian);
            this.ctx.translate(-transX,-transY);
            
            // Check to see if this object is the player on this computer or the internet to see whether to show thrust or not
            if(this.myShip.isFromInternet() === false){
                if(global_KeyHeld[global_KeyBinds.keyCode_up] === true){ 
                    //var audioElement = document.getElementById('thruster'); 
                    //audioElement.setAttribute('src', '/sounds/thrustersound.aiff/'); 
                    //audioElement.play();

                    this.ctx.drawImage(global_ShipThrust, x, y);
                } else {
                   // var audioElement = document.getElementById('thruster'); 
                   // audioElement.pause();
                   // audioElement.currentTime = 0;
                    
                    this.ctx.drawImage(global_ShipImage, x, y); 
                } 
            }
            else {
                if(this.myShip.isThrusting()){
                    this.ctx.drawImage(global_ShipThrust, x, y);
                } else {
                   
                    this.ctx.drawImage(global_ShipImage, x, y); 
                } 
                
            }
            this.ctx.restore(); 
            
            var sendData = { 
                uN: this.userName, 
                x: x, 
                y: y, 
                r: this.myShip.getRotation(),
                t: thrust
            };
            
            this.sendShipPosition(sendData);
                
};
 
 
 
 // Function which calculates the math for ever ship on the screen regarding their turning, rotating, and movement
function shipMath( startX, startY, newRotation, isInternet, canvas){
    // Private variables
    this.canvas = canvas;
    this.position = { x: startX, y: startY },
    this.rotation = { rotationVel: 3, rotation: newRotation, radian: 0 },
    this.facing = { facingX: 0, facingY: 0 },       
    this.moving = { x: 0, y: 0 },
    this.thrustAccel = 0.015,
    this.dimensions = { width: 50, height: 50 },
    this.internetPlayer = isInternet,
    this.isInternetThrusting = 0;
}

shipMath.prototype.isFromInternet = function(){
    return this.internetPlayer;
}
shipMath.prototype.isThrusting = function(){
           return this.isInternetThrusting;
}
        // Check that this ship is within the boundarys of the canvas
shipMath.prototype.checkBounds = function(){
            // Make sure x positiong is within the boundary limits and if not, put ship on opposite side of the screen horizotally
            if(this.position.x < (0 - (this.dimensions.width-1))){
                this.position.x = (this.canvas.width + (this.dimensions.width-1));
            }
            if(this.position.x > this.canvas.width + this.dimensions.width){
                this.position.x = (0 - (this.dimensions.width - 1));
            }
            
            // Make sure the y position is within the boundary limits and if not, put ship on opposite side of the screen vertically
            if(this.position.y < (0 - (this.dimensions.height -1))){
                this.position.y = this.canvas.height + (this.dimensions.height-1);
            }
            if(this.position.y > (this.canvas.height + this.dimensions.height-1)){
                this.position.y = 0 - (this.dimensions.height - 1);
            }
            
}
shipMath.prototype.updatePosition = function(){
            if(!this.isInternet){
                this.position.x = this.position.x + this.moving.x;
                this.position.y = this.position.y + this.moving.y; 
                
                this.position.x = Math.round(this.position.x*10)/10; 
                this.position.y = Math.round(this.position.y*10)/10;
                
            }
            this.checkBounds();
            return this.position;
}
shipMath.prototype.setPosition = function(newPosition){
            this.position.x = newPosition.x;
            this.position.y = newPosition.y;
            this.rotation.rotation = newPosition.r;
            this.isInternetThrusting = newPosition.t;

            
            
}
shipMath.prototype.updateRotation = function(){
            this.rotation.radian = this.rotation.rotation * Math.PI / 180;    
}
shipMath.prototype.turnShip = function(turn){
            if(turn === "left"){
                this.rotation.rotation -= this.rotation.rotationVel;
            
            }
            if(turn === "right"){
                this.rotation.rotation += this.rotation.rotationVel;
            }
            this.updateRotation();
}
shipMath.prototype.getRotationRadian = function(){
            this.updateRotation();
            return this.rotation.radian;
            
}
shipMath.prototype.getRotation = function(){
            return this.rotation.rotation;
}
shipMath.prototype.getDimension = function(){
            return this.dimensions;
}
shipMath.prototype.thrust = function(){
            this.facing.x = Math.cos(this.rotation.radian);
            this.facing.y = Math.sin(this.rotation.radian);
            
            this.moving.x = this.moving.x + this.thrustAccel * this.facing.x;
            this.moving.y = this.moving.y + this.thrustAccel * this.facing.y;
              
}      

