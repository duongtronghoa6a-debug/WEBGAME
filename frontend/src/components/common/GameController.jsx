import { ChevronLeft, ChevronRight, Check, ArrowLeft, Lightbulb } from 'lucide-react';
import './GameController.css';

/**
 * 5-Button Game Controller theo yêu cầu đề bài
 * - Left: Di chuyển/điều hướng trái
 * - Right: Di chuyển/điều hướng phải  
 * - Enter: Xác nhận/đặt quân
 * - Back: Quay lại/hủy
 * - Hint: Gợi ý
 */
const GameController = ({
    onLeft,
    onRight,
    onEnter,
    onBack,
    onHint,
    disabledButtons = {},
    showLabels = true
}) => {
    return (
        <div className="game-controller">
            <div className="controller-row">
                <button
                    className="controller-btn back"
                    onClick={onBack}
                    disabled={disabledButtons.back}
                    title="Quay lại"
                >
                    <ArrowLeft size={24} />
                    {showLabels && <span>Back</span>}
                </button>

                <button
                    className="controller-btn hint"
                    onClick={onHint}
                    disabled={disabledButtons.hint}
                    title="Gợi ý"
                >
                    <Lightbulb size={24} />
                    {showLabels && <span>Hint</span>}
                </button>
            </div>

            <div className="controller-row main">
                <button
                    className="controller-btn direction"
                    onClick={onLeft}
                    disabled={disabledButtons.left}
                    title="Trái"
                >
                    <ChevronLeft size={32} />
                    {showLabels && <span>Left</span>}
                </button>

                <button
                    className="controller-btn enter"
                    onClick={onEnter}
                    disabled={disabledButtons.enter}
                    title="Xác nhận"
                >
                    <Check size={32} />
                    {showLabels && <span>Enter</span>}
                </button>

                <button
                    className="controller-btn direction"
                    onClick={onRight}
                    disabled={disabledButtons.right}
                    title="Phải"
                >
                    <ChevronRight size={32} />
                    {showLabels && <span>Right</span>}
                </button>
            </div>

            <div className="controller-help">
                <small>Dùng bàn phím: ← → Enter Esc H</small>
            </div>
        </div>
    );
};

export default GameController;
