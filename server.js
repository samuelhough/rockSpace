
var io			 = require('socket.io'),
	express		 = require('express'),
	MemoryStore	 = express.session.MemoryStore,
	parseCookie	 = require('connect').utils.parseCookie,
	storesession = new MemoryStore(),
	prog		 = express.createServer(),
	rocks		 = require('rockSpace'),
	Db			 = require('mongodb');

prog.configure(function () { 
	prog.set('port', 8000);
	prog.set('address', 'http://localhost:8000/');
	prog.use(express.static(__dirname + '/public')); 
	
});

prog.listen(prog.settings.port);
var sio = io.listen(prog);

var canvas = { width: 700, height: 600 }

var players = [];


var mongodb = require('mongodb');
var server = new mongodb.Server("127.0.0.1", 27017, {});

new mongodb.Db('test', server, {}).open(function (error, client) {
    if (error) throw error;
    
    var collection = new mongodb.Collection(client, 'test_collection');
    

    
    collection.find({}, {limit:10}).toArray(function(err, docs) {
        console.dir(docs);
    });
  
    sio.sockets.on('connection', function (socket) {
    	socket.emit('getPreviousPlayers' , players);
    	
    	socket.on('newPlayer', function(data){	
    		players[players.length] = data;
    		socket.broadcast.emit('newPlayer', data);
    		
            collection.insert({user: 'newUser'}, {safe:true}, function(err, objects) {
                if (err) console.warn(err.message);
                if (err && err.message.indexOf('E11000 ') !== -1) {
                  // this _id was already inserted in the database
                }
            });
            collection.find({}, {limit:10}).toArray(function(err, docs) {
                console.dir(docs);
            });
            
            /*
                search by subfield
                collection.find({"field.subfield": "value"});
                
                special querys $gt $gte $lt $lte $not
                
                collection.find({$exists : {"age": 1}});
                
                skips first 10, and returns 5
                    collection.find({age:40).skip(10).limit(5)
                    - skip does the query and then scans through that many querys - skip is proessor heavy.  
                        has to iterate through the list from the beginning
                        
                .sort() to change the ordering of result set like sql ORDERBY
                    collection.find().sort({ts: -1});
                    
                query everything but return only name and age
                    collection.find({}, {name:1, age:1 });
                    to return everything without a value
                    collection.find({}, {name: 0}); // returns everthing but the name element
                    
                Find documents where "name" = "alice"< and incrememnt ists value for "age" by 1
                    collection.update({name:"Alice"}, {$inc: {"age":1}});
                
                updates with mongo:
                    if the document matching the query is found, apply the modifier
                    if its not foudn, create  the document by applying modifiers to the query,a nd inserting it.
                    will only insert a single document                
                
                // collection is empty
                    collection.update({title}: "lor"}, {"$inc":{view":1}, true);
                    //collection now contains new doc {title: "lor", views: 1}
                
                
                
                Mongo has the option of oing safe writes.  If safe is set to true, the callback is not called unless the server says it went through
                
                collection.insert({x:1}, {safe:true}, function(){
                
                });
                
                
                
                ///////////
                Look into mongoose it allows to make the data calls much simpler
                
                
                Sharding in Mongo
                    MongoS = Sharding Program
                    MongoS goes in between application and database
                
                Replication
                    
                
                MapReduce
                    
                GridFS
                    store large binary blobs - store larger than 16mb - store video / images - files up to 2 gb per doc
                
                MMS
                    MongoMonitoringService - agent that runs on the mongo service and monitors the cluster and sends pings back to mms
                    
                
                Capped Collections
                    collection with a fixed size = push and and shift a doc
                
                
                
                
                
                    
            
            
            */
    		
    	});
    	socket.on('sendShipPosition', function(newPosition){
    		players[newPosition.userName] = newPosition;
    		socket.broadcast.emit('getSPos' , newPosition);
    			
    	});
    	
    	var main = setInterval(function(){
    		socket.emit('getRocks' , rocks.getRocks());
    		
    	}, 40);
    });
});


	
	
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
						 pw:	 playerPass,
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



