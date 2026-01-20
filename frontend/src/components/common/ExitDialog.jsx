import { useState, useEffect } from 'react';
import { Save, X, ArrowLeft, ArrowRight } from 'lucide-react';
import './ExitDialog.css';

/**
 * ExitDialog - Modal for game exit confirmation with save option
 * Controls: Left/Right to select, Enter to confirm, Esc to cancel
 */
const ExitDialog = ({
    isOpen,
    onSave,
    onDiscard,
    onCancel,
    gameName = 'Game'
}) => {
    const [selectedOption, setSelectedOption] = useState(0); // 0 = Save, 1 = Discard

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
                    setSelectedOption(0);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    setSelectedOption(1);
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (selectedOption === 0) {
                        onSave?.();
                    } else {
                        onDiscard?.();
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    onCancel?.();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, selectedOption, onSave, onDiscard, onCancel]);

    if (!isOpen) return null;

    return (
        <div className="exit-dialog-overlay">
            <div className="exit-dialog">
                <div className="exit-dialog-header">
                    <h2>💾 Lưu game?</h2>
                    <p>Bạn có muốn lưu tiến trình {gameName} không?</p>
                </div>

                <div className="exit-dialog-options">
                    <button
                        className={`exit-option ${selectedOption === 0 ? 'selected' : ''}`}
                        onClick={() => {
                            setSelectedOption(0);
                            onSave?.();
                        }}
                    >
                        <Save size={24} />
                        <span>Lưu & Thoát</span>
                    </button>

                    <button
                        className={`exit-option ${selectedOption === 1 ? 'selected' : ''}`}
                        onClick={() => {
                            setSelectedOption(1);
                            onDiscard?.();
                        }}
                    >
                        <X size={24} />
                        <span>Không lưu</span>
                    </button>
                </div>

                <div className="exit-dialog-hint">
                    <span><ArrowLeft size={14} /> <ArrowRight size={14} /> để chọn</span>
                    <span>Enter để xác nhận</span>
                    <span>Esc để tiếp tục chơi</span>
                </div>
            </div>
        </div>
    );
};

export default ExitDialog;
