const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class GameSession {
    static tableName = 'game_sessions';

    /**
     * Create new game session
     */
    static async create(data) {
        const [session] = await db(this.tableName)
            .insert({
                id: uuidv4(),
                ...data,
                score: 0,
                time_spent: 0,
                completed: false,
                created_at: new Date(),
                updated_at: new Date()
            })
            .returning('*');
        return session;
    }

    /**
     * Find session by ID
     */
    static async findById(id) {
        return db(this.tableName)
            .where({ id })
            .first();
    }

    /**
     * Find session with game info
     */
    static async findWithGame(id) {
        const session = await db(this.tableName)
            .where({ [`${this.tableName}.id`]: id })
            .join('games', 'games.id', '=', `${this.tableName}.game_id`)
            .select(
                `${this.tableName}.*`,
                'games.name as game_name',
                'games.type as game_type'
            )
            .first();

        return session;
    }

    /**
     * Update session (save game)
     */
    static async update(id, data) {
        const [session] = await db(this.tableName)
            .where({ id })
            .update({
                ...data,
                updated_at: new Date()
            })
            .returning('*');
        return session;
    }

    /**
     * Get user's saved games (incomplete sessions)
     */
    static async getUserSavedGames(userId, { page = 1, limit = 10, completed }) {
        let baseQuery = db(this.tableName)
            .where({ user_id: userId })
            .join('games', 'games.id', '=', `${this.tableName}.game_id`);

        if (completed !== undefined) {
            baseQuery = baseQuery.where({ completed });
        }

        // Count query - separate to avoid GROUP BY conflict
        const [{ count }] = await baseQuery.clone().count();
        const total = parseInt(count);

        // Data query with select
        const offset = (page - 1) * limit;
        const sessions = await baseQuery.clone()
            .select(
                `${this.tableName}.id`,
                `${this.tableName}.state`,
                `${this.tableName}.score`,
                `${this.tableName}.time_spent`,
                `${this.tableName}.completed`,
                `${this.tableName}.created_at`,
                `${this.tableName}.updated_at`,
                'games.id as game_id',
                'games.name as game_name',
                'games.type as game_type'
            )
            .orderBy(`${this.tableName}.updated_at`, 'desc')
            .limit(limit)
            .offset(offset);

        return {
            data: sessions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Get completed sessions for ranking (all games if gameId is null)
     */
    static async getRankings(gameId, { page = 1, limit = 10, userIds }) {
        let query = db(this.tableName)
            .where({ completed: true })
            .join('users', 'users.id', '=', `${this.tableName}.user_id`)
            .select(
                'users.id as user_id',
                'users.username',
                'users.avatar_url',
                db.raw(`SUM(${this.tableName}.score) as total_score`),
                db.raw(`MAX(${this.tableName}.score) as highest_score`),
                db.raw(`COUNT(${this.tableName}.id) as games_played`),
                db.raw(`ROUND(AVG(${this.tableName}.score)) as avg_score`)
            )
            .groupBy('users.id', 'users.username', 'users.avatar_url');

        // Filter by gameId if provided
        if (gameId) {
            query = query.where({ game_id: gameId });
        }

        if (userIds && userIds.length > 0) {
            query = query.whereIn('users.id', userIds);
        }

        const offset = (page - 1) * limit;
        const rankings = await query
            .orderBy('total_score', 'desc')
            .limit(limit)
            .offset(offset);

        // Add rank numbers
        const rankedData = rankings.map((item, index) => ({
            rank: offset + index + 1,
            ...item,
            total_score: parseInt(item.total_score) || 0,
            highest_score: parseInt(item.highest_score) || 0,
            games_played: parseInt(item.games_played) || 0,
            avg_score: parseInt(item.avg_score) || 0
        }));

        // Get total count for pagination
        let countQuery = db(this.tableName)
            .where({ completed: true })
            .countDistinct('user_id as count');

        if (gameId) {
            countQuery = countQuery.where({ game_id: gameId });
        }

        const [{ count }] = await countQuery;

        return {
            data: rankedData,
            pagination: {
                page,
                limit,
                total: parseInt(count),
                totalPages: Math.ceil(parseInt(count) / limit)
            }
        };
    }

    /**
     * Get user's personal ranking history
     */
    static async getPersonalHistory(userId, gameId, { page = 1, limit = 10 }) {
        const offset = (page - 1) * limit;

        const sessions = await db(this.tableName)
            .where({ user_id: userId, game_id: gameId, completed: true })
            .select('id', 'score', 'time_spent', 'created_at')
            .orderBy('score', 'desc')
            .limit(limit)
            .offset(offset);

        const [{ count }] = await db(this.tableName)
            .where({ user_id: userId, game_id: gameId, completed: true })
            .count();

        return {
            data: sessions,
            pagination: {
                page,
                limit,
                total: parseInt(count),
                totalPages: Math.ceil(parseInt(count) / limit)
            }
        };
    }
}

module.exports = GameSession;
