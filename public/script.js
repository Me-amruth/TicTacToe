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
        cells.forEach(cell => cell.style.pointerEvents = 'none'); // Disable cell clicks if game is full
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
        // You can improve this by checking for win conditions
        status.textContent = 'Game Over!';
    }
});

// Handle cell click
cells.forEach((cell) => {
    cell.addEventListener('click', () => {
        // Disable clicks if the game is not your turn
        if (!player || cell.classList.contains('taken') || status.textContent.includes('Game Over')) {
            return;
        }

        const index = parseInt(cell.getAttribute('data-index'));
        socket.emit('makeMove', { index }); // Send the move to the server
    });
});

window.onload = () => {
    const storedName = localStorage.getItem('TTSName') ? localStorage.getItem('TTSName') : 'Unknown'; // Get the stored value
    document.getElementById('user').textContent = storedName;
    document.querySelector('.logo').innerText = storedName.split("")[0]; // Use charAt for simplicity
};
