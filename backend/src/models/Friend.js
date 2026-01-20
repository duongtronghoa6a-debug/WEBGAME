const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Friend {
    static tableName = 'friends';

    /**
     * Send friend request
     */
    static async sendRequest(userId, friendId) {
        // Check if request already exists (in either direction)
        const existing = await db(this.tableName)
            .where(function () {
                this.where({ user_id: userId, friend_id: friendId })
                    .orWhere({ user_id: friendId, friend_id: userId });
            })
            .first();

        if (existing) {
            return { error: 'REQUEST_EXISTS', existing };
        }

        const [request] = await db(this.tableName)
            .insert({
                id: uuidv4(),
                user_id: userId,
                friend_id: friendId,
                status: 'pending',
                created_at: new Date()
            })
            .returning('*');

        return { success: true, data: request };
    }

    /**
     * Accept friend request
     */
    static async acceptRequest(requestId, userId) {
        const [request] = await db(this.tableName)
            .where({ id: requestId, friend_id: userId, status: 'pending' })
            .update({ status: 'accepted' })
            .returning('*');

        return request;
    }

    /**
     * Reject friend request
     */
    static async rejectRequest(requestId, userId) {
        return db(this.tableName)
            .where({ id: requestId, friend_id: userId, status: 'pending' })
            .del();
    }

    /**
     * Remove friend
     */
    static async removeFriend(userId, friendId) {
        return db(this.tableName)
            .where(function () {
                this.where({ user_id: userId, friend_id: friendId })
                    .orWhere({ user_id: friendId, friend_id: userId });
            })
            .where({ 'friends.status': 'accepted' })
            .del();
    }

    /**
     * Get user's friends list
     */
    static async getFriends(userId, { status = 'accepted', page = 1, limit = 10 }) {
        // Get friends where user is either sender or receiver
        let query = db(this.tableName)
            .where(function () {
                this.where({ user_id: userId })
                    .orWhere({ friend_id: userId });
            });

        if (status !== 'all') {
            query = query.where({ 'friends.status': status });
        }

        const countQuery = query.clone();
        const [{ count }] = await countQuery.count();
        const total = parseInt(count);

        const offset = (page - 1) * limit;
        const friendships = await query
            .orderBy('created_at', 'desc')
            .limit(limit)
            .offset(offset);

        // Get friend details
        const friendsWithDetails = await Promise.all(
            friendships.map(async (f) => {
                const friendUserId = f.user_id === userId ? f.friend_id : f.user_id;
                const friend = await db('users')
                    .where({ id: friendUserId })
                    .select('id', 'username', 'avatar_url')
                    .first();

                return {
                    id: f.id,
                    friend,
                    status: f.status,
                    is_sender: f.user_id === userId,
                    created_at: f.created_at
                };
            })
        );

        return {
            data: friendsWithDetails,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Get pending requests (received)
     */
    static async getPendingRequests(userId, { page = 1, limit = 10 }) {
        const offset = (page - 1) * limit;

        const requests = await db(this.tableName)
            .where({ friend_id: userId, 'friends.status': 'pending' })
            .join('users', 'users.id', '=', `${this.tableName}.user_id`)
            .select(
                `${this.tableName}.id`,
                `${this.tableName}.created_at`,
                'users.id as sender_id',
                'users.username as sender_username',
                'users.avatar_url as sender_avatar'
            )
            .orderBy(`${this.tableName}.created_at`, 'desc')
            .limit(limit)
            .offset(offset);

        const [{ count }] = await db(this.tableName)
            .where({ friend_id: userId, 'friends.status': 'pending' })
            .count();

        return {
            data: requests,
            pagination: {
                page,
                limit,
                total: parseInt(count),
                totalPages: Math.ceil(parseInt(count) / limit)
            }
        };
    }

    /**
     * Get friend IDs for a user
     */
    static async getFriendIds(userId) {
        const friendships = await db(this.tableName)
            .where(function () {
                this.where({ user_id: userId })
                    .orWhere({ friend_id: userId });
            })
            .where({ 'friends.status': 'accepted' });

        return friendships.map(f =>
            f.user_id === userId ? f.friend_id : f.user_id
        );
    }

    /**
     * Check friendship status
     */
    static async checkStatus(userId, otherUserId) {
        const friendship = await db(this.tableName)
            .where(function () {
                this.where({ user_id: userId, friend_id: otherUserId })
                    .orWhere({ user_id: otherUserId, friend_id: userId });
            })
            .first();

        if (!friendship) return { status: 'none' };

        return {
            status: friendship.status,
            is_sender: friendship.user_id === userId,
            request_id: friendship.id
        };
    }
}

module.exports = Friend;
