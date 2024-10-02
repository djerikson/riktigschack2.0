const chessboard = document.getElementById('chessboard');

// Unicode symbols for the chess pieces
const pieces = {
    'white': {
        'king': '&#9812;',
        'queen': '&#9813;',
        'rook': '&#9814;',
        'bishop': '&#9815;',
        'knight': '&#9816;',
        'pawn': '&#9817;'
    },
    'black': {
        'king': '&#9818;',
        'queen': '&#9819;',
        'rook': '&#9820;',
        'bishop': '&#9821;',
        'knight': '&#9822;',
        'pawn': '&#9823;'
    }
};

// Initial board setup
const initialBoard = [
    ['black.rook', 'black.knight', 'black.bishop', 'black.queen', 'black.king', 'black.bishop', 'black.knight', 'black.rook'],
    ['black.pawn', 'black.pawn', 'black.pawn', 'black.pawn', 'black.pawn', 'black.pawn', 'black.pawn', 'black.pawn'],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['white.pawn', 'white.pawn', 'white.pawn', 'white.pawn', 'white.pawn', 'white.pawn', 'white.pawn', 'white.pawn'],
    ['white.rook', 'white.knight', 'white.bishop', 'white.queen', 'white.king', 'white.bishop', 'white.knight', 'white.rook']
];

// Variable to store the element being dragged
let draggedElement = null;
let sourceSquare = null;
let currentTurn = 'white'; // Keep track of whose turn it is

// Create chessboard
function createChessboard() {
    chessboard.innerHTML = ''; // Clear previous board if any
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.classList.add('square');

            // Assign colors to squares
            if ((row + col) % 2 === 0) {
                square.classList.add('white');
            } else {
                square.classList.add('black');
            }

            // Add chess pieces to the board based on initial setup
            const pieceInfo = initialBoard[row][col];
            if (pieceInfo) {
                const [color, piece] = pieceInfo.split('.');
                const pieceElement = document.createElement('span');
                pieceElement.innerHTML = pieces[color][piece];
                pieceElement.classList.add('piece');
                pieceElement.setAttribute('draggable', 'true');
                pieceElement.setAttribute('data-piece', pieceInfo);
                square.appendChild(pieceElement);
            }

            // Add event listeners for drag and drop
            square.addEventListener('dragover', (e) => e.preventDefault());
            square.addEventListener('drop', handleDrop);

            chessboard.appendChild(square);
        }
    }
}

// Handle drag start event
document.addEventListener('dragstart', (e) => {
    if (e.target.classList.contains('piece')) {
        const pieceInfo = e.target.getAttribute('data-piece');
        const pieceColor = pieceInfo.split('.')[0];

        // Only allow pieces of the current turn's color to be moved
        if (pieceColor === currentTurn) {
            draggedElement = e.target;
            sourceSquare = e.target.parentNode; // Store the source square
            e.dataTransfer.setData('text/plain', ''); // Required for Firefox
        } else {
            e.preventDefault(); // Prevent dragging if it's not this player's turn
        }
    }
});

// Handle drop event
function handleDrop(e) {
    e.preventDefault();
    const targetSquare = e.target.closest('.square');

    // Ensure a valid target and that it's not the same square as the source
    if (targetSquare && sourceSquare !== targetSquare) {
        const pieceInfo = draggedElement.getAttribute('data-piece');
        const pieceType = pieceInfo.split('.')[1];
        const pieceColor = pieceInfo.split('.')[0];

        // Check if the move is valid based on piece type and the rules
        const validMove = validateMove(pieceType, sourceSquare, targetSquare, pieceColor);

        // Ensure target square is empty or contains an enemy piece
        const targetPiece = targetSquare.querySelector('.piece');
        const targetIsEnemy = targetPiece && targetPiece.getAttribute('data-piece').split('.')[0] !== currentTurn;

        if (validMove && (!targetPiece || targetIsEnemy)) {
            // Remove the piece from source square and move it to the target square
            targetSquare.innerHTML = '';
            targetSquare.appendChild(draggedElement);
            sourceSquare.innerHTML = '';

            // Switch turns after a successful move
            currentTurn = currentTurn === 'white' ? 'black' : 'white';
        }
    }
}

// Function to validate moves based on piece type
function validateMove(pieceType, source, target, pieceColor) {
    const sourceCoords = getSquareCoordinates(source);
    const targetCoords = getSquareCoordinates(target);

    switch (pieceType) {
        case 'rook':
            return validateRookMove(sourceCoords, targetCoords);
        case 'bishop':
            return validateBishopMove(sourceCoords, targetCoords);
        case 'queen':
            return validateQueenMove(sourceCoords, targetCoords);
        case 'knight':
            return validateKnightMove(sourceCoords, targetCoords);
        case 'king':
            return validateKingMove(sourceCoords, targetCoords);
        case 'pawn':
            return validatePawnMove(sourceCoords, targetCoords, pieceColor);
        default:
            return false;
    }
}

// Get coordinates (row and column) of a square
function getSquareCoordinates(square) {
    const squares = Array.from(chessboard.children);
    const index = squares.indexOf(square);
    const row = Math.floor(index / 8);
    const col = index % 8;
    return { row, col };
}

// Validate rook movement (horizontal or vertical)
function validateRookMove(src, tgt) {
    return src.row === tgt.row || src.col === tgt.col;
}

// Validate bishop movement (diagonal)
function validateBishopMove(src, tgt) {
    return Math.abs(src.row - tgt.row) === Math.abs(src.col - tgt.col);
}

// Validate queen movement (combination of rook and bishop)
function validateQueenMove(src, tgt) {
    return validateRookMove(src, tgt) || validateBishopMove(src, tgt);
}

// Validate knight movement (L-shape)
function validateKnightMove(src, tgt) {
    return (Math.abs(src.row - tgt.row) === 2 && Math.abs(src.col - tgt.col) === 1) ||
           (Math.abs(src.row - tgt.row) === 1 && Math.abs(src.col - tgt.col) === 2);
}

// Validate king movement (one square in any direction)
function validateKingMove(src, tgt) {
    return Math.abs(src.row - tgt.row) <= 1 && Math.abs(src.col - tgt.col) <= 1;
}

// Validate pawn movement (forward movement, with special rules for starting move)
function validatePawnMove(src, tgt, color) {
    const direction = color === 'white' ? -1 : 1;
    const startRow = color === 'white' ? 6 : 1;

    // Move one square forward
    if (tgt.col === src.col && tgt.row === src.row + direction && !isSquareOccupied(tgt)) {
        return true;
    }

    // Move two squares forward from starting position
    if (tgt.col === src.col && src.row === startRow && tgt.row === src.row + 2 * direction && !isSquareOccupied(tgt)) {
        return true;
    }

    // Capture diagonally
    if (Math.abs(tgt.col - src.col) === 1 && tgt.row === src.row + direction && isSquareOccupiedByOpponent(tgt, color)) {
        return true;
    }

    return false;
}

// Check if the square is occupied
function isSquareOccupied(coords) {
    const square = chessboard.children[coords.row * 8 + coords.col];
    return square.querySelector('.piece') !== null;
}

// Check if the square is occupied by an opponent
function isSquareOccupiedByOpponent(coords, color) {
    const square = chessboard.children[coords.row * 8 + coords.col];
    const piece = square.querySelector('.piece');
    return piece && piece.getAttribute('data-piece').split('.')[0] !== color;
}

// Initialize the chessboard
createChessboard();
