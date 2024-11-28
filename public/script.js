
const socket = io();

let player = null; // Player X or O
const status = document.getElementById('game-status');
const cells = document.querySelectorAll('.cell');

// Update player info
socket.on('playerInfo', (data) => {
    if (data) {
        player = data;
        status.textContent = `You are Player ${player}. Waiting for your turn...`;
    } else {
        status.textContent = 'Game full. Spectating.';
    }
});

// Update the board
socket.on('updateBoard', ({ board, currentPlayer }) => {
    cells.forEach((cell, index) => {
        cell.textContent = board[index];
        cell.classList.toggle('taken', board[index] !== null);
    });

    if (board.includes(null)) {
        status.textContent = currentPlayer === player
            ? 'Your turn!'
            : `Player ${currentPlayer}'s turn...`;
    } else {
        status.textContent = 'Game Over!';
    }
});

// Handle cell click
cells.forEach((cell) => {
    cell.addEventListener('click', () => {
        const index = cell.getAttribute('data-index');
        socket.emit('makeMove', { index: parseInt(index) });
    });
});


window.onload = () => {
    const storedName = localStorage.getItem('TTSName') ? localStorage.getItem('TTSName') : 'Unknown'; // Get the stored value
    document.getElementById('user').textContent = storedName;
    document.querySelector('.logo').innerText = storedName.split("")[0]; // Use charAt for simplicity
}
