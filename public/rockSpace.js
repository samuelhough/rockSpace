$(document).ready(function(){
    var rockSpace = (function () {
        console.log('rockspace loaded');
    
        var socket = io.connect('http://192.168.1.104:8000');
        
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
        var keyBinds = {
            keyCode_left: 37,
            keyCode_right: 39,
            keyCode_up: 38,
            keyCode_down: 40,
            keyCode_fire: 32
        }  
        
        
        
        var keyHeld = [];
        var setInt;
        $(window).keydown(function(event) {
            
            switch(event.which){
                
                case keyBinds.keyCode_up:
                    keyHeld[keyBinds.keyCode_up] = true;
                    
                    event.preventDefault();
                    break;
                case keyBinds.keyCode_down:
                    keyHeld[keyBinds.keyCode_down] = true;
 
                    event.preventDefault();
                    break;
                case keyBinds.keyCode_left:
                    keyHeld[keyBinds.keyCode_left] = true;

                    event.preventDefault();
                    break;
                case keyBinds.keyCode_right:
                    keyHeld[keyBinds.keyCode_right] = true;

                    event.preventDefault();
                    break;   
                case keyBinds.keyCode_fire:
                    keyHeld[keyBinds.keyCode_fire] = true;
                    event.preventDefault();
                    break;             
            }
        });
        $(window).keyup(function(event) {
            switch(event.which){
                case keyBinds.keyCode_up:
                    keyHeld[keyBinds.keyCode_up] = false;
                    
                    break;
                case keyBinds.keyCode_down:
                    keyHeld[keyBinds.keyCode_down] = false;

                    
                    break;
                case keyBinds.keyCode_left:
                    keyHeld[keyBinds.keyCode_left] = false;

                     break;
                case keyBinds.keyCode_right:
                    keyHeld[keyBinds.keyCode_right] = false;
                    break; 
                case keyBinds.keyCode_fire:
                    keyHeld[keyBinds.keyCode_fire] = false;
                    
                    break;                
            }
        });
        var missleArray = [];
        var fireInterval = setInterval(function(){
            if(keyHeld[keyBinds.keyCode_fire]){
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
            if(keyHeld[keyBinds.keyCode_up]){
                settings.facingX = Math.cos(settings.rotationRadian);
                settings.facingY = Math.sin(settings.rotationRadian);
                
                settings.movingX = settings.movingX + settings.thrustAcceleration * settings.facingX;
                settings.movingY = settings.movingY + settings.thrustAcceleration * settings.facingY;
                
              
                
                sendVar = true;
            }
            if(keyHeld[keyBinds.keyCode_down]){
                settings.ypos += 10;
                
                sendVar = true;
            }
            
            if(keyHeld[keyBinds.keyCode_left]){
                settings.rotation -= settings.rotationVel;
                settings.rotationRadian = settings.rotation * Math.PI / 180,
                
                sendVar = true;
            }
            if(keyHeld[keyBinds.keyCode_right]){
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
});