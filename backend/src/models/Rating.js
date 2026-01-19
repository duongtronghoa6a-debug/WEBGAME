const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Rating {
    static tableName = 'ratings';

    /**
     * Rate a game
     */
    static async rate(userId, gameId, stars) {
        // Check existing rating
        const existing = await db(this.tableName)
            .where({ user_id: userId, game_id: gameId })
            .first();

        if (existing) {
            // Update existing rating
            const [rating] = await db(this.tableName)
                .where({ id: existing.id })
                .update({ stars, created_at: new Date() })
                .returning('*');
            return rating;
        }

        // Create new rating
        const [rating] = await db(this.tableName)
            .insert({
                id: uuidv4(),
                user_id: userId,
                game_id: gameId,
                stars,
                created_at: new Date()
            })
            .returning('*');

        return rating;
    }

    /**
     * Get user's rating for a game
     */
    static async getUserRating(userId, gameId) {
        return db(this.tableName)
            .where({ user_id: userId, game_id: gameId })
            .first();
    }

    /**
     * Get game's average rating
     */
    static async getGameStats(gameId) {
        const [stats] = await db(this.tableName)
            .where({ game_id: gameId })
            .select(
                db.raw('COALESCE(AVG(stars), 0) as avg_rating'),
                db.raw('COUNT(*) as total_ratings')
            );

        return {
            avg_rating: parseFloat(stats.avg_rating).toFixed(1),
            total_ratings: parseInt(stats.total_ratings)
        };
    }
}

class Comment {
    static tableName = 'comments';

    /**
     * Add comment to game
     */
    static async create(userId, gameId, content) {
        const [comment] = await db(this.tableName)
            .insert({
                id: uuidv4(),
                user_id: userId,
                game_id: gameId,
                content,
                created_at: new Date()
            })
            .returning('*');

        return comment;
    }

    /**
     * Get game comments
     */
    static async getByGame(gameId, { page = 1, limit = 10 }) {
        const offset = (page - 1) * limit;

        const comments = await db(this.tableName)
            .where({ game_id: gameId })
            .join('users', 'users.id', '=', `${this.tableName}.user_id`)
            .select(
                `${this.tableName}.id`,
                `${this.tableName}.content`,
                `${this.tableName}.created_at`,
                'users.id as user_id',
                'users.username',
                'users.avatar_url'
            )
            .orderBy(`${this.tableName}.created_at`, 'desc')
            .limit(limit)
            .offset(offset);

        const [{ count }] = await db(this.tableName)
            .where({ game_id: gameId })
            .count();

        // Format response
        const formattedComments = comments.map(c => ({
            id: c.id,
            content: c.content,
            created_at: c.created_at,
            user: {
                id: c.user_id,
                username: c.username,
                avatar_url: c.avatar_url
            }
        }));

        return {
            data: formattedComments,
            pagination: {
                page,
                limit,
                total: parseInt(count),
                totalPages: Math.ceil(parseInt(count) / limit)
            }
        };
    }

    /**
     * Delete comment (owner or admin)
     */
    static async delete(commentId, userId, isAdmin) {
        let query = db(this.tableName).where({ id: commentId });

        if (!isAdmin) {
            query = query.where({ user_id: userId });
        }

        return query.del();
    }
}

module.exports = { Rating, Comment };
