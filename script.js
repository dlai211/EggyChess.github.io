document.addEventListener('DOMContentLoaded', () => {
    const cells = document.querySelectorAll('.cell');
    const playerPieces = document.querySelectorAll('.player');
    const aiPieces = document.querySelectorAll('.ai');
    // const playerText = document.getElementById('playerText');
    const restartButton = document.getElementById('restartButton');
    const winningMessage = document.getElementById('winningMessage');
    const winningMessageText = document.querySelector('[data-winning-message-text]');
    
    let currentPlayer = 'player';
    const board = new Array(9).fill(0).map(() => [-1, -1]);
    let game_over = false;
    let player_pieces = [3, 3, 2]; // [Small, Medium, Large] for player
    let ai_pieces = [3, 3, 2]; // [Small, Medium, Large] for AI

    
    // Piece size value mapping
    const sizeValue = {
        'big': 2,
        'medium': 1,
        'small': 0,
        '': -1
    };

    const roleValue = {
        'player': 1,
        'ai': 2,
        '': -1
    };

    const reversedSizeValue = Object.fromEntries(
        Object.entries(sizeValue).map(([key, value]) => [value, key])
    )

    const reversedRoleValue = Object.fromEntries(
        Object.entries(roleValue).map(([key, value]) => [value, key])
    )

    updateDraggableState();
    
    function handleDragStart(event) {
        event.dataTransfer.setData('text/plain', event.target.classList);
    }
    
    function handleDrop(event) {
        event.preventDefault();
        const cell = event.target;
        const pieceClass = event.dataTransfer.getData('text/plain');
        // const cellSize = cell.getAttribute('data-size');
        // const cellRole = cell.getAttribute('data-role');
        const [role, size] = pieceClass.split(' ');
        let BestMove = false;
        let index_tmp, size_tmp;
        const index = Array.from(cells).indexOf(cell);
    
        // Ensure that a piece is only placed in an empty or "eatable" cell
        if (can_place_piece(board, index, roleValue[role], sizeValue[size], player_pieces)) {

            // Update the board array
            place_piece(board, index, roleValue[role], sizeValue[size], player_pieces);
            console.log('check win:', checkWin(role));
            console.log('currentRole:', reversedRoleValue[board[index][0]]);
            console.log('currentSize:', reversedSizeValue[board[index][1]]);
            console.log('available pieces:', player_pieces)

            // Place the new piece 
            // comment: cells[index] === cell;
            cells[index].setAttribute('data-role', role);
            cells[index].setAttribute('data-size', size);
    
            updatePieceCountText(player_pieces, ai_pieces);

            // Check for a win condition
            if (checkWin('player')) {
                // setWinningMessage('player');
                game_over = true;
                playerText.textContent = `Player Wins!`;
            } else {
                // Switch turns
                currentPlayer = currentPlayer === 'player' ? 'ai' : 'player';
                console.log('currentplayer after:', currentPlayer);
                [BestMove, move]= aiMove(); // Call AI move
                [index_tmp, size_tmp] = [move[0], move[1]];
                console.log("Calling: Best move found -> BestMove:", BestMove, " index:", index_tmp, "size:", size_tmp);

                if (BestMove) {
                    cells[index_tmp].setAttribute('data-role', 'ai');
                    cells[index_tmp].setAttribute('data-size', reversedSizeValue[size_tmp]);
                    updatePieceCountText(player_pieces, ai_pieces);
                    console.log("Best move found (problem) -> index", index_tmp, "size", size_tmp);

                    if (checkWin('ai')) {
                        game_over = true;
                        console.log('AI wins');
                        // setWinningMessage('ai');
                        playerText.textContent = `AI Wins!`;
                    }

                }
                currentPlayer = currentPlayer === 'player' ? 'ai' : 'player';

                if (!game_over & is_board_full) {
                    game_over = True;
                    console.log('Board is full');
                }
            }
        }
    }
    

    function handleDragOver(event) {
        event.preventDefault();
    }

    //   function isBoardFull(board) {
    //     return board.every(cell => cell.role !== '');
    // }

    function is_board_full(board) {
        const hasEmptyCell = board.some(row => row[0] === -1);
        const playerCount = board.filter(row => row[1] === 1).length;
        const aiCount = board.filter(row => row[1] === 2).length;
        
        if (hasEmptyCell) {
          return false;
        }
        
        if (playerCount > aiCount) {
          return -Infinity; // Player wins
        } else if (playerCount < aiCount) {
          return Infinity; // AI wins
        }
        return 0; // It's a draw
    }

    function checkWin(role) {
        const winConditions = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];

        const cellElements = document.querySelectorAll('.cell'); // Select all cells on the board
        return winConditions.some(combination => {
            return combination.every(index => {
                // Check if the cell at 'index' has the correct 'data-role' attribute value
                return cellElements[index].getAttribute('data-role') === role;
            });
        });
    }



    function heuristic_evaluation(board) {
        let player_score = 0;
        let ai_score = 0;
    
        for (let index = 0; index < board.length; index++) {
            if (board[index][0] === 1) {
                player_score += (board[index][1] + 1);
            } else if (board[index][0] === 2) {
                ai_score += (board[index][1] + 1);
            }
        }

        return ai_score - player_score;
    }
    

    function minimax(board, depth, alpha, beta, is_maximizing, player_available_pieces, ai_available_pieces, max_depth = 5) {
        let best_score, moves;
        if (checkWin('ai')) {
            return Infinity; 
        } else if (checkWin('player')) {
            return -Infinity; 
        } else if (is_board_full(board)) {
            result = is_board_full(board);
            if (!result) { return 0; } else { return result; }
        } 
        
        if (depth === max_depth) {
            return heuristic_evaluation(board); 
        }

        if (is_maximizing) {
            best_score = -Infinity;
            moves = generate_possible_moves(board, 2, ai_available_pieces);
            for (const [index, size] of moves) {
                tmp = board[index]; 
                place_piece(board, index, 2, size, ai_available_pieces);
                score = minimax(board, depth + 1, alpha, beta, false, player_available_pieces, ai_available_pieces, max_depth);
                remove_piece(board, index, 2, size, ai_available_pieces, tmp);
                best_score = Math.max(best_score, score);
                alpha = Math.max(alpha, score);
                if (beta <= alpha) {
                    break;
                }
            }   return best_score;
        }   else {
            best_score = Infinity;
            moves = generate_possible_moves(board, 1, player_available_pieces);
            for (const [index, size] of moves) {
                tmp = board[index]; 
                place_piece(board, index, 1, size, player_available_pieces);
                score = minimax(board, depth + 1, alpha, beta, true, player_available_pieces, ai_available_pieces, max_depth);
                remove_piece(board, index, 1, size, player_available_pieces, tmp);
                best_score = Math.min(best_score, score);
                beta = Math.min(beta, score);
                if (beta <= alpha) {
                    break;
                }
            }
            return best_score;
        }
    
    }
    
    

    function aiMove() {
        let best_score = -Infinity;
        let move = [-1, -1];
        let newBoard = [...board];
        let moves = generate_possible_moves(newBoard, 2, ai_pieces);
        console.log('ai move problem:', move, newBoard, moves);

        for (const [index, size] of moves) {
            tmp = board[index]; // previous state
            place_piece(newBoard, index, 2, size, ai_pieces);
            let score = minimax(newBoard, 0, -Infinity, Infinity, false, player_pieces, ai_pieces);
            remove_piece(newBoard, index, 2, size, ai_pieces, tmp);
            console.log("evaluating move:", index, size, score);
            if (score > best_score) {
                best_score = score;
                move = [index, size];
            }
        }

        if (move != [-1, -1]) {
            console.log("Best move found -> index", move[0], "size", move[1], "Best Score", best_score);
            place_piece(board, move[0], 2, move[1], ai_pieces);
            console.log("AI pieces after move: ", board);
            return [true, move]; // return true if a move was made, index, size
        }
        return [false, move];
    }


    function setWinningMessage(role) {
        winningMessageText.textContent = `${role === 'player' ? 'Player' : 'AI'} Wins!`;
        winningMessage.style.display = 'block';
    }

    function restartGame() {
        board.fill('');
        cells.forEach(cell => {
            cell.innerHTML = '';
            cell.removeAttribute('data-role');
            cell.removeAttribute('data-size');
        });

        // Reset piece counts
        document.getElementById('player-big-number').textContent = '2';  // Assuming 2 big pieces
        document.getElementById('player-medium-number').textContent = '3';  // Assuming 3 medium pieces
        document.getElementById('player-small-number').textContent = '3';  // Assuming 3 small pieces

        // Reset the AI piece counts similarly
        document.getElementById('ai-big-number').textContent = '2';
        document.getElementById('ai-medium-number').textContent = '3';
        document.getElementById('ai-small-number').textContent = '3';

        // Re-enable dragging for all pieces
        playerPieces.forEach(piece => {
            piece.setAttribute('draggable', true);
            piece.style.opacity = '1'; // Reset opacity to indicate it's draggable
            piece.addEventListener('dragstart', handleDragStart); // Reattach the event listener
        });

        aiPieces.forEach(piece => {
            piece.setAttribute('draggable', false);
            piece.style.opacity = '1';
        });


        currentPlayer = 'player'; 
        // playerText.textContent = "Player's Turn";
        winningMessage.style.display = 'none';
        win = false;
    }

    function updateDraggableState() {
        // Disable dragging for all pieces first
        playerPieces.forEach(piece => {
            piece.setAttribute('draggable', false);
            piece.removeEventListener('dragstart', handleDragStart);
        });

        aiPieces.forEach(piece => {
            piece.setAttribute('draggable', false);
            piece.removeEventListener('dragstart', handleDragStart);
        });

        // Helper function to check if a piece can still be dragged
        function canDragPiece(role, size) {
            const pieceCountElement = document.getElementById(`${role}-${size}-number`);
            const count = parseInt(pieceCountElement.textContent);
            return count > 0;
        }

        // Enable dragging for the current player's pieces, but only if their count is greater than 0
        if (currentPlayer === 'player') {
            playerPieces.forEach(piece => {
                const size = piece.classList.contains('big') ? 'big' :
                            piece.classList.contains('medium') ? 'medium' : 'small';

                if (canDragPiece('player', size)) {
                    piece.setAttribute('draggable', true);
                    piece.addEventListener('dragstart', handleDragStart);
                }
            });
        } 
    }


  // Event Listeners for the board and restart button
    cells.forEach(cell => {
        cell.addEventListener('dragover', handleDragOver);
        cell.addEventListener('drop', handleDrop);
    });

    restartButton.addEventListener('click', restartGame);


});