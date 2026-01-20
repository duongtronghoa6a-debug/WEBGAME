import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Save, Lightbulb, Play, Pause } from 'lucide-react';
import api from '../../services/api';
import GameController from '../common/GameController';
import './CaroGame.css';

// AI Levels
const AI_LEVELS = {
    easy: { name: 'Dễ', depth: 1 },
    medium: { name: 'Trung bình', depth: 2 },
    hard: { name: 'Khó', depth: 3 }
};

const CaroGame = () => {
    const { gameId } = useParams();
    const navigate = useNavigate();

    // Game config
    const [boardSize, setBoardSize] = useState({ rows: 15, cols: 15 });
    const [winCondition, setWinCondition] = useState(5);

    // Cursor for 5-button controller
    const [cursor, setCursor] = useState({ row: 7, col: 7 });

    // Game state
    const [board, setBoard] = useState([]);
    const [currentPlayer, setCurrentPlayer] = useState(1); // 1 = X (player), 2 = O (AI)
    const [winner, setWinner] = useState(null);
    const [winningCells, setWinningCells] = useState([]);
    const [gameOver, setGameOver] = useState(false);
    const [aiLevel, setAiLevel] = useState('medium');
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [score, setScore] = useState(0);
    const [timeSpent, setTimeSpent] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [hint, setHint] = useState(null);
    const [gameName, setGameName] = useState('Caro Hàng 5');

    // Game config based on gameId
    useEffect(() => {
        const id = parseInt(gameId);
        switch (id) {
            case 1: // Caro Hàng 5
                setBoardSize({ rows: 15, cols: 15 });
                setWinCondition(5);
                setGameName('🎯 Caro Hàng 5');
                break;
            case 2: // Caro Hàng 4
                setBoardSize({ rows: 10, cols: 10 });
                setWinCondition(4);
                setGameName('🎯 Caro Hàng 4');
                break;
            case 3: // Tic-Tac-Toe
                setBoardSize({ rows: 3, cols: 3 });
                setWinCondition(3);
                setGameName('⭕ Tic-Tac-Toe');
                break;
            default:
                setBoardSize({ rows: 15, cols: 15 });
                setWinCondition(5);
                setGameName('🎯 Caro Hàng 5');
        }
    }, [gameId]);

    // Initialize board
    useEffect(() => {
        initializeGame();
    }, [boardSize]);

    // Timer
    useEffect(() => {
        let interval;
        if (isPlaying && !gameOver) {
            interval = setInterval(() => {
                setTimeSpent(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, gameOver]);

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (gameOver || isAiThinking || currentPlayer !== 1) return;

            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    setCursor(prev => ({ ...prev, col: Math.max(0, prev.col - 1) }));
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    setCursor(prev => ({ ...prev, col: Math.min(boardSize.cols - 1, prev.col + 1) }));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setCursor(prev => ({ ...prev, row: Math.max(0, prev.row - 1) }));
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    setCursor(prev => ({ ...prev, row: Math.min(boardSize.rows - 1, prev.row + 1) }));
                    break;
                case 'Enter':
                    e.preventDefault();
                    handleCellClick(cursor.row, cursor.col);
                    break;
                case 'Escape':
                    navigate('/games');
                    break;
                case 'h':
                case 'H':
                    showHint();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [cursor, gameOver, isAiThinking, currentPlayer, boardSize]);

    // GameController handlers
    const handleLeft = () => setCursor(prev => ({ ...prev, col: Math.max(0, prev.col - 1) }));
    const handleRight = () => setCursor(prev => ({ ...prev, col: Math.min(boardSize.cols - 1, prev.col + 1) }));
    const handleEnter = () => handleCellClick(cursor.row, cursor.col);
    const handleBack = () => navigate('/games');

    const initializeGame = () => {
        const newBoard = Array(boardSize.rows).fill(null).map(() =>
            Array(boardSize.cols).fill(0)
        );
        setBoard(newBoard);
        setCurrentPlayer(1);
        setWinner(null);
        setWinningCells([]);
        setGameOver(false);
        setScore(0);
        setTimeSpent(0);
        setIsPlaying(true);
        setHint(null);
        setCursor({ row: Math.floor(boardSize.rows / 2), col: Math.floor(boardSize.cols / 2) });
    };

    // Check winner
    const checkWinner = useCallback((board, row, col, player) => {
        const directions = [
            [0, 1],   // horizontal
            [1, 0],   // vertical
            [1, 1],   // diagonal
            [1, -1]   // anti-diagonal
        ];

        for (const [dr, dc] of directions) {
            let count = 1;
            const cells = [[row, col]];

            // Check positive direction
            for (let i = 1; i < winCondition; i++) {
                const r = row + dr * i;
                const c = col + dc * i;
                if (r >= 0 && r < boardSize.rows && c >= 0 && c < boardSize.cols && board[r][c] === player) {
                    count++;
                    cells.push([r, c]);
                } else break;
            }

            // Check negative direction
            for (let i = 1; i < winCondition; i++) {
                const r = row - dr * i;
                const c = col - dc * i;
                if (r >= 0 && r < boardSize.rows && c >= 0 && c < boardSize.cols && board[r][c] === player) {
                    count++;
                    cells.push([r, c]);
                } else break;
            }

            if (count >= winCondition) {
                return cells;
            }
        }
        return null;
    }, [boardSize, winCondition]);

    // AI Move
    const makeAiMove = useCallback((currentBoard) => {
        setIsAiThinking(true);

        setTimeout(() => {
            const move = findBestMove(currentBoard, 2, AI_LEVELS[aiLevel].depth);
            if (move) {
                const newBoard = currentBoard.map(row => [...row]);
                newBoard[move.row][move.col] = 2;
                setBoard(newBoard);

                const winning = checkWinner(newBoard, move.row, move.col, 2);
                if (winning) {
                    setWinner(2);
                    setWinningCells(winning);
                    setGameOver(true);
                } else {
                    setCurrentPlayer(1);
                }
            }
            setIsAiThinking(false);
        }, 300);
    }, [aiLevel, checkWinner]);

    // Find best move for AI
    const findBestMove = (board, player, depth) => {
        const emptyCells = [];
        for (let r = 0; r < boardSize.rows; r++) {
            for (let c = 0; c < boardSize.cols; c++) {
                if (board[r][c] === 0) {
                    // Only consider cells near existing pieces
                    if (hasNeighbor(board, r, c)) {
                        emptyCells.push({ row: r, col: c, score: 0 });
                    }
                }
            }
        }

        if (emptyCells.length === 0) {
            // First move - center
            return { row: Math.floor(boardSize.rows / 2), col: Math.floor(boardSize.cols / 2) };
        }

        // Score each move
        for (const cell of emptyCells) {
            cell.score = evaluateMove(board, cell.row, cell.col, player);
        }

        // Sort by score
        emptyCells.sort((a, b) => b.score - a.score);

        // Add randomness for easy level
        if (aiLevel === 'easy' && Math.random() < 0.3) {
            const randomIndex = Math.floor(Math.random() * Math.min(5, emptyCells.length));
            return emptyCells[randomIndex];
        }

        return emptyCells[0];
    };

    const hasNeighbor = (board, row, col) => {
        for (let dr = -2; dr <= 2; dr++) {
            for (let dc = -2; dc <= 2; dc++) {
                if (dr === 0 && dc === 0) continue;
                const r = row + dr;
                const c = col + dc;
                if (r >= 0 && r < boardSize.rows && c >= 0 && c < boardSize.cols && board[r][c] !== 0) {
                    return true;
                }
            }
        }
        return false;
    };

    const evaluateMove = (board, row, col, player) => {
        let score = 0;
        const opponent = player === 1 ? 2 : 1;

        // Check all directions
        const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

        for (const [dr, dc] of directions) {
            // Score for player
            const playerLine = countLine(board, row, col, dr, dc, player);
            score += getLineScore(playerLine.count, playerLine.open);

            // Score for blocking opponent
            const opponentLine = countLine(board, row, col, dr, dc, opponent);
            score += getLineScore(opponentLine.count, opponentLine.open) * 0.9;
        }

        // Prefer center
        const centerRow = boardSize.rows / 2;
        const centerCol = boardSize.cols / 2;
        const distanceToCenter = Math.abs(row - centerRow) + Math.abs(col - centerCol);
        score += (boardSize.rows - distanceToCenter) * 0.1;

        return score;
    };

    const countLine = (board, row, col, dr, dc, player) => {
        let count = 0;
        let open = 0;

        // Positive direction
        let blocked = false;
        for (let i = 1; i < winCondition; i++) {
            const r = row + dr * i;
            const c = col + dc * i;
            if (r < 0 || r >= boardSize.rows || c < 0 || c >= boardSize.cols) {
                blocked = true;
                break;
            }
            if (board[r][c] === player) count++;
            else if (board[r][c] === 0) { open++; break; }
            else { blocked = true; break; }
        }
        if (!blocked) open++;

        // Negative direction
        blocked = false;
        for (let i = 1; i < winCondition; i++) {
            const r = row - dr * i;
            const c = col - dc * i;
            if (r < 0 || r >= boardSize.rows || c < 0 || c >= boardSize.cols) {
                blocked = true;
                break;
            }
            if (board[r][c] === player) count++;
            else if (board[r][c] === 0) { open++; break; }
            else { blocked = true; break; }
        }
        if (!blocked) open++;

        return { count, open };
    };

    const getLineScore = (count, open) => {
        if (count >= winCondition - 1) return 10000;
        if (count === winCondition - 2 && open >= 2) return 1000;
        if (count === winCondition - 2 && open === 1) return 100;
        if (count === winCondition - 3 && open >= 2) return 50;
        if (count >= 1) return count * 10;
        return 0;
    };

    // Handle cell click
    const handleCellClick = (row, col) => {
        if (gameOver || board[row][col] !== 0 || currentPlayer !== 1 || isAiThinking) {
            return;
        }

        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = 1;
        setBoard(newBoard);
        setHint(null);

        const winning = checkWinner(newBoard, row, col, 1);
        if (winning) {
            setWinner(1);
            setWinningCells(winning);
            setGameOver(true);
            setScore(1000 + Math.max(0, 600 - timeSpent));
        } else {
            setCurrentPlayer(2);
            makeAiMove(newBoard);
        }
    };

    // Show hint
    const showHint = () => {
        if (gameOver || currentPlayer !== 1) return;
        const bestMove = findBestMove(board, 1, 2);
        if (bestMove) {
            setHint(bestMove);
            setTimeout(() => setHint(null), 2000);
        }
    };

    // Save game
    const saveGame = async () => {
        try {
            const gameState = {
                board,
                currentPlayer,
                aiLevel,
                timeSpent,
                score
            };

            if (sessionId) {
                await api.put(`/games/sessions/${sessionId}`, {
                    state: gameState,
                    score,
                    time_spent: timeSpent
                });
            } else {
                const res = await api.post(`/games/${gameId}/sessions`, {
                    state: gameState
                });
                setSessionId(res.data.data.id);
            }
            alert('Game đã được lưu!');
        } catch (error) {
            console.error('Save error:', error);
            alert('Lỗi khi lưu game');
        }
    };

    // Format time
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="caro-game">
            {/* Header */}
            <div className="game-header">
                <button className="back-btn" onClick={() => navigate('/games')}>
                    <ArrowLeft size={20} />
                    Quay lại
                </button>
                <h1>{gameName}</h1>
                <div className="game-stats">
                    <span className="stat">⏱️ {formatTime(timeSpent)}</span>
                    <span className="stat">🏆 {score}</span>
                </div>
            </div>

            {/* Controls */}
            <div className="game-controls">
                <div className="ai-selector">
                    <label>AI Level:</label>
                    <select value={aiLevel} onChange={(e) => setAiLevel(e.target.value)} disabled={isPlaying && !gameOver}>
                        {Object.entries(AI_LEVELS).map(([key, { name }]) => (
                            <option key={key} value={key}>{name}</option>
                        ))}
                    </select>
                </div>
                <div className="control-buttons">
                    <button className="control-btn" onClick={initializeGame}>
                        <RotateCcw size={18} />
                        Chơi lại
                    </button>
                    <button className="control-btn" onClick={showHint} disabled={gameOver || currentPlayer !== 1}>
                        <Lightbulb size={18} />
                        Gợi ý
                    </button>
                    <button className="control-btn" onClick={saveGame}>
                        <Save size={18} />
                        Lưu game
                    </button>
                </div>
            </div>

            {/* Game status */}
            <div className="game-status">
                {gameOver ? (
                    <div className={`status-message ${winner === 1 ? 'win' : 'lose'}`}>
                        {winner === 1 ? '🎉 Bạn thắng!' : '😢 AI thắng!'}
                    </div>
                ) : (
                    <div className="status-message">
                        {isAiThinking ? '🤔 AI đang suy nghĩ...' : '🎮 Lượt của bạn (X)'}
                    </div>
                )}
            </div>

            {/* Game board */}
            <div className="board-container">
                <div
                    className="game-board"
                    style={{
                        gridTemplateColumns: `repeat(${boardSize.cols}, 1fr)`,
                        gridTemplateRows: `repeat(${boardSize.rows}, 1fr)`
                    }}
                >
                    {board.map((row, rowIndex) =>
                        row.map((cell, colIndex) => {
                            const isWinning = winningCells.some(([r, c]) => r === rowIndex && c === colIndex);
                            const isHint = hint && hint.row === rowIndex && hint.col === colIndex;
                            const isCursor = cursor.row === rowIndex && cursor.col === colIndex;

                            return (
                                <div
                                    key={`${rowIndex}-${colIndex}`}
                                    className={`cell ${cell === 1 ? 'player-x' : cell === 2 ? 'player-o' : ''} ${isWinning ? 'winning' : ''} ${isHint ? 'hint' : ''} ${isCursor ? 'cursor' : ''}`}
                                    onClick={() => handleCellClick(rowIndex, colIndex)}
                                >
                                    {cell === 1 && <span className="x">✕</span>}
                                    {cell === 2 && <span className="o">○</span>}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* 5-Button Game Controller */}
            <GameController
                onLeft={handleLeft}
                onRight={handleRight}
                onEnter={handleEnter}
                onBack={handleBack}
                onHint={showHint}
                disabledButtons={{
                    enter: gameOver || currentPlayer !== 1 || isAiThinking,
                    hint: gameOver || currentPlayer !== 1
                }}
            />

            {/* Instructions */}
            <div className="game-instructions">
                <h3>Hướng dẫn</h3>
                <ul>
                    <li>Dùng nút ← → để di chuyển cursor, Enter để đặt quân</li>
                    <li>Hoặc click trực tiếp vào ô trống</li>
                    <li>Xếp {winCondition} quân liên tiếp (ngang/dọc/chéo) để thắng</li>
                    <li>Dùng nút Hint nếu cần gợi ý</li>
                </ul>
            </div>
        </div>
    );
};

export default CaroGame;
