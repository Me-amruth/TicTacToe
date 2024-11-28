const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public')); // Serve static files from the "public" folder

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
        // Notify the player that the game is full
        socket.emit('gameFull', 'The game is already full. Please try again later.');
        socket.disconnect(); // Disconnect the player since the game is full
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
            io.emit('gameReset', 'The game has been reset. No players are connected.');
        }
    });
});

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
