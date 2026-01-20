import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Lightbulb } from 'lucide-react';
import api from '../../services/api';
import LEDMatrix, { LED_COLORS } from '../common/LEDMatrix';
import GameController from '../common/GameController';
import ExitDialog from '../common/ExitDialog';
import GameRatingComment from '../common/GameRatingComment';
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
    const [pixels, setPixels] = useState([]);
    const [showExitDialog, setShowExitDialog] = useState(false);

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
                setBoardSize({ rows: 9, cols: 9 }); // 3x3 scaled 3x for visibility
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

    // Convert board to LED pixels
    useEffect(() => {
        const newPixels = Array(boardSize.rows).fill(null).map(() =>
            Array(boardSize.cols).fill(null)
        );

        const scale = parseInt(gameId) === 3 ? 3 : 1; // 3x scale for Tic-tac-toe
        const logicalRows = parseInt(gameId) === 3 ? 3 : boardSize.rows;
        const logicalCols = parseInt(gameId) === 3 ? 3 : boardSize.cols;

        for (let r = 0; r < logicalRows; r++) {
            for (let c = 0; c < logicalCols; c++) {
                const cellValue = board[r]?.[c];
                let color = null;

                if (cellValue === 1) {
                    color = LED_COLORS.PLAYER_1; // Red for X
                } else if (cellValue === 2) {
                    color = LED_COLORS.PLAYER_2; // Cyan for O
                }

                // Check if winning cell
                const isWinning = winningCells.some(([wr, wc]) => wr === r && wc === c);
                if (isWinning) {
                    color = LED_COLORS.WINNING;
                }

                // Check if hint cell
                if (hint && hint.row === r && hint.col === c) {
                    color = LED_COLORS.CURSOR;
                }

                // Scale for Tic-tac-toe
                if (scale > 1 && color) {
                    for (let dr = 0; dr < scale; dr++) {
                        for (let dc = 0; dc < scale; dc++) {
                            if (newPixels[r * scale + dr]) {
                                newPixels[r * scale + dr][c * scale + dc] = color;
                            }
                        }
                    }
                } else if (color) {
                    newPixels[r][c] = color;
                }
            }
        }

        setPixels(newPixels);
    }, [board, winningCells, hint, boardSize, gameId]);

    // Load saved game session on mount
    useEffect(() => {
        const loadSavedGame = async () => {
            try {
                const res = await api.get('/games/sessions?completed=false');
                if (res.data.success && res.data.data && res.data.data.length > 0) {
                    const savedSession = res.data.data.find(s => s.game_id === parseInt(gameId));
                    if (savedSession && savedSession.state) {
                        const state = savedSession.state;
                        if (state.board) setBoard(state.board);
                        if (state.currentPlayer) setCurrentPlayer(state.currentPlayer);
                        if (state.aiLevel) setAiLevel(state.aiLevel);
                        if (state.timeSpent) setTimeSpent(state.timeSpent);
                        if (state.score) setScore(state.score);
                        setSessionId(savedSession.id);
                        setIsPlaying(true);
                    }
                }
            } catch (error) {
                console.error('Load saved game error:', error);
            }
        };
        loadSavedGame();
    }, [gameId]);

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

    // Keyboard controls - ONLY 5-button, no direct click
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Block all keyboard when exit dialog is open
            if (showExitDialog) return;
            if (gameOver || isAiThinking || currentPlayer !== 1) return;

            const scale = parseInt(gameId) === 3 ? 3 : 1;
            const logicalRows = parseInt(gameId) === 3 ? 3 : boardSize.rows;
            const logicalCols = parseInt(gameId) === 3 ? 3 : boardSize.cols;

            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    setCursor(prev => ({ ...prev, col: Math.max(0, prev.col - 1) }));
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    setCursor(prev => ({ ...prev, col: Math.min(logicalCols - 1, prev.col + 1) }));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setCursor(prev => ({ ...prev, row: Math.max(0, prev.row - 1) }));
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    setCursor(prev => ({ ...prev, row: Math.min(logicalRows - 1, prev.row + 1) }));
                    break;
                case 'Enter':
                    e.preventDefault();
                    handleMove(cursor.row, cursor.col);
                    break;
                case 'Escape':
                    e.preventDefault();
                    // If game in progress, show exit dialog
                    if (isPlaying && !gameOver) {
                        setShowExitDialog(true);
                    } else {
                        navigate('/games');
                    }
                    break;
                case 'h':
                case 'H':
                    showHint();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [cursor, gameOver, isAiThinking, currentPlayer, boardSize, gameId, showExitDialog, isPlaying]);

    // GameController handlers
    const handleLeft = () => {
        const logicalCols = parseInt(gameId) === 3 ? 3 : boardSize.cols;
        setCursor(prev => ({ ...prev, col: Math.max(0, prev.col - 1) }));
    };

    const handleRight = () => {
        const logicalCols = parseInt(gameId) === 3 ? 3 : boardSize.cols;
        setCursor(prev => ({ ...prev, col: Math.min(logicalCols - 1, prev.col + 1) }));
    };

    const handleUp = () => {
        setCursor(prev => ({ ...prev, row: Math.max(0, prev.row - 1) }));
    };

    const handleDown = () => {
        const logicalRows = parseInt(gameId) === 3 ? 3 : boardSize.rows;
        setCursor(prev => ({ ...prev, row: Math.min(logicalRows - 1, prev.row + 1) }));
    };

    const handleEnter = () => handleMove(cursor.row, cursor.col);
    const handleBack = () => {
        if (isPlaying && !gameOver) {
            setShowExitDialog(true);
        } else {
            navigate('/games');
        }
    };

    const initializeGame = () => {
        const logicalRows = parseInt(gameId) === 3 ? 3 : boardSize.rows;
        const logicalCols = parseInt(gameId) === 3 ? 3 : boardSize.cols;

        const newBoard = Array(logicalRows).fill(null).map(() =>
            Array(logicalCols).fill(0)
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
        setCursor({ row: Math.floor(logicalRows / 2), col: Math.floor(logicalCols / 2) });
    };

    // Check winner
    const checkWinner = useCallback((board, row, col, player) => {
        const logicalRows = board.length;
        const logicalCols = board[0]?.length || 0;

        const directions = [
            [0, 1],   // horizontal
            [1, 0],   // vertical
            [1, 1],   // diagonal
            [1, -1]   // anti-diagonal
        ];

        for (const [dr, dc] of directions) {
            let count = 1;
            const cells = [[row, col]];

            for (let i = 1; i < winCondition; i++) {
                const r = row + dr * i;
                const c = col + dc * i;
                if (r >= 0 && r < logicalRows && c >= 0 && c < logicalCols && board[r][c] === player) {
                    count++;
                    cells.push([r, c]);
                } else break;
            }

            for (let i = 1; i < winCondition; i++) {
                const r = row - dr * i;
                const c = col - dc * i;
                if (r >= 0 && r < logicalRows && c >= 0 && c < logicalCols && board[r][c] === player) {
                    count++;
                    cells.push([r, c]);
                } else break;
            }

            if (count >= winCondition) {
                return cells;
            }
        }
        return null;
    }, [winCondition]);

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
        const logicalRows = board.length;
        const logicalCols = board[0]?.length || 0;
        const emptyCells = [];

        for (let r = 0; r < logicalRows; r++) {
            for (let c = 0; c < logicalCols; c++) {
                if (board[r][c] === 0) {
                    if (hasNeighbor(board, r, c)) {
                        emptyCells.push({ row: r, col: c, score: 0 });
                    }
                }
            }
        }

        if (emptyCells.length === 0) {
            return { row: Math.floor(logicalRows / 2), col: Math.floor(logicalCols / 2) };
        }

        for (const cell of emptyCells) {
            cell.score = evaluateMove(board, cell.row, cell.col, player);
        }

        emptyCells.sort((a, b) => b.score - a.score);

        if (aiLevel === 'easy' && Math.random() < 0.3) {
            const randomIndex = Math.floor(Math.random() * Math.min(5, emptyCells.length));
            return emptyCells[randomIndex];
        }

        return emptyCells[0];
    };

    const hasNeighbor = (board, row, col) => {
        const logicalRows = board.length;
        const logicalCols = board[0]?.length || 0;

        for (let dr = -2; dr <= 2; dr++) {
            for (let dc = -2; dc <= 2; dc++) {
                if (dr === 0 && dc === 0) continue;
                const r = row + dr;
                const c = col + dc;
                if (r >= 0 && r < logicalRows && c >= 0 && c < logicalCols && board[r][c] !== 0) {
                    return true;
                }
            }
        }
        return false;
    };

    const evaluateMove = (board, row, col, player) => {
        let score = 0;
        const opponent = player === 1 ? 2 : 1;
        const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

        for (const [dr, dc] of directions) {
            const playerLine = countLine(board, row, col, dr, dc, player);
            score += getLineScore(playerLine.count, playerLine.open);
            const opponentLine = countLine(board, row, col, dr, dc, opponent);
            score += getLineScore(opponentLine.count, opponentLine.open) * 0.9;
        }

        const logicalRows = board.length;
        const logicalCols = board[0]?.length || 0;
        const centerRow = logicalRows / 2;
        const centerCol = logicalCols / 2;
        const distanceToCenter = Math.abs(row - centerRow) + Math.abs(col - centerCol);
        score += (logicalRows - distanceToCenter) * 0.1;

        return score;
    };

    const countLine = (board, row, col, dr, dc, player) => {
        const logicalRows = board.length;
        const logicalCols = board[0]?.length || 0;
        let count = 0;
        let open = 0;

        let blocked = false;
        for (let i = 1; i < winCondition; i++) {
            const r = row + dr * i;
            const c = col + dc * i;
            if (r < 0 || r >= logicalRows || c < 0 || c >= logicalCols) {
                blocked = true;
                break;
            }
            if (board[r][c] === player) count++;
            else if (board[r][c] === 0) { open++; break; }
            else { blocked = true; break; }
        }
        if (!blocked) open++;

        blocked = false;
        for (let i = 1; i < winCondition; i++) {
            const r = row - dr * i;
            const c = col - dc * i;
            if (r < 0 || r >= logicalRows || c < 0 || c >= logicalCols) {
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

    // Handle move - ONLY via Enter button, not click
    const handleMove = (row, col) => {
        if (gameOver || board[row]?.[col] !== 0 || currentPlayer !== 1 || isAiThinking) {
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

    // Save game and exit
    const saveGameAndExit = async () => {
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
                await api.post(`/games/${gameId}/sessions`, {
                    state: gameState
                });
            }
            navigate('/games');
        } catch (error) {
            console.error('Save error:', error);
            navigate('/games');
        }
    };

    const discardAndExit = () => {
        navigate('/games');
    };

    // Format time
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Calculate LED cursor position (scaled for Tic-tac-toe)
    const getLEDCursor = () => {
        const scale = parseInt(gameId) === 3 ? 3 : 1;
        if (scale > 1) {
            return {
                row: cursor.row * scale + 1,
                col: cursor.col * scale + 1
            };
        }
        return cursor;
    };

    return (
        <div className="caro-game led-caro-game">
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
                    <select
                        value={aiLevel}
                        onChange={(e) => setAiLevel(e.target.value)}
                        disabled={isAiThinking}
                    >
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
                        {isAiThinking ? '🤔 AI đang suy nghĩ...' : '🎮 Lượt của bạn - Dùng ← ↑ → ↓ và Enter'}
                    </div>
                )}
            </div>

            {/* LED Matrix Game board */}
            <div className="board-container">
                <LEDMatrix
                    pixels={pixels}
                    rows={boardSize.rows}
                    cols={boardSize.cols}
                    cursor={getLEDCursor()}
                    dotSize={parseInt(gameId) === 3 ? 'large' : 'medium'}
                    showBorder={true}
                />
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
                    <li>Dùng nút ← ↑ → ↓ để di chuyển cursor</li>
                    <li>Nhấn Enter để đặt quân (không click chuột)</li>
                    <li>Xếp {winCondition} quân liên tiếp (ngang/dọc/chéo) để thắng</li>
                    <li>Dùng nút Hint nếu cần gợi ý</li>
                </ul>
            </div>

            {/* Rating & Comments */}
            <GameRatingComment gameId={parseInt(gameId)} />

            {/* Exit Dialog */}
            <ExitDialog
                isOpen={showExitDialog}
                onSave={saveGameAndExit}
                onDiscard={discardAndExit}
                onCancel={() => setShowExitDialog(false)}
                gameName={gameName}
            />
        </div>
    );
};

export default CaroGame;
