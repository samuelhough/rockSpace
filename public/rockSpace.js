$(document).ready(function(){
    
    // KEYBOARD EVENT HANDLERS //
    $(window).keydown(function(event) {   
        switch(event.which){  
            case global_KeyBinds.keyCode_up:
                global_KeyHeld[global_KeyBinds.keyCode_up] = true;
                
                event.preventDefault();
                break;
            case global_KeyBinds.keyCode_down:
                global_KeyHeld[global_KeyBinds.keyCode_down] = true;

                event.preventDefault();
                break;
            case global_KeyBinds.keyCode_left:
                global_KeyHeld[global_KeyBinds.keyCode_left] = true;

                event.preventDefault();
                break;
            case global_KeyBinds.keyCode_right:
                global_KeyHeld[global_KeyBinds.keyCode_right] = true;

                event.preventDefault();
                break;   
            case global_KeyBinds.keyCode_fire:
                global_KeyHeld[global_KeyBinds.keyCode_fire] = true;
                event.preventDefault();
                break;             
        }
    });
    $(window).keyup(function(event) {
        switch(event.which){
            case global_KeyBinds.keyCode_up:
                global_KeyHeld[global_KeyBinds.keyCode_up] = false;      
                break;
                
            case global_KeyBinds.keyCode_down:
                global_KeyHeld[global_KeyBinds.keyCode_down] = false;     
                break;
                
            case global_KeyBinds.keyCode_left:
                global_KeyHeld[global_KeyBinds.keyCode_left] = false;
                break;
                 
            case global_KeyBinds.keyCode_right:
                global_KeyHeld[global_KeyBinds.keyCode_right] = false;
                break;
                 
            case global_KeyBinds.keyCode_fire:
                global_KeyHeld[global_KeyBinds.keyCode_fire] = false;         
                break;                
        }
    });

    
    // -----------KEYBOARD EVENT HANDLERS ABOVE----------------------- //
    
    // Implied globals
    var global_KeyBinds = {
        keyCode_left: 37,
        keyCode_right: 39,
        keyCode_up: 38,
        keyCode_down: 40,
        keyCode_fire: 32
    };
    var global_KeyHeld = {}; // Holds a true value corresponding to a key value while it is pressed down
    
    // Load Asset Chain
    var global_ShipImage = new Image(),
        global_ShipThrust = new Image();
        
    global_ShipImage.src = '/img/ship.png'; 
    global_ShipImage.onload = function(){      
        global_ShipThrust.src =  '/img/shipThrust.png';  // Load next image
    };
    
    global_ShipThrust.onload = function(){
        init();                                          // Final Image - start program
    }
    
    
    
    function game(){
        var socket = io.connect('http://localhost:8000'); 
        
        // Start Button        
        $('#submit').click(function(){
            var userName = $("#userName").val();
            createPlayer(userName);
            $(this).hide();
        });
        
        // Game Element          
        var canvas = document.getElementById("stage"),
            ctx = canvas.getContext("2d"),
            shipPlayers = {};
        
        // Create a ship for this player 
        function createPlayer(userName){
            shipPlayers.thisPlayer = ship( { canvasContext: ctx, userName: userName, startX: 40, startY: 40, startRotation: 0, isInternet: false });
            socket.emit('newPlayer' , { userName: userName, x: 40, y: 40, radian: 0 });
        }
        
        // Clear the canvas on the stage
        function clearCanvas (){
            ctx.clearRect( 0, 0, canvas.width, canvas.height);
        };
        
        // Render every ship on the stage
        function renderPlayers(){
            for( var key in shipPlayers){
                shipPlayers[key].renderShip();
            }
        };
        
        
        
        
        
        
        // Check if a key is currently being pressed, if so, call the appropriate function
        function movePlayer(){
            if(global_KeyHeld[global_KeyBinds.keyCode_up] === true){
                shipPlayers.thisPlayer.thrustShip();
            }
            if(global_KeyHeld[global_KeyBinds.keyCode_left] === true){
                shipPlayers.thisPlayer.turnShip('left');
            }
            if(global_KeyHeld[global_KeyBinds.keyCode_right] === true){
                shipPlayers.thisPlayer.turnShip('right');            
            }
        };     
     
        
     
        // Function which calculates each ships math for turning, rotating, and radians
        function shipMath( startX, startY, newRotation, isInternet ){
            // Private variables
            var position = { x: startX, y: startY },
                rotation = { rotationVel: 3, rotation: newRotation, radian: 0 },
                facing = { facingX: 0, facingY: 0 },
                moving = { x: 0, y: 0 },
                thrustAccel = 0.015,
                dimensions = { width: 50, height: 50 },
                internetPlayer = isInternet,
                isInternetThrusting = false;
            
            // Interface 
            return {
                isFromInternet: function(){
                    return internetPlayer;
                },
                isThrusting: function(){
                   return isInternetThrusting;
                },
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
                        
                        position.x = Math.round(position.x*100)/100; 
                        position.y = Math.round(position.y*100)/100;
                        
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
        
        // Function for the ship.  A ship is created for each player connected
        function ship(obj){
            var canvasContext = obj.canvasContext,
                userName = obj.userName,
                startX = obj.startX,
                startY = obj.startY,
                startRotation = obj.startRotation,
                isInternet = obj.isInternet,
                _this = this;
            
            console.log(userName);
            var myShip = shipMath(startX, startY, startRotation, isInternet),
                position = myShip.updatePosition(),
                ctx = canvasContext;
            
            
            return {
                renderShip: function(){
                    ctx.save();
                    ctx.setTransform(1,0,0,1,0,0);
                    ctx.fillStyle = "rgb(200,0,0)"; 
                    var radian = myShip.getRotationRadian(),
                        x       = myShip.updatePosition().x,
                        y       = myShip.updatePosition().y,
                        transX  = x + (0.5 * myShip.getDimension().width),
                        transY  = y + (0.5 * myShip.getDimension().height);
                    
                    ctx.translate(transX,transY);
                    ctx.rotate(radian);
                    ctx.translate(-transX,-transY);
                    
                    // Check to see if this object is the player on this computer or the internet to see whether to show thrust or not
                    if(myShip.isFromInternet() === false){
                        if(global_KeyHeld[global_KeyBinds.keyCode_up] === true){ 
                            ctx.drawImage(global_ShipThrust, x, y);
                        } else {
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
                    
                    // Send ships current coordinates to the server
                    var sendData = { 
                        userName: userName, 
                        x: x, 
                        y: y, 
                        r: myShip.getRotation(),
                        t: global_KeyHeld[global_KeyBinds.keyCode_up]
                    };
                    socket.emit('sendShipPosition' , sendData);     
                },
                turnShip: function(direction){
                    myShip.turnShip(direction);
                },
                thrustShip: function(){
                    myShip.thrust();
                
                },
                setPosition: function(newPosition){
                    myShip.setPosition(newPosition);
                }
            };       
        }
        
        // Main Set interval for the rendering of the stage and movement
        var runProgram = setInterval(function(){
            movePlayer();
            clearCanvas();
            renderPlayers();
        }, 20);
        
        // SOCKET INTERACTION BELOW //  
        
        // Loads previous players onto the canvas
        socket.on('getPreviousPlayers', function(playerArray){
          	for(var playerNum = 0; playerNum < playerArray.length; playerNum += 1){          
          		var data = playerArray[playerNum];
          		shipPlayers[data.userName] = ship( { canvasContext: ctx, userName: data.userName, startX: data.x, startY: data.y, startRotation: data.r, isInternet: true });
            }
            	
        });  
        
        // Loads the ship position for a specific player
        socket.on('getShipPosition', function(newPosition){
            if(shipPlayers[newPosition.userName]){
                shipPlayers[newPosition.userName].setPosition(newPosition);
            }
            		
        });
        
        // Creates a new ship when a new player joins
        socket.on('newPlayer', function(data){
            console.log('new player joining');
            shipPlayers[data.userName] = ship( { canvasContext: ctx, userName: data.userName, startX: data.x, startY: data.y, startRotation: data.radian, isInternet: true });
            	
        });
        
        // SOCKET INTERACTION ABOVE //
    
    }
    
    
    // Initialization call
    function init() {
        
        newGame = game();                                       // Start game

    }
    init();
    
   
   

});  







