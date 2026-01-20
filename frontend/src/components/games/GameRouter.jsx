import { useParams } from 'react-router-dom';
import CaroGame from './CaroGame';
import SnakeGame from './SnakeGame';
import Match3Game from './Match3Game';
import MemoryGame from './MemoryGame';
import DrawingBoard from './DrawingBoard';
import Game2048 from './Game2048';
import Minesweeper from './Minesweeper';

// Map gameId to game component
const gameComponents = {
    1: CaroGame,      // Caro Hàng 5
    2: CaroGame,      // Caro Hàng 4 (reuse with different config)
    3: CaroGame,      // Tic-Tac-Toe (reuse with 3x3 config)
    4: SnakeGame,     // Rắn Săn Mồi
    5: Match3Game,    // Ghép Hàng 3
    6: MemoryGame,    // Cờ Trí Nhớ
    7: DrawingBoard,  // Bảng Vẽ
    // Bonus games
    11: Minesweeper,  // Dò Mìn (có sẵn trong seed)
    18: Game2048,     // 2048 Puzzle (mới thêm)
};

// Placeholder component for games not yet implemented
const ComingSoon = ({ gameId }) => (
    <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        maxWidth: '600px',
        margin: '0 auto'
    }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🚧</div>
        <h1 style={{ marginBottom: '16px' }}>Coming Soon</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
            Game #{gameId} đang được phát triển và sẽ sớm ra mắt!
        </p>
    </div>
);

const GameRouter = () => {
    const { gameId } = useParams();
    const id = parseInt(gameId);

    const GameComponent = gameComponents[id];

    if (!GameComponent) {
        return <ComingSoon gameId={id} />;
    }

    return <GameComponent />;
};

export default GameRouter;
