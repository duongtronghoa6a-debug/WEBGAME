const db = require('../config/database');

class Game {
    static tableName = 'games';

    /**
     * Get all games
     */
    static async getAll(includeDisabled = false) {
        let query = db(this.tableName);

        if (!includeDisabled) {
            query = query.where({ enabled: true });
        }

        return query.orderBy('id', 'asc');
    }

    /**
     * Get game by ID
     */
    static async findById(id) {
        return db(this.tableName)
            .where({ id })
            .first();
    }

    /**
     * Get game with stats
     */
    static async getWithStats(id) {
        const game = await this.findById(id);

        if (!game) return null;

        // Get play stats
        const [stats] = await db('game_sessions')
            .where({ game_id: id })
            .select(
                db.raw('COUNT(*) as total_plays'),
                db.raw('COUNT(DISTINCT user_id) as unique_players')
            );

        // Get rating stats
        const [ratingStats] = await db('ratings')
            .where({ game_id: id })
            .select(
                db.raw('COALESCE(AVG(stars), 0) as avg_rating'),
                db.raw('COUNT(*) as total_ratings')
            );

        return {
            ...game,
            stats: {
                total_plays: parseInt(stats.total_plays) || 0,
                unique_players: parseInt(stats.unique_players) || 0,
                avg_rating: parseFloat(ratingStats.avg_rating).toFixed(1),
                total_ratings: parseInt(ratingStats.total_ratings) || 0
            }
        };
    }

    /**
     * Update game config (admin)
     */
    static async update(id, data) {
        const [game] = await db(this.tableName)
            .where({ id })
            .update(data)
            .returning('*');
        return game;
    }

    /**
     * Get all games with stats (for listing)
     */
    static async getAllWithStats(includeDisabled = false) {
        let query = db(this.tableName);

        if (!includeDisabled) {
            query = query.where({ enabled: true });
        }

        const games = await query.orderBy('id', 'asc');

        // Get stats for all games
        const gamesWithStats = await Promise.all(
            games.map(async (game) => {
                const [stats] = await db('game_sessions')
                    .where({ game_id: game.id })
                    .select(db.raw('COUNT(*) as total_plays'));

                const [ratingStats] = await db('ratings')
                    .where({ game_id: game.id })
                    .select(db.raw('COALESCE(AVG(stars), 0) as avg_rating'));

                return {
                    ...game,
                    stats: {
                        total_plays: parseInt(stats.total_plays) || 0,
                        avg_rating: parseFloat(ratingStats.avg_rating).toFixed(1)
                    }
                };
            })
        );

        return gamesWithStats;
    }
}

module.exports = Game;
