QUnit.module('Tic-Tac-Toe Logic', hooks => {
    hooks.beforeEach(() => {
        // This will reset the board state before each test
        initTicTacToe();
        // Mock for the updateStatus function which is in main.js and manipulates the DOM
        window.updateStatus = () => {}; 
    });

    QUnit.test('Initial state', assert => {
        assert.deepEqual(tttB, Array(9).fill(null), 'Board should be empty');
        assert.equal(tttT, 'X', 'First turn should be X');
    });

    QUnit.test('Player X can place a mark', assert => {
        handleTTT(0);
        assert.equal(tttB[0], 'X', 'Board at index 0 should be X');
        assert.equal(tttT, 'O', 'Turn should be O');
    });

    QUnit.test('Player O can place a mark', assert => {
        handleTTT(0); // X's turn
        handleTTT(1); // O's turn
        assert.equal(tttB[1], 'O', 'Board at index 1 should be O');
        assert.equal(tttT, 'X', 'Turn should be X');
    });

    QUnit.test('Cannot place a mark on an occupied cell', assert => {
        handleTTT(0);
        handleTTT(0); // Try to place again
        assert.equal(tttB[0], 'X', 'Cell should remain X');
        assert.equal(tttT, 'O', 'Turn should still be O');
    });

    QUnit.test('Check win condition - row', assert => {
        // X O .
        // X X X
        // O . .
        tttB = ['X', 'O', null, 'X', 'X', 'X', 'O', null, null];
        assert.equal(checkTTTWin(), 'X', 'X should win on a row');
    });
    
    QUnit.test('Check win condition - column', assert => {
        // X O O
        // X . .
        // X . .
        tttB = ['X', 'O', 'O', 'X', null, null, 'X', null, null];
        assert.equal(checkTTTWin(), 'X', 'X should win on a column');
    });

    QUnit.test('Check win condition - diagonal', assert => {
        // X O .
        // . X .
        // . . X
        tttB = ['X', 'O', null, null, 'X', null, null, null, 'X'];
        assert.equal(checkTTTWin(), 'X', 'X should win on a diagonal');
    });

    QUnit.test('Check draw condition', assert => {
        // X O X
        // O X X
        // O X O
        tttB = ['X', 'O', 'X', 'O', 'X', 'X', 'O', 'X', 'O'];
        assert.equal(checkTTTWin(), 'draw', 'Game should be a draw');
    });

    QUnit.test('Game stops after a win', assert => {
        // X X X
        // O O .
        // . . .
        tttB = ['X', 'X', 'X', 'O', 'O', null, null, null, null];
        handleTTT(6); // Try to make a move after win
        assert.equal(tttB[6], null, 'Should not be able to make a move after a win');
    });
});
