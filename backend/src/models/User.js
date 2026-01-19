const db = require('../config/database');

class User {
    static tableName = 'users';

    /**
     * Find user by ID
     */
    static async findById(id) {
        return db(this.tableName)
            .where({ id })
            .first();
    }

    /**
     * Find user by email
     */
    static async findByEmail(email) {
        return db(this.tableName)
            .where({ email: email.toLowerCase() })
            .first();
    }

    /**
     * Find user by username
     */
    static async findByUsername(username) {
        return db(this.tableName)
            .where({ username })
            .first();
    }

    /**
     * Create new user
     */
    static async create(userData) {
        const [user] = await db(this.tableName)
            .insert({
                ...userData,
                email: userData.email.toLowerCase(),
                created_at: new Date(),
                updated_at: new Date()
            })
            .returning('*');
        return user;
    }

    /**
     * Update user
     */
    static async update(id, userData) {
        const [user] = await db(this.tableName)
            .where({ id })
            .update({
                ...userData,
                updated_at: new Date()
            })
            .returning('*');
        return user;
    }

    /**
     * Delete user
     */
    static async delete(id) {
        return db(this.tableName)
            .where({ id })
            .del();
    }

    /**
     * Search users with pagination
     */
    static async search({ search, page = 1, limit = 10, excludeUserId }) {
        let query = db(this.tableName)
            .select('id', 'username', 'avatar_url', 'created_at');

        if (search) {
            query = query.where(function () {
                this.where('username', 'ilike', `%${search}%`)
                    .orWhere('email', 'ilike', `%${search}%`);
            });
        }

        if (excludeUserId) {
            query = query.whereNot('id', excludeUserId);
        }

        // Get total count
        const countQuery = query.clone();
        const [{ count }] = await countQuery.count();
        const total = parseInt(count);

        // Get paginated results
        const offset = (page - 1) * limit;
        const users = await query
            .orderBy('username', 'asc')
            .limit(limit)
            .offset(offset);

        return {
            data: users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Get all users (admin)
     */
    static async getAll({ page = 1, limit = 10, search }) {
        let query = db(this.tableName)
            .select('id', 'email', 'username', 'avatar_url', 'is_admin', 'created_at', 'updated_at');

        if (search) {
            query = query.where(function () {
                this.where('username', 'ilike', `%${search}%`)
                    .orWhere('email', 'ilike', `%${search}%`);
            });
        }

        const countQuery = query.clone();
        const [{ count }] = await countQuery.count();
        const total = parseInt(count);

        const offset = (page - 1) * limit;
        const users = await query
            .orderBy('created_at', 'desc')
            .limit(limit)
            .offset(offset);

        return {
            data: users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Get user stats
     */
    static async getStats(userId) {
        const [gamesStats] = await db('game_sessions')
            .where({ user_id: userId })
            .select(
                db.raw('COUNT(*) as total_games'),
                db.raw('SUM(CASE WHEN completed = true THEN 1 ELSE 0 END) as completed_games'),
                db.raw('COALESCE(SUM(score), 0) as total_score')
            );

        const [achievementCount] = await db('user_achievements')
            .where({ user_id: userId })
            .count('* as count');

        return {
            total_games: parseInt(gamesStats.total_games) || 0,
            completed_games: parseInt(gamesStats.completed_games) || 0,
            total_score: parseInt(gamesStats.total_score) || 0,
            achievements_count: parseInt(achievementCount.count) || 0
        };
    }
}

module.exports = User;
