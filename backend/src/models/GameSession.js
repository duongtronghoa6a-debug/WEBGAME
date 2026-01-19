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
        let query = db(this.tableName)
            .where({ user_id: userId })
            .join('games', 'games.id', '=', `${this.tableName}.game_id`)
            .select(
                `${this.tableName}.id`,
                `${this.tableName}.score`,
                `${this.tableName}.time_spent`,
                `${this.tableName}.completed`,
                `${this.tableName}.created_at`,
                `${this.tableName}.updated_at`,
                'games.id as game_id',
                'games.name as game_name',
                'games.type as game_type'
            );

        if (completed !== undefined) {
            query = query.where({ completed });
        }

        const countQuery = query.clone();
        const [{ count }] = await countQuery.count();
        const total = parseInt(count);

        const offset = (page - 1) * limit;
        const sessions = await query
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
     * Get completed sessions for ranking
     */
    static async getRankings(gameId, { page = 1, limit = 10, userIds }) {
        let query = db(this.tableName)
            .where({ game_id: gameId, completed: true })
            .join('users', 'users.id', '=', `${this.tableName}.user_id`)
            .select(
                'users.id as user_id',
                'users.username',
                'users.avatar_url',
                db.raw(`MAX(${this.tableName}.score) as highest_score`),
                db.raw(`COUNT(${this.tableName}.id) as total_games`)
            )
            .groupBy('users.id', 'users.username', 'users.avatar_url');

        if (userIds && userIds.length > 0) {
            query = query.whereIn('users.id', userIds);
        }

        const offset = (page - 1) * limit;
        const rankings = await query
            .orderBy('highest_score', 'desc')
            .limit(limit)
            .offset(offset);

        // Add rank numbers
        const rankedData = rankings.map((item, index) => ({
            rank: offset + index + 1,
            ...item,
            highest_score: parseInt(item.highest_score),
            total_games: parseInt(item.total_games)
        }));

        // Get total count for pagination
        const [{ count }] = await db(this.tableName)
            .where({ game_id: gameId, completed: true })
            .countDistinct('user_id as count');

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
