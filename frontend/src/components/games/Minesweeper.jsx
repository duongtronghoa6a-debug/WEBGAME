import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, Trophy, Clock, ArrowLeft, Flag, Bomb } from 'lucide-react';
import GameController from '../common/GameController';
import GameRatingComment from '../common/GameRatingComment';
import './Minesweeper.css';

const Minesweeper = () => {
    const navigate = useNavigate();
    const [board, setBoard] = useState([]);
    const [revealed, setRevealed] = useState([]);
    const [flagged, setFlagged] = useState([]);
    const [gameOver, setGameOver] = useState(false);
    const [won, setWon] = useState(false);
    const [time, setTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [cursor, setCursor] = useState({ row: 4, col: 4 });
    const [mineCount] = useState(10);
    const [size] = useState({ rows: 9, cols: 9 });

    // Initialize game
    const initGame = useCallback(() => {
        const newBoard = Array(size.rows).fill(null).map(() => Array(size.cols).fill(0));
        const newRevealed = Array(size.rows).fill(null).map(() => Array(size.cols).fill(false));
        const newFlagged = Array(size.rows).fill(null).map(() => Array(size.cols).fill(false));

        // Place mines
        let placed = 0;
        while (placed < mineCount) {
            const r = Math.floor(Math.random() * size.rows);
            const c = Math.floor(Math.random() * size.cols);
            if (newBoard[r][c] !== -1) {
                newBoard[r][c] = -1;
                placed++;
            }
        }

        // Calculate numbers
        for (let r = 0; r < size.rows; r++) {
            for (let c = 0; c < size.cols; c++) {
                if (newBoard[r][c] === -1) continue;
                let count = 0;
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        const nr = r + dr, nc = c + dc;
                        if (nr >= 0 && nr < size.rows && nc >= 0 && nc < size.cols) {
                            if (newBoard[nr][nc] === -1) count++;
                        }
                    }
                }
                newBoard[r][c] = count;
            }
        }

        setBoard(newBoard);
        setRevealed(newRevealed);
        setFlagged(newFlagged);
        setGameOver(false);
        setWon(false);
        setTime(0);
        setIsPlaying(true);
        setCursor({ row: 4, col: 4 });
    }, [size, mineCount]);

    useEffect(() => {
        initGame();
    }, [initGame]);

    // Timer
    useEffect(() => {
        let interval;
        if (isPlaying && !gameOver && !won) {
            interval = setInterval(() => setTime(t => t + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, gameOver, won]);

    const revealCell = useCallback((r, c) => {
        if (gameOver || won || revealed[r][c] || flagged[r][c]) return;

        const newRevealed = revealed.map(row => [...row]);

        const reveal = (row, col) => {
            if (row < 0 || row >= size.rows || col < 0 || col >= size.cols) return;
            if (newRevealed[row][col] || flagged[row][col]) return;

            newRevealed[row][col] = true;

            if (board[row][col] === 0) {
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        reveal(row + dr, col + dc);
                    }
                }
            }
        };

        reveal(r, c);
        setRevealed(newRevealed);

        // Check mine hit
        if (board[r][c] === -1) {
            setGameOver(true);
            setIsPlaying(false);
            // Reveal all mines
            const allRevealed = newRevealed.map((row, ri) =>
                row.map((cell, ci) => board[ri][ci] === -1 ? true : cell)
            );
            setRevealed(allRevealed);
            return;
        }

        // Check win
        let unrevealedSafe = 0;
        for (let i = 0; i < size.rows; i++) {
            for (let j = 0; j < size.cols; j++) {
                if (!newRevealed[i][j] && board[i][j] !== -1) unrevealedSafe++;
            }
        }
        if (unrevealedSafe === 0) {
            setWon(true);
            setIsPlaying(false);
        }
    }, [board, revealed, flagged, gameOver, won, size]);

    const toggleFlag = useCallback((r, c) => {
        if (gameOver || won || revealed[r][c]) return;
        const newFlagged = flagged.map(row => [...row]);
        newFlagged[r][c] = !newFlagged[r][c];
        setFlagged(newFlagged);
    }, [flagged, revealed, gameOver, won]);

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (gameOver || won) return;
            e.preventDefault();

            switch (e.key) {
                case 'ArrowLeft':
                    setCursor(prev => ({ ...prev, col: Math.max(0, prev.col - 1) }));
                    break;
                case 'ArrowRight':
                    setCursor(prev => ({ ...prev, col: Math.min(size.cols - 1, prev.col + 1) }));
                    break;
                case 'ArrowUp':
                    setCursor(prev => ({ ...prev, row: Math.max(0, prev.row - 1) }));
                    break;
                case 'ArrowDown':
                    setCursor(prev => ({ ...prev, row: Math.min(size.rows - 1, prev.row + 1) }));
                    break;
                case 'Enter':
                case ' ':
                    revealCell(cursor.row, cursor.col);
                    break;
                case 'f':
                case 'F':
                    toggleFlag(cursor.row, cursor.col);
                    break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [cursor, gameOver, won, size, revealCell, toggleFlag]);

    // 5-button handlers
    const handleLeft = () => setCursor(prev => ({ ...prev, col: Math.max(0, prev.col - 1) }));
    const handleRight = () => setCursor(prev => ({ ...prev, col: Math.min(size.cols - 1, prev.col + 1) }));
    const handleEnter = () => revealCell(cursor.row, cursor.col);
    const handleBack = () => navigate('/games');
    const handleHint = () => toggleFlag(cursor.row, cursor.col);

    const getCellClass = (r, c) => {
        let classes = ['cell'];
        if (cursor.row === r && cursor.col === c) classes.push('cursor');
        if (revealed[r][c]) {
            classes.push('revealed');
            if (board[r][c] === -1) classes.push('mine');
            else if (board[r][c] > 0) classes.push(`num-${board[r][c]}`);
        } else if (flagged[r][c]) {
            classes.push('flagged');
        }
        return classes.join(' ');
    };

    const getCellContent = (r, c) => {
        if (flagged[r][c] && !revealed[r][c]) return <Flag size={16} />;
        if (!revealed[r][c]) return '';
        if (board[r][c] === -1) return <Bomb size={16} />;
        if (board[r][c] === 0) return '';
        return board[r][c];
    };

    const flagCount = flagged.flat().filter(Boolean).length;

    return (
        <div className="minesweeper-page">
            <div className="game-header">
                <button className="btn btn-outline" onClick={() => navigate('/games')}>
                    <ArrowLeft size={18} /> Quay lại
                </button>
                <h1>💣 Dò Mìn</h1>
                <button className="btn btn-primary" onClick={initGame}>
                    <RotateCcw size={18} /> Chơi lại
                </button>
            </div>

            <div className="game-stats">
                <div className="stat-box">
                    <Bomb size={20} />
                    <div>
                        <span className="stat-label">Mìn</span>
                        <span className="stat-value">{mineCount - flagCount}</span>
                    </div>
                </div>
                <div className="stat-box">
                    <Clock size={20} />
                    <div>
                        <span className="stat-label">Thời gian</span>
                        <span className="stat-value">{time}s</span>
                    </div>
                </div>
            </div>

            <div className="minesweeper-board">
                {board.map((row, r) => (
                    <div key={r} className="board-row">
                        {row.map((_, c) => (
                            <div
                                key={`${r}-${c}`}
                                className={getCellClass(r, c)}
                                onClick={() => revealCell(r, c)}
                                onContextMenu={(e) => { e.preventDefault(); toggleFlag(r, c); }}
                            >
                                {getCellContent(r, c)}
                            </div>
                        ))}
                    </div>
                ))}

                {(gameOver || won) && (
                    <div className="game-overlay">
                        <h2>{won ? '🎉 Chiến thắng!' : '💥 Bạn đã đạp trúng mìn!'}</h2>
                        <p>Thời gian: {time}s</p>
                        <button className="btn btn-primary" onClick={initGame}>
                            Chơi lại
                        </button>
                    </div>
                )}
            </div>

            <GameController
                onLeft={handleLeft}
                onRight={handleRight}
                onEnter={handleEnter}
                onBack={handleBack}
                onHint={handleHint}
                disabledButtons={gameOver || won ? ['left', 'right', 'enter', 'hint'] : []}
            />

            <div className="game-instructions">
                <h4>📖 Hướng dẫn</h4>
                <p>
                    • Di chuyển bằng phím mũi tên<br />
                    • Enter: Mở ô | F hoặc Hint: Cắm cờ<br />
                    • Số = số mìn xung quanh. Tránh mìn để thắng!
                </p>
            </div>

            {/* Rating & Comments */}
            <GameRatingComment gameId={11} />
        </div>
    );
};

export default Minesweeper;
