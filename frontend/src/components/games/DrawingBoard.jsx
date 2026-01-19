import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, RotateCcw, Download, Trash2,
    Pencil, Eraser, Square, Circle, Minus
} from 'lucide-react';
import './DrawingBoard.css';

const COLORS = [
    '#000000', '#ffffff', '#ef4444', '#f97316', '#eab308',
    '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280'
];

const BRUSH_SIZES = [2, 4, 8, 12, 20];

const DrawingBoard = () => {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const contextRef = useRef(null);

    // Drawing state
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(4);
    const [tool, setTool] = useState('pencil'); // pencil, eraser, line, rectangle, circle
    const [startPos, setStartPos] = useState(null);
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // Initialize canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = canvas.offsetWidth * 2;
        canvas.height = canvas.offsetHeight * 2;
        canvas.style.width = `${canvas.offsetWidth}px`;
        canvas.style.height = `${canvas.offsetHeight}px`;

        const context = canvas.getContext('2d');
        context.scale(2, 2);
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        contextRef.current = context;

        // Save initial state
        saveToHistory();
    }, []);

    // Save to history
    const saveToHistory = useCallback(() => {
        const canvas = canvasRef.current;
        const imageData = canvas.toDataURL();

        setHistory(prev => {
            const newHistory = prev.slice(0, historyIndex + 1);
            newHistory.push(imageData);
            return newHistory.slice(-20); // Keep last 20 states
        });
        setHistoryIndex(prev => Math.min(prev + 1, 19));
    }, [historyIndex]);

    // Undo
    const undo = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            loadFromHistory(history[newIndex]);
        }
    };

    // Load from history
    const loadFromHistory = (imageData) => {
        const canvas = canvasRef.current;
        const context = contextRef.current;
        const img = new Image();
        img.onload = () => {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, 0, 0, canvas.offsetWidth, canvas.offsetHeight);
        };
        img.src = imageData;
    };

    // Get position from event
    const getPosition = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();

        if (e.touches) {
            return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top
            };
        }
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    // Start drawing
    const startDrawing = (e) => {
        e.preventDefault();
        const pos = getPosition(e);

        if (tool === 'pencil' || tool === 'eraser') {
            contextRef.current.beginPath();
            contextRef.current.moveTo(pos.x, pos.y);
            contextRef.current.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
            contextRef.current.lineWidth = brushSize;
        } else {
            setStartPos(pos);
            // Save canvas state for shape preview
            saveToHistory();
        }

        setIsDrawing(true);
    };

    // Draw
    const draw = (e) => {
        if (!isDrawing) return;
        e.preventDefault();

        const pos = getPosition(e);

        if (tool === 'pencil' || tool === 'eraser') {
            contextRef.current.lineTo(pos.x, pos.y);
            contextRef.current.stroke();
        } else if (startPos) {
            // Preview shape
            if (historyIndex >= 0 && history[historyIndex]) {
                loadFromHistory(history[historyIndex]);
            }
            drawShape(startPos, pos);
        }
    };

    // Draw shape
    const drawShape = (start, end) => {
        const context = contextRef.current;
        context.strokeStyle = color;
        context.lineWidth = brushSize;
        context.beginPath();

        if (tool === 'line') {
            context.moveTo(start.x, start.y);
            context.lineTo(end.x, end.y);
        } else if (tool === 'rectangle') {
            context.rect(start.x, start.y, end.x - start.x, end.y - start.y);
        } else if (tool === 'circle') {
            const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
            context.arc(start.x, start.y, radius, 0, Math.PI * 2);
        }

        context.stroke();
    };

    // Stop drawing
    const stopDrawing = () => {
        if (isDrawing) {
            contextRef.current.closePath();
            setIsDrawing(false);
            setStartPos(null);
            saveToHistory();
        }
    };

    // Clear canvas
    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const context = contextRef.current;
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
        saveToHistory();
    };

    // Download image
    const downloadImage = () => {
        const canvas = canvasRef.current;
        const link = document.createElement('a');
        link.download = 'drawing.png';
        link.href = canvas.toDataURL();
        link.click();
    };

    return (
        <div className="drawing-board">
            {/* Header */}
            <div className="game-header">
                <button className="back-btn" onClick={() => navigate('/games')}>
                    <ArrowLeft size={20} />
                    Quay lại
                </button>
                <h1>🎨 Bảng Vẽ</h1>
            </div>

            {/* Toolbar */}
            <div className="toolbar">
                <div className="tool-group">
                    <label>Công cụ:</label>
                    <div className="tool-buttons">
                        <button
                            className={`tool-btn ${tool === 'pencil' ? 'active' : ''}`}
                            onClick={() => setTool('pencil')}
                            title="Bút vẽ"
                        >
                            <Pencil size={18} />
                        </button>
                        <button
                            className={`tool-btn ${tool === 'eraser' ? 'active' : ''}`}
                            onClick={() => setTool('eraser')}
                            title="Tẩy"
                        >
                            <Eraser size={18} />
                        </button>
                        <button
                            className={`tool-btn ${tool === 'line' ? 'active' : ''}`}
                            onClick={() => setTool('line')}
                            title="Đường thẳng"
                        >
                            <Minus size={18} />
                        </button>
                        <button
                            className={`tool-btn ${tool === 'rectangle' ? 'active' : ''}`}
                            onClick={() => setTool('rectangle')}
                            title="Hình chữ nhật"
                        >
                            <Square size={18} />
                        </button>
                        <button
                            className={`tool-btn ${tool === 'circle' ? 'active' : ''}`}
                            onClick={() => setTool('circle')}
                            title="Hình tròn"
                        >
                            <Circle size={18} />
                        </button>
                    </div>
                </div>

                <div className="tool-group">
                    <label>Màu sắc:</label>
                    <div className="color-palette">
                        {COLORS.map(c => (
                            <button
                                key={c}
                                className={`color-btn ${color === c ? 'active' : ''}`}
                                style={{ backgroundColor: c }}
                                onClick={() => setColor(c)}
                            />
                        ))}
                    </div>
                </div>

                <div className="tool-group">
                    <label>Kích thước: {brushSize}px</label>
                    <div className="size-buttons">
                        {BRUSH_SIZES.map(size => (
                            <button
                                key={size}
                                className={`size-btn ${brushSize === size ? 'active' : ''}`}
                                onClick={() => setBrushSize(size)}
                            >
                                <span style={{
                                    width: size,
                                    height: size,
                                    borderRadius: '50%',
                                    background: 'currentColor'
                                }} />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="tool-group actions">
                    <button className="action-btn" onClick={undo} title="Hoàn tác">
                        <RotateCcw size={18} />
                    </button>
                    <button className="action-btn" onClick={clearCanvas} title="Xóa tất cả">
                        <Trash2 size={18} />
                    </button>
                    <button className="action-btn primary" onClick={downloadImage} title="Tải xuống">
                        <Download size={18} />
                    </button>
                </div>
            </div>

            {/* Canvas */}
            <div className="canvas-container">
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />
            </div>

            {/* Instructions */}
            <div className="game-instructions">
                <h3>Hướng dẫn</h3>
                <ul>
                    <li>Chọn công cụ vẽ (bút, tẩy, hình)</li>
                    <li>Chọn màu sắc và kích thước nét</li>
                    <li>Vẽ trên canvas bằng chuột hoặc touch</li>
                    <li>Hoàn tác hoặc tải xuống bản vẽ</li>
                </ul>
            </div>
        </div>
    );
};

export default DrawingBoard;
