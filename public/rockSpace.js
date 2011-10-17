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
        socket.on('getShipPosition', function(newPosition){
            if(shipPlayers[newPosition.userName]){
                shipPlayers[newPosition.userName].setPosition(newPosition);
            }
            		
        });
        socket.on('newPlayer', function(data){
            console.log('new player joining');
            shipPlayers[data.userName] = ship( { canvasContext: ctx, userName: data.userName, startX: data.x, startY: data.y, startRotation: data.radian, isInternet: true });
            	
        });
            
    
        // SOCKET INTERACTION ABOVE //
        
        
        // Function to setup joining or changing rooms in the game list with socket.io
        // Currently not in use
        /*
        function room(newRoomName, newRoomPass){
            var roomName = newRoomName;
            var roomPass = newRoomPass;
            var numPlayers = 0;
            var playerList = {};
            return {
                changeRoom: function(newRoom, newRoomPass){
                    roomName = newRoom;
                    roomPass = newRoomPass;
                    playerList = {};
                },
                getRoom: function(){
                    return roomName;
                },
                addPlayer: function(playerName){
                    playerList[playerName] = true;
                    numPlayers += 1;
                },
                removePlayer: function(playerName){
                    delete playerList[playerName];
                    numPlayers -= 1;
                },
                getPlayers: function(){
                    return playerList;
                },      
                getNumPlayers: function(){
                    return numPlayers;
                }
            };
        
        }*/
        


    
    }
    
    
    // Initialization call
    function init() {
        
        newGame = game();                                       // Start game

    }
    init();
    
   
   

});  








/*    
    var rockSpace = (function () {
        console.log('rockspace loaded');
    
        var socket = io.connect('http://localhost:8000');
        
        var canvas = document.getElementById("stage"),
            ctx = canvas.getContext("2d");  
        
        
        var settings = {
            roomName: '',
            roomPass: '',
            userName: '',
            userPass: '',
            xpos: 0,
            ypos: 0,
            width: 50,
            height: 50,
            rotation: 0,
            rotationVel: 10,
            rotationRadian: 0,
            facingX: 0,
            facingY: 0,
            movingX: 0,
            movingY: 0,
            thrustAcceleration: 0.35,
            health: 10
            
        };
        
        var players = [];
        var global_KeyBinds = {
            keyCode_left: 37,
            keyCode_right: 39,
            keyCode_up: 38,
            keyCode_down: 40,
            keyCode_fire: 32
        }  
        
        
        
        var global_KeyHeld = [];
        var setInt;
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
        var missleArray = [];
        var fireInterval = setInterval(function(){
            if(global_KeyHeld[global_KeyBinds.keyCode_fire]){
                newMis = {
                        dx: 5*Math.cos(Math.PI*(settings.rotation)/180),
                        dy: 5*Math.sin(Math.PI*(settings.rotation)/180),
                        x: settings.xpos + settings.width / 2,
                        y: settings.ypos + settings.height / 2,
                        life: 60,
                        width: 2,
                        height: 2,
                };
                missleArray[missleArray.length] = newMis;
                socket.emit('missleFire' , newMis);
            }
          
        }, 1000);
        
        socket.on('missleFire', function(newMis){
            missleArray[missleArray.length] = newMis;
                    
        });
        
        updateMissles = function(){
              var length = missleArray.length;
              for(var num = 0; num < length; num+=1){
                 thisMissle = missleArray[num];
                 thisMissle.x += thisMissle.dx;
                 thisMissle.y += thisMissle.dy;
                 thisMissle.life -= 1;
                 if(thisMissle.x > canvas.width){
                    thisMissle.x = 0;
                 }
                 if(thisMissle.y > canvas.height){
                    thisMissle.y = 0;
                 }
                 if(thisMissle.y < 0){
                    thisMissle.y = canvas.height;
                 }
                 if(thisMissle.x < 0){
                    thisMissle.x = canvas.width;
                 
                 }
                 if(thisMissle.life < 0){
                    missleArray.splice(num,1);
                 }
                 
              }
        }
        missleCollision = function(){
            for( var num = 0; num <missleArray.length; num += 1){
                thisMissle = missleArray[num];
                var x = thisMissle.x,
                    y = thisMissle.y,
                    kx = settings.xpos,
                    ky = settings.ypos;
                    
                if(x >= kx && x <= (settings.width + kx) ){
                    if(y >= ky && y <= (settings.height+ ky)){
                        console.log('hit');
                        missleArray.splice(missleArray[num],1);

                        settings.health -= 1;
                    }
                }
            
            }
        
        }
        checkLife = function(){
            if(settings.health <= 0){
                alert('dead');
            }
        
        }
        var moveInterval = setInterval(function(){
            var sendVar = false;
            if(global_KeyHeld[global_KeyBinds.keyCode_up]){
                settings.facingX = Math.cos(settings.rotationRadian);
                settings.facingY = Math.sin(settings.rotationRadian);
                
                settings.movingX = settings.movingX + settings.thrustAcceleration * settings.facingX;
                settings.movingY = settings.movingY + settings.thrustAcceleration * settings.facingY;
                
              
                
                sendVar = true;
            }
            if(global_KeyHeld[global_KeyBinds.keyCode_down]){
                settings.ypos += 10;
                
                sendVar = true;
            }
            
            if(global_KeyHeld[global_KeyBinds.keyCode_left]){
                settings.rotation -= settings.rotationVel;
                settings.rotationRadian = settings.rotation * Math.PI / 180,
                
                sendVar = true;
            }
            if(global_KeyHeld[global_KeyBinds.keyCode_right]){
                settings.rotation += settings.rotationVel;
                settings.rotationRadian = settings.rotation * Math.PI / 180,
                
                sendVar = true;    
            }
            if(settings.roomName != ''){
                settings.xpos = settings.xpos + settings.movingX;
                settings.ypos = settings.ypos + settings.movingY;
                if((settings.xpos + settings.width) < 0){
                    settings.xpos = canvas.width;
                }
                if((settings.ypos + settings.height) < 0){
                    settings.ypos = canvas.height;
                }
                if(settings.xpos > canvas.width){
                    settings.xpos = -(settings.width-1);
                }
                if(settings.ypos > canvas.height){
                    settings.ypos = -(settings.height-1);
                }
              //  settings.ypos = settings.ypos * Math.toFixed(4);
              //  settings.xpos = settings.xpos * Math.toFixed(4);
                
                socket.emit('playerMove' , settings);
            }
            
        
        }, 100);
        
         $('.roomClick').live('click',function(){
            var roomName = $(this).attr('data-roomName'),
                roomPass = $("#pw").val(),
                userName = $("#userName").val(),
                userPass = $("#userPass").val()
            
            
            if(userName !== ''){
                if(userPass !== ''){
                    socket.emit('leaveRoom' , settings.roomName);
                    settings.userName = userName;
                    settings.userPass = userPass;
                    settings.roomName = roomName
                    settings.roomPass = roomPass;
                    
                    socket.emit('joinRoom' , roomName, roomPass, userName, userPass, settings.width, settings.height);
                } else { alert('enter a password'); }
            } else { alert('enter a user name'); }
        
        });
        
        var ship = new Image();
        ship.src = '/img/ship.png';
        redrawCanvas = function(){
            ctx.clearRect(0,0, canvas.width, canvas.height);
            for(var key in players){
                
                var thisPlayer = players[key];
                ctx.save();
                ctx.setTransform(1,0,0,1,0,0);
                ctx.fillStyle = "rgb(200,0,0)"; 
                var radians = thisPlayer.rotationRadian,
                    transx  = thisPlayer.xpos + (0.5 * thisPlayer.width),
                    transy  = thisPlayer.ypos + (0.5 * thisPlayer.height);
                ctx.translate(transx,transy);
                ctx.rotate(radians);
                ctx.translate(-transx,-transy);
                ctx.drawImage(ship, thisPlayer.xpos,thisPlayer.ypos);
                
                ctx.restore(); 
     
            }
            for(var num = 0; num < missleArray.length; num++){
                thisMis = missleArray[num];
                ctx.fillRect(thisMis.x, thisMis.y,thisMis.width, thisMis.height);
            
            }
        }
        setInterval(function(){
            if(settings.roomName !== ''){
                checkLife();
                updateMissles();
                missleCollision();
                redrawCanvas();
            }
        }, 10);
        
        socket.on('newPlayer', function(player){
            if(player.playerName === settings.userName){
                console.log('sameName');
                settings.xpos = player.xpos;
                settings.ypos = player.ypos;
            }
            players[player.playerName] = player;
                    
        });
        
        socket.on('getPreviousPlayers', function(prePlayers){
            
            players = prePlayers;
                
        });
        
        socket.on('roomJoinSuccess', function(joinRoomName, roomPass){
            console.log('room '+joinRoomName+ ' joined with roomPass ' + roomPass);
            ctx.clearRect(0,0, canvas.width, canvas.height);
            players = [];
            
        
            settings.roomName = joinRoomName;
            settings.roomPass = roomPass;   
        });
        socket.on('playerInfo', function(playerInfo){
            console.log(playerInfo.playerName);
            players[playerInfo.playerName].xpos = playerInfo.xpos;
            players[playerInfo.playerName].ypos = playerInfo.ypos;
            players[playerInfo.playerName].rotation = playerInfo.rotation;
            players[playerInfo.playerName].rotationRadian = playerInfo.rotationRadian;

        });
        
        socket.on('wrongRoomPass', function(){
                alert('incorrect password');
                
        });
        socket.on('roomClosed', function(){
                alert('room closed');
                
        });
        socket.on('roomFull', function(){
                alert('room full');
                
        });
        socket.on('wrongUserPass',function(){
                alert('wrong user password');
        
        });
        
        socket.on('roomList', function(rooms){
            var roomLength = rooms.length
            console.log(rooms);
            for(var key in rooms){
                console.log(key);
                $('#rooms').html($('#rooms').html() + "<p class='roomClick' data-roomName='"+key+"'> "+ key+ " : " + rooms[key].status +"</p> ");
            
            }           
        });
        
    })();
});*/