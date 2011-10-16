
var io           = require('socket.io'),
    express      = require('express'),
    MemoryStore  = express.session.MemoryStore,
    parseCookie  = require('connect').utils.parseCookie,
    sessionStore = new MemoryStore(),
    app          = express.createServer();

app.configure(function () {
  
    app.set('port', 8000);
    app.set('address', 'http://localhost:8000/');
  
    //Define server directory for static content
    app.use(express.static(__dirname + '/public')); 
    
    app.use(express.cookieParser());
    app.use(express.session({store: sessionStore
        , secret: 'secret'
        , key: 'express.sid'}));
    
});

app.listen(app.settings.port);
var sio = io.listen(app);

var rooms   = { 

    asteroids1: { 
        status: 'locked',
        pw: 'join',
        playerLim: 9,
        curPlayer: 0,
        players: {

        }
    
    },
    game2: {
        status: 'locked',
        pw: 'lol',
        playerLim: 9,
        curPlayer: 0,
        players: {

        }
    },
    game5: {
        status: 'full',
        pw: '',
        playerLim: 9,
        curPlayer: 0,
        players: {

        }
    },
    game9: {
        status: 'open',
        pw: '',
        playerLim: 9,
        curPlayer: 0,
        players: {

        }
    
    }

}

var userID  = 0;
sio.sockets.on('connection', function (socket) {
    var thisRoom = '';
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

});


