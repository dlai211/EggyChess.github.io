function place_piece(board, index, role, size, available_pieces) {
    board[index] = [role, size];
    available_pieces[size]--;
}

function remove_piece(board, index, role, size, available_pieces, previous_state) {
    board[index] = previous_state;
    available_pieces[size]++;
}


function updatePieceCountText(player_pieces, ai_pieces) {
    // Update player piece counts
    document.getElementById('player-small-number').textContent = player_pieces[0];
    document.getElementById('player-medium-number').textContent = player_pieces[1];
    document.getElementById('player-big-number').textContent = player_pieces[2];

    // Update AI piece counts
    document.getElementById('ai-small-number').textContent = ai_pieces[0];
    document.getElementById('ai-medium-number').textContent = ai_pieces[1];
    document.getElementById('ai-big-number').textContent = ai_pieces[2];
}

function can_place_piece(board, index, role, size, available_pieces) {
    if (role != board[index][0] && size > board[index][1] && available_pieces[size] != 0) {
        return true;
    } else {
        return false;
    }
}

function generate_possible_moves(board, role, available_pieces) {
    let possible_moves = [];
    for (let index = 0; index < board.length; index++) 
        for (let size = 0; size < available_pieces.length; size++)
            if (can_place_piece(board, index, role, size, available_pieces)) {
                possible_moves.push([index, size]);
        }
    return possible_moves;
    }

