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
 
 }