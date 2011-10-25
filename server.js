
var io           = require('socket.io'),
    express      = require('express'),
    MemoryStore   = express.session.MemoryStore,
    parseCookie  = require('connect').utils.parseCookie,
    storesession = new MemoryStore(),
    prog          = express.createServer();

prog.configure(function () {
  
    prog.set('port', 8000);
    prog.set('address', 'http://localhost:8000/');
    prog.use(express.static(__dirname + '/public')); 
    
    
});

prog.listen(prog.settings.port);
var sio = io.listen(prog);

var canvas = { width: 700, height: 600 }

var players = [];


var rocks = {
    rockList: [],
    main: function(){
        this.createRocks(10);

    },
    getRocks: function(){
        this.updateRockPos();
        var sendRocks = [];
        var rockNum = this.rockList.length;
        for(var cur = 0; cur < rockNum; cur += 1){
            var thisRock = this.rockList[cur].position.simplePos();
            sendRocks.push(thisRock);
        }
        return sendRocks;
    },
    createRocks: function(num){
        for( var amt = 0; amt < num; amt += 1){
            var newRock = {
                position: { 
                    init: function(){
                        this.x = Math.random() * canvas.width;
                        this.y = Math.random() * canvas.height;
                        this.dx = (Math.random() * this.dir() * this.speed)+this.dir()*this.speed;
                        this.dy = (Math.random() * this.dir() * this.speed)+this.dir()*this.speed;
                        this.rotationSpeed = Math.random() * 5 * this.dir();
                    },
                    width: 50,
                    height: 50,
                    dir: function(){
                        if(Math.random() > .51){ return 1 } else { return -1 }
                    },
                    speed: 0.1,
                    x: 20, 
                    y: 20,
                    dx: 0,
                    dy: 0,
                    r: 0,
                    rotationSpeed: 0.01,
                    update: function(){
                        this.r += this.rotationSpeed;
                        this.x += this.dx;
                        this.y += this.dy;
                        this.x = Math.round(this.x*100)/100;
                        this.y = Math.round(this.y*100)/100;
                        this.r = Math.round(this.r*10)/10;
                        if(this.x < (-this.width) ){ this.x = canvas.width + this.width -1;  }
                        if(this.x > canvas.width + this.width -1){ this.x = -this.width + 1;  }
                        if(this.y < -this.height ){ this.y = canvas.height + this.height - 1; }
                        if(this.y > canvas.height + this.height - 1){ this.y = -this.height + 1;  }
                        
                    },
                    simplePos: function(){ return { x: this.x, y: this.y, r: this.r }; }
                },
                
            }
            newRock.position.init();
            this.rockList.push(newRock);
        }
    },
    updateRockPos: function(){
        for( var rockNum = 0; rockNum < this.rockList.length; rockNum += 1){
            var tempRock = this.rockList[rockNum];
            tempRock.position.update();
        }
    }
};
rocks.main();

sio.sockets.on('connection', function (socket) {
    socket.emit('getPreviousPlayers' , players);
    
    socket.on('newPlayer', function(data){	
        players[players.length] = data;
        socket.broadcast.emit('newPlayer', data);
    });
    socket.on('sendShipPosition', function(newPosition){
        players[newPosition.userName] = newPosition;
        socket.broadcast.emit('getSPos' , newPosition);
    		
    });
    
    var main = setInterval(function(){
        socket.emit('getRocks' , rocks.getRocks());
        
    }, 40);
    
    
    // Rooms currently disabled - need to rewrite the code to properly use them.

   /* var thisRoom = '';
    socket.emit('roomList', rooms);
    socket.on('leaveRoom', function(roomName){
        console.log('leave room');
        socket.leave(roomName);
    		
    });
    socket.on('joinRoom', function(roomName, password, playerName, playerPass, playerWidth, playerHeight){
        if(rooms[roomName].status === 'open' || rooms[roomName].status === 'locked'){
            if(rooms[roomName].pw === password || rooms[roomName].pw === ''){
                if(!(rooms[roomName].players[playerName]) || rooms[roomName].players[playerName].pw === playerPass ){
                    socket.emit('roomJoinSuccess' , roomName, password);
                	socket.join(roomName);	
                	
                	var thisPlayer = {
                	    playerName: playerName,
                	    pw:   playerPass,
                        xpos: Math.random()*200+50,
                        ypos: Math.random()*200+50,
                        width: playerWidth,
                        height: playerHeight,
                        rotation: 0,
                        rotationRaian: 0
                    };
                    rooms[roomName].players[playerName] = thisPlayer;
                	
                    socket.to(roomName).emit('getPreviousPlayers', rooms[roomName].players);
                	
                	socket.to(roomName).emit('newPlayer', thisPlayer );
                    socket.to(roomName).broadcast.emit('newPlayer', thisPlayer); 
                } else {
                    socket.emit('wrongUserPass');
                
                }
            }  else { socket.emit('wrongRoomPass'); }
        } else { 
            if(rooms[roomName].status === 'full'){
                socket.emit('roomFull');
            }
            if(rooms[roomName].status === 'closed'){
                socket.emit('roomClosed'); 
            }       
        } 	 		
    });
   
    socket.on('playerMove', function(userSettings){
        var roomName = userSettings.roomName, 
            roomPass = userSettings.roomPass, 
            playerName = userSettings.userName, 
            playerPass = userSettings.userPass, 
            xPos = userSettings.xpos, 
            yPos = userSettings.ypos,
            rotation = userSettings.rotation,
            rotationRadian = userSettings.rotationRadian;
        
        if(rooms[roomName].pw === roomPass){
            if(rooms[roomName].players[playerName].pw === playerPass){
                rooms[roomName].players[playerName].xpos = xPos;
                rooms[roomName].players[playerName].ypos = yPos;
                rooms[roomName].players[playerName].rotation = rotation;
                rooms[roomName].players[playerName].rotationRadian = rotationRadian;
                
            }
        
        }
        
    });
    socket.on('missleFire', function(newMis){	
        socket.broadcast.emit('missleFire' , newMis);
    		
    });
    
    sendCoords = function(){
        console.log('in send');
        for(var thisRoom in rooms){
            
            if((rooms[thisRoom].players)){
                for(var playerName in rooms[thisRoom].players){
                    if((rooms[thisRoom].players[playerName])){
                      var playerInfo = {
                          xpos: rooms[thisRoom].players[playerName].xpos,
                          ypos: rooms[thisRoom].players[playerName].ypos,
                          rotation: rooms[thisRoom].players[playerName].rotation,
                          rotationRadian: rooms[thisRoom].players[playerName].rotationRadian,
                          playerName: playerName,

                      
                      }
                      socket.to(thisRoom).broadcast.emit('playerInfo', playerInfo);
                      
                      socket.to(thisRoom).emit('playerInfo', playerInfo);
                        
                    }
                }
            } else { console.log('if wrong'); }
        
        }
        
        console.log('after send coords');
    };

    setInterval(function () {
        sendCoords();
    }, 10);
    

    
    
    
    
    
    socket.to(thisRoom).emit('disconnect', function(data){
    	
    		
    }); 
*/
});


