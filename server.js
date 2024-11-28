const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let players = {}; // Keep track of players
let board = Array(9).fill(null); // Empty board
let currentPlayer = 'X'; // X starts the game

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Assign X or O to the player
    if (Object.keys(players).length < 2) {
        players[socket.id] = Object.keys(players).length === 0 ? 'X' : 'O';
        socket.emit('playerInfo', players[socket.id]);
    } else {
        socket.emit('playerInfo', null);
    }

    // Handle move
    socket.on('makeMove', (data) => {
        if (players[socket.id] === currentPlayer && board[data.index] === null) {
            board[data.index] = currentPlayer;
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            io.emit('updateBoard', { board, currentPlayer });
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        delete players[socket.id];
        if (Object.keys(players).length === 0) {
            board = Array(9).fill(null); // Reset board
            currentPlayer = 'X'; // Reset to X
        }
    });
});

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
