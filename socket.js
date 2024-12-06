
const { createServer } = require("http");
const { Server } = require("socket.io");
var opponentId;
var socketid;
const httpServer=  createServer();
const io = new Server(httpServer,{
    cors: {
        origin: "*",
        methods: ["*"],
      }
});
let totalPlayers = 0;
let players = {};
let waiting = {
    '10':[],
    '15':[],
    '20':[]
}

let matches = {
    '10':[],
    '15':[],
    '20':[]
}

function fireTotalPlayers() {
    io.emit('total_players',totalPlayers)
}
function fireDisconnect(socket){

    if (socket.id === opponentId) {
        players[socketid].emit("opponentDisconnected");
    }else if(socket.id === socketid){
        players[opponentId].emit("opponentDisconnected");

    }
 removeSocketFromWaitingPeriod(socket);
 console.log(waiting);

 totalPlayers--;
    fireTotalPlayers();

}
function moveMade(array) {
    console.log(array);
    
    if (array[0].color === "w") {
        players[array[2]].emit('move_made',array[0]);
    }else{
        players[array[1]].emit("move_made",array[0])

    }
      
}
function handlePlayRequest(socket,time) {
if (waiting[time].length > 0 ) {

    
    const Opponentid = waiting[time].splice(0,1)[0];
    opponentId  = Opponentid;
   matches[time].push({
     [Opponentid]: socket.id,
   })
   socketid = socket.id
   setupMatch(Opponentid,socket.id)
 
   console.log(matches);
   
  return;
}
if (!waiting[time].includes(socket.id)) {

    waiting[time].push(socket.id);    
}

}

function removeSocketFromWaitingPeriod(socket) {
    const forEachLoop = [10,15,20];
    forEachLoop.forEach(elem => {

        const index = waiting[elem].indexOf(socket.id);
        if (index > -1) {
            waiting[elem].splice(index,1);
            }
        
            
    })
}

function setupMatch(Opponentid,socketid) {
let oppID = ["White",Opponentid,socketid] 
let socid = ["Black",Opponentid,socketid] 
 players[Opponentid].emit("match_made",oppID);
 players[socketid].emit("match_made",socid);
}
function fireConnect(socket) {
    socket.on("want_to_play",(time)=> handlePlayRequest(socket,time));

    totalPlayers++;
    fireTotalPlayers();
}
io.on("connection",(socket) => {
    players[socket.id] = socket;

socket.on("disconnect",() => fireDisconnect(socket))
fireConnect(socket);
socket.on('move_made',array => moveMade(array))
})

const PORT = process.env.PORT || 8000; // Default to 8000 for local testing
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});