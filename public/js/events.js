    // Key bindings for controlling the ship
    var global_KeyBinds = {
        keyCode_left: 37,
        keyCode_right: 39,
        keyCode_up: 38,
        keyCode_down: 40,
        keyCode_fire: 32
    };
    // Holds a true value corresponding to a key value while it is pressed down
    var global_KeyHeld = {}; 
        
    // 
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
    
    // Check if a key is currently being pressed, if so, call the appropriate function
    function movePlayer(shipPlayers){
            if(shipPlayers.thisPlayer){
                if(global_KeyHeld[global_KeyBinds.keyCode_up] === true){
                    shipPlayers.thisPlayer.thrustShip();
                }
                if(global_KeyHeld[global_KeyBinds.keyCode_left] === true){
                    shipPlayers.thisPlayer.turnShip('left');
                }
                if(global_KeyHeld[global_KeyBinds.keyCode_right] === true){
                    shipPlayers.thisPlayer.turnShip('right');            
                }
            }    
        }