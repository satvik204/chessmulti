
var board = null;
var game = new Chess();
var $status = $('#status');
var $fen = $('#fen');
var $pgn = $('#pgn');
let player = "";
let Opponentid = "";
let socketid = "";
let MovePlayed = false;
const gameEnd = new Audio('./asset/game-end.webm');
const moveCheck = new Audio('./asset/move-check.mp3');
const moveAudio = new Audio('./asset/move-self.mp3');
var timer1 , timer2;
let no = 1;
let matchMade =false;
let time = 0;

    

function startTimer(seconds, container, oncomplete) {
    var startTime, timer, obj, ms = seconds * 1000,
        display = document.querySelector(".white-timer");
    obj = {};
    obj.resume = function () {
        startTime = new Date().getTime();
        timer = setInterval(obj.step, 250); // adjust this number to affect granularity
        // lower numbers are more accurate, but more CPU-expensive
    };
    obj.pause = function () {
        ms = obj.step();
        clearInterval(timer);
    };
    obj.step = function () {
        var now = Math.max(0, ms - (new Date().getTime() - startTime)),
            m = Math.floor(now / 60000), s = Math.floor(now / 1000) % 60;
        s = (s < 10 ? "0" : "") + s;
        display.innerHTML = m + ":" + s;
        if (now == 0) {
            clearInterval(timer);
            obj.resume = function () { };
            if (oncomplete) oncomplete();
        }
        return now;
    };
    obj.resume();
    return obj;
}

function startTimer2(seconds, container, oncomplete) {
    var startTime, timer, obj, ms = seconds * 1000,
        display = document.querySelector(container);
    obj = {};
    obj.resume = function () {
        startTime = new Date().getTime();
        timer = setInterval(obj.step, 250); // adjust this number to affect granularity
        // lower numbers are more accurate, but more CPU-expensive
    };
    obj.pause = function () {
        ms = obj.step();
        clearInterval(timer);
    };
    obj.step = function () {
        var now = Math.max(0, ms - (new Date().getTime() - startTime)),
            m = Math.floor(now / 60000), s = Math.floor(now / 1000) % 60;
        s = (s < 10 ? "0" : "") + s;
        display.innerHTML = m + ":" + s;
        if (now == 0) {
            clearInterval(timer);
            obj.resume = function () { };
            if (oncomplete) oncomplete();
        }
        return now;
    };
    obj.resume();
    return obj;
}



function onDragStart(source, piece, position, orientation) {
    if (game.game_over()) return false;

    if ((game.turn() === 'w' && piece.search(/^b/) !== -1) || (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
        return false;
    }

    // Prevent dragging if it is not the player's turn
    if ((player === 'White' && game.turn() !== 'w') ||
        (player === 'Black' && game.turn() !== 'b')) {
        return false;
    }

}

function onDrop(source, target) {

    if ((player === 'White' && game.turn() === 'w') ||
        (player === 'Black' && game.turn() === 'b')) {

        var move = game.move({
            from: source,
            to: target,
            promotion: 'q' // Always promote to a queen for simplicity
        });
        MovePlayed = true;
        // If the move is invalid, return the piece to its original position
        if (move === null) return 'snapback';

        // Emit the move to the server if valid
        let array = [move, Opponentid, socketid, player];
        socket.emit('move_made', array);

        // Update the board and game status
        updateStatus();
    } else {
        // Snapback if it's not the player's turn
        return 'snapback';
    }
}



function onSnapEnd() {
    board.position(game.fen())
}

function updateStatus() {
    var status = '';
    var moveColor = game.turn() === 'w' ? "White" : "Black";

    console.log(`Current turn: ${game.turn()}`); // Log the current turn ('w' or 'b')

    if (game.in_checkmate()) {
        gameEnd.play();
        const winner = game.turn() === 'b' ? "White" : "Black";
        const winnerText = `Game Over! ${winner} won! `;
        document.querySelector(".endgame").style.display = "block";
        document.getElementById("name").innerHTML = winner === player ? "You Win!🎉" : "You Lose!😑";
        document.getElementById("move").innerHTML = winnerText;
        status = `Game Over, ${moveColor} is in checkmate.`;
    } else if (game.in_draw()) {
        gameEnd.play();
        document.querySelector(".endgame").style.display = "block";
        document.getElementById("name").innerHTML = "Game Draw!😑";
        document.getElementById("move").innerHTML = "Game Over! Drawn!";
        status = "Game over, drawn position.";
    } else {
        status = `${moveColor} to move`;
        if (game.in_check()) {
            moveCheck.play();
            status += `, ${moveColor} is in check.`;
            if (player === moveColor) {
                document.getElementById("move").innerHTML = "Check!";
            }
        }

        
            if (game.turn() === 'w') {
                console.log("White's turn.");
                if (player === 'White') {
                    document.getElementById("move").innerHTML = "Your Move!(White)";
                } else {
                    document.getElementById("move").innerHTML = "Opponent's Move!(White)";
                }
            } else if (game.turn() === 'b') {
                console.log("Black's turn.");
                if (player === 'Black') {
                    document.getElementById("move").innerHTML = "Your Move!(Black)";
                } else {
                    document.getElementById("move").innerHTML = "Opponent's Move!(Black)";
                }
            }
        }            

if (matchMade) {
    

        if (game.turn() === 'b') {
            if (no === 1) {
                console.log("Black Timer started");
                timer1.pause();
        timer2 = startTimer2(Number(time) * 60, ".black-timer", function () { 
            const winnerText = `Game Over! White won by time! `;
            document.querySelector(".endgame").style.display = "block";
            document.getElementById("name").innerHTML = player === 'White' ? "You Win by Time!🎉" : "You Lose by Time!😑";
            document.getElementById("move").innerHTML = winnerText; });
                no = 2;
            }else{
                timer2.resume();
            }
        }else{
            timer2.pause();
            timer1.resume();
        }
    }
        // Log current timer states for debugging
    console.log(`Timer1 (White): ${timer1}`);
    console.log(`Timer2 (Black): ${timer2}`);

    $status.html(status);
    $fen.html(game.fen());
    $pgn.html(game.pgn());
}


var config = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd
}

board = Chessboard('board1', config)

updateStatus()
function handleButtonClick(event) {
    time = event.target.attributes[0].nodeValue;
    socket.emit('want_to_play', time);
    document.getElementById("main_elem").style.display = "none";
    document.getElementById("waitText").style.display = "block";
}


document.addEventListener('DOMContentLoaded', function () {
    const buttons = document.querySelectorAll('.timer-button');
    buttons.forEach(element => {
        element.onclick = (function (event) { handleButtonClick(event) });
    });
})

const socket = io('https://chessmulti.onrender.com');
console.log(socket)

socket.on('total_players', (totalPlayers) => {
    console.log(totalPlayers);
    document.getElementById('total_player').innerHTML = "Total Players : " + totalPlayers;

});
socket.on('match_made', (ids) => {
    document.getElementById("main_elem").style.display = "flex";
    document.getElementById("waitText").style.display = "none";
    document.querySelector(".buttons").style.display = "none";

    if (ids[0] === 'White') {
        // White player setup
        document.querySelector(".right").style.display = 'block';
        document.getElementById("move").innerHTML = 'Your Move(White)';

        // White uses the bottom timer (black-timer)
        document.querySelector(".bottom").classList.add("white-timer");
        document.querySelector(".top").classList.add("black-timer");

        // Start timer for White on the bottom (black-timer area)
    } else {
        // Black player setup
        board.flip();

        // Black uses the bottom timer (black-timer)
        document.querySelector(".bottom").classList.add("black-timer");
        document.querySelector(".top").classList.add("white-timer");
        document.querySelector(".right").style.display = 'block';
        document.getElementById("move").innerHTML = "Opponent's Move(White)";

        // Start timer for Black on the bottom (black-timer area)
     // Ensure proper initialization
    }

    player = ids[0];
    Opponentid = ids[1];
    socketid = ids[2];
    MovePlayed = true;
    matchMade = true;
    timer1 = startTimer(Number(time) * 60, ".white-timer", function () {    const winnerText = `Game Over! Black won by time! `;
        document.querySelector(".endgame").style.display = "block";
        document.getElementById("name").innerHTML = player === 'Black' ? "You Win by Time!🎉" : "You Lose by Time!😑";
        document.getElementById("move").innerHTML = winnerText; });
     document.querySelector('.black-timer').innerHTML = `${time}:00`;
});


socket.on('move_made', (moves) => {
    console.log(moves);

    var move = game.move(moves)
    board.position(game.fen())
    updateStatus();
})


socket.on("opponentDisconnected",() => {
    alert("Opponent Disconnected. Room closed.");
    location.reload();
})