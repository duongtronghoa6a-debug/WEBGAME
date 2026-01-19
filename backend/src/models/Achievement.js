const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Achievement {
    static tableName = 'achievements';
    static userAchievementsTable = 'user_achievements';

    /**
     * Get all achievements
     */
    static async getAll() {
        return db(this.tableName).orderBy('id', 'asc');
    }

    /**
     * Get user achievements
     */
    static async getUserAchievements(userId) {
        const achievements = await db(this.tableName)
            .leftJoin(
                this.userAchievementsTable,
                function () {
                    this.on(`${Achievement.tableName}.id`, '=', `${Achievement.userAchievementsTable}.achievement_id`)
                        .andOn(`${Achievement.userAchievementsTable}.user_id`, '=', db.raw('?', [userId]));
                }
            )
            .select(
                `${this.tableName}.*`,
                `${this.userAchievementsTable}.unlocked_at`
            )
            .orderBy(`${this.tableName}.id`, 'asc');

        return achievements;
    }

    /**
     * Unlock achievement for user
     */
    static async unlock(userId, achievementId) {
        // Check if already unlocked
        const existing = await db(this.userAchievementsTable)
            .where({ user_id: userId, achievement_id: achievementId })
            .first();

        if (existing) return existing;

        const [userAchievement] = await db(this.userAchievementsTable)
            .insert({
                id: uuidv4(),
                user_id: userId,
                achievement_id: achievementId,
                unlocked_at: new Date()
            })
            .returning('*');

        return userAchievement;
    }

    /**
     * Check and unlock achievements based on user stats
     */
    static async checkAndUnlock(userId) {
        const achievements = await db(this.tableName);
        const unlocked = [];

        for (const achievement of achievements) {
            const criteria = achievement.criteria;
            let shouldUnlock = false;

            switch (criteria.type) {
                case 'game_wins':
                    const [{ count: wins }] = await db('game_sessions')
                        .where({ user_id: userId, completed: true })
                        .modify((qb) => {
                            if (criteria.gameId) qb.where({ game_id: criteria.gameId });
                        })
                        .count();
                    shouldUnlock = parseInt(wins) >= criteria.count;
                    break;

                case 'total_score':
                    const [{ sum: score }] = await db('game_sessions')
                        .where({ user_id: userId })
                        .sum('score');
                    shouldUnlock = (parseInt(score) || 0) >= criteria.score;
                    break;

                case 'friends_count':
                    const friendCount = await db('friends')
                        .where(function () {
                            this.where({ user_id: userId, status: 'accepted' })
                                .orWhere({ friend_id: userId, status: 'accepted' });
                        })
                        .count();
                    shouldUnlock = parseInt(friendCount[0].count) >= criteria.count;
                    break;
            }

            if (shouldUnlock) {
                const result = await this.unlock(userId, achievement.id);
                if (result) unlocked.push(achievement);
            }
        }

        return unlocked;
    }
}

module.exports = Achievement;
