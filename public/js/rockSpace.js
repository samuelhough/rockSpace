$(document).ready(function(){
     
    // Initialize
    // Start game
    var init = function(){
        newGame = game();       
    };
    init();
    
    
    var rockImage = new Image();
    rockImage.src = '/img/rock.png';
    
    // Main function for rockSpace
    function game(){
        // Used for receiving and sending all server messages and data
        var socket = io.connect('http://localhost:8000'); 
        
        // Start Button - creates a ship for the player after he enters a username     
        $('#submit').click(function(){
            var userName = $("#userName").val();
            createThisPlayer(userName);
            $(this).hide();
        });
        
        // Canvas Element          
        var canvas = document.getElementById("stage"),
            ctx = canvas.getContext("2d"),
            shipPlayers = {},
            rocks = [];
        
        // Create a ship for the player on this browser
        function createThisPlayer(userName){
            // Create a ship for this browser
            makePlayer(false, { userName: userName });
            // Tell the other players that this browser just connected
            socket.emit('newPlayer' , { userName: userName, x: 40, y: 40, radian: 0 });
        }
        
        function makePlayer(internet, data){
            if(internet){
                var newShip = { 
                    socket: socket, 
                    canvas: canvas, 
                    canvasContext: ctx, 
                    userName: data.userName, 
                    startX: data.x, 
                    startY: data.y, 
                    startRotation: data.r, 
                    isInternet: true 
                };
                shipPlayers[data.userName] = new ship(newShip);
            } else {
                var newShip = {
                    socket: socket, 
                    canvas: canvas, 
                    canvasContext: ctx, 
                    userName: data.userName, 
                    startX: 40, 
                    startY: 40, 
                    startRotation: 0, 
                    isInternet: false
                };
                shipPlayers.thisPlayer = new ship(newShip);
            }

        
        }
        
        
        // Clear the canvas on the stage
        function clearCanvas (){
            ctx.clearRect( 0, 0, canvas.width, canvas.height);
        }
        
        // Render every ship on the stage
        function renderPlayers(){
            for( var key in shipPlayers){
                shipPlayers[key].renderShip();
            }
        }
        function renderRocks(){
            for(var curRock in rocks){
                var renderRock = rocks[curRock];
                var radian = renderRock.r * Math.PI / 180;
                var transx = renderRock.x + 25;
                var transy = renderRock.y + 25;
                ctx.save();
                ctx.setTransform(1,0,0,1,0,0);
                ctx.translate(transx, transy);
                ctx.rotate(radian);
                ctx.translate(-transx,-transy);
                ctx.drawImage(rockImage, renderRock.x, renderRock.y);
                ctx.restore();
            }
        }
        

        
     
        // Main Set interval for the rendering of the stage and movement
        var runProgram = setInterval(function(){
            movePlayer(shipPlayers);
            clearCanvas();
            renderPlayers();
            renderRocks();
        }, 30);
        
        // ---------SOCKET SERVER INTERACTION BELOW------------------ //  
        
        // Loads previous players onto the canvas
        socket.on('getPreviousPlayers', function(playerArray){
            for(var playerNum = 0; playerNum < playerArray.length; playerNum += 1){          
                var data = playerArray[playerNum];
                makePlayer(true, data);
            }
                
        });  
        
        // Loads the ship position for a specific player
        socket.on('getSPos', function(newPosition){
            if(shipPlayers[newPosition.uN]){
                shipPlayers[newPosition.uN].setPosition(newPosition);
            }
                    
        });
        
        // Creates a new ship when a new player joins
        socket.on('newPlayer', function(data){
            console.log('new player joining');
            makePlayer(true, data);
                
        });
        
        socket.on('getRocks', function(newRocks){
            
            rocks = newRocks;
        		
        });

    }
    
    

                                       
    
    
   
   

});  







