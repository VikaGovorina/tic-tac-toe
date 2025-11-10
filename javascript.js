
const GameStatus = Object.freeze({
    X_WON: 'X_WON',
    O_WON: 'O_WON',
    DRAW: 'DRAW',
    GOING: 'GOING',
    ALREADY_MARKED: 'ALREADY_MARKED',
    END: 'END',
});

const CellSymbol = Object.freeze({
    EMPTY: -1,
    X: 1,
    O: 0,
});

const Gameboard = (function() {
    const tttNumber = 3;
    let board = new Array(tttNumber).fill().map(() => new Array(tttNumber).fill(CellSymbol.EMPTY));
    
    const getBoard = () => board;
    const clearBoard = () => board = new Array(tttNumber).fill().map(() => new Array(tttNumber).fill(CellSymbol.EMPTY));

    const setPos = (playerSymbol, posI, posJ) => {
        if (board[posI][posJ] === CellSymbol.EMPTY) {
            board[posI][posJ] = playerSymbol;
            return check();
        } 
        return GameStatus.ALREADY_MARKED;
    }

    const checkRow = (row) => {
        if (row.every((val) => val !== CellSymbol.EMPTY && val === row[0])) {
            return row[0] === CellSymbol.X ? GameStatus.X_WON : GameStatus.O_WON;
        }
        return GameStatus.GOING;
    }

    const check = () => {
        for (let i = 0; i < tttNumber; i++) {
            const winner = checkRow(board[i]);
            if (winner !== GameStatus.GOING) {
                return winner;
            }
        }
        for (let i = 0; i < tttNumber; i++) {
            let curCol = [];
            for (let j = 0; j < tttNumber; j++) {
                curCol.push(board[j][i]);
            }
            const winner = checkRow(curCol);
            if (winner !== GameStatus.GOING) {
                return winner;
            }
        }
        let diagL = [];
        for (let i = 0; i < tttNumber; i++) {
            diagL.push(board[i][i]);
        }
        const winner = checkRow(diagL);
        if (winner !== GameStatus.GOING) {
            return winner;
        }  
        
        let diagR = [];
        for (let i = 0; i < tttNumber; i++) {
            diagR.push(board[i][tttNumber - 1 - i]);
        }
        const winner1 = checkRow(diagR);
        if (winner1 !== GameStatus.GOING) {
            return winner1;
        }  

        if (board.every(row => row.every(val => val !== CellSymbol.EMPTY))) {
            return GameStatus.DRAW;
        }
        return GameStatus.GOING;
    }
    return { getBoard, clearBoard, setPos, check, tttNumber };
})();

function createPlayer(name, symbol) {
    return { name, symbol };
};

const GameFlow = (function() {
    let turn = CellSymbol.X;
    let firstPlayer, secondPlayer;

    const getCurPlayer = () => {
        return turn === CellSymbol.X ? firstPlayer : secondPlayer;
    };

    const endGame = () => {
        turn = CellSymbol.EMPTY;
    }

    const getTurn = () => turn;
    const updateTurn = () => {
        turn === CellSymbol.X ? turn = CellSymbol.O : turn = CellSymbol.X;
    };
        
    const makeMove = (playerSymbol, posI, posJ) => {
         const status = Gameboard.setPos(playerSymbol, posI, posJ);
         return status;
    };

    const restartGame = () => {
        Gameboard.clearBoard();
        turn = CellSymbol.X;

        statusMsg.textContent = `New game has started. ${firstPlayer.name}'s turn`;
        BoardInteraction.displayBoard(Gameboard.getBoard());
    };

    const startGame = () => {
        const name1 = document.getElementById('player1').value || "X";
        const name2 = document.getElementById('player2').value || "O";
        firstPlayer = createPlayer(name1, CellSymbol.X);
        secondPlayer = createPlayer(name2, CellSymbol.O);

        restartGame();
    }

    return { makeMove, getTurn, startGame, updateTurn, getCurPlayer, endGame };
})();

const BoardInteraction = (function() {
    
    const displayBoard = (board) => {
        const boardGrid = document.querySelector('.gameboard');
        boardGrid.innerHTML = '';

        for (let i = 0; i < Gameboard.tttNumber; i++) {
            for (let j = 0; j < Gameboard.tttNumber; j++) {
                const cell = document.createElement('button');
                cell.className = 'cell-btn';
                cell.textContent = board[i][j] === CellSymbol.X ? "X" : (CellSymbol.O === board[i][j] ? "O" : "");
                cell.addEventListener('click', () => {
                    if (GameFlow.getTurn() == CellSymbol.EMPTY) {
                        return;
                    }
                    const status = GameFlow.makeMove(GameFlow.getTurn(), i, j);
                    let msg = "";
                    if (status !== GameStatus.ALREADY_MARKED) {
                        displayBoard(board);
                    }
                    switch(status) {
                        case GameStatus.X_WON:
                        case GameStatus.O_WON:
                            msg = `${GameFlow.getCurPlayer().name} won`;
                            GameFlow.endGame();
                            break;
                        case GameStatus.GOING:
                            GameFlow.updateTurn();
                            msg = `${GameFlow.getCurPlayer().name} turn`;
                            break;
                        case GameStatus.DRAW:
                            msg = `It's a draw!`;
                            GameFlow.endGame();
                            break;
                        case GameStatus.ALREADY_MARKED:
                            msg = `Cell already marked!`;
                            break;
                        default:
                            msg = `New game has started. ${firstPlayer.name}'s turn`;
                    }
                    statusMsg.textContent = msg;
                });
                boardGrid.appendChild(cell);
            }
        }
    }
    return { displayBoard };
})();

const resetBtn = document.querySelector('.reset');
const statusMsg = document.querySelector('.status');

resetBtn.addEventListener('click', () => {
    GameFlow.startGame();
});

GameFlow.startGame();

