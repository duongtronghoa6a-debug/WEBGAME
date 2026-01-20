import { useState, useEffect } from 'react';
import { RotateCcw, Home, ArrowLeft, ArrowRight } from 'lucide-react';
import './GameOverDialog.css';

/**
 * GameOverDialog - Modal for game over with play again/exit options
 * Controls: Left/Right to select, Enter to confirm
 */
const GameOverDialog = ({
    isOpen,
    isWin = false,
    score = 0,
    message = '',
    onPlayAgain,
    onExit,
    gameName = 'Game'
}) => {
    const [selectedOption, setSelectedOption] = useState(0); // 0 = Play Again, 1 = Exit

    // Reset selection when dialog opens
    useEffect(() => {
        if (isOpen) {
            setSelectedOption(0);
        }
    }, [isOpen]);

    // Keyboard controls
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedOption(0);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedOption(1);
                    break;
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    e.stopPropagation();
                    if (selectedOption === 0) {
                        onPlayAgain?.();
                    } else {
                        onExit?.();
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown, true);
        return () => window.removeEventListener('keydown', handleKeyDown, true);
    }, [isOpen, selectedOption, onPlayAgain, onExit]);

    if (!isOpen) return null;

    return (
        <div className="game-over-dialog-overlay">
            <div className={`game-over-dialog ${isWin ? 'win' : 'lose'}`}>
                <div className="game-over-header">
                    <div className="game-over-emoji">
                        {isWin ? '🎉' : '💀'}
                    </div>
                    <h2>{isWin ? 'Chúc mừng!' : 'Game Over!'}</h2>
                    {message && <p className="game-over-message">{message}</p>}
                    <div className="game-over-score">
                        🏆 Điểm: <strong>{score}</strong>
                    </div>
                </div>

                <div className="game-over-options">
                    <button
                        className={`game-over-option ${selectedOption === 0 ? 'selected' : ''}`}
                        onClick={() => {
                            setSelectedOption(0);
                            onPlayAgain?.();
                        }}
                    >
                        <RotateCcw size={24} />
                        <span>Chơi lại</span>
                    </button>

                    <button
                        className={`game-over-option ${selectedOption === 1 ? 'selected' : ''}`}
                        onClick={() => {
                            setSelectedOption(1);
                            onExit?.();
                        }}
                    >
                        <Home size={24} />
                        <span>Thoát</span>
                    </button>
                </div>

                <div className="game-over-hint">
                    <span><ArrowLeft size={14} /> <ArrowRight size={14} /> để chọn</span>
                    <span>Enter để xác nhận</span>
                </div>
            </div>
        </div>
    );
};

export default GameOverDialog;
