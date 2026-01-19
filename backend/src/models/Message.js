const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Message {
    static tableName = 'messages';

    /**
     * Send message
     */
    static async send(senderId, receiverId, content) {
        const [message] = await db(this.tableName)
            .insert({
                id: uuidv4(),
                sender_id: senderId,
                receiver_id: receiverId,
                content,
                read: false,
                created_at: new Date()
            })
            .returning('*');

        return message;
    }

    /**
     * Get conversations list
     */
    static async getConversations(userId, { page = 1, limit = 10 }) {
        // Get distinct users that have exchanged messages with current user
        const conversations = await db.raw(`
      SELECT DISTINCT ON (other_user_id)
        CASE 
          WHEN sender_id = ? THEN receiver_id 
          ELSE sender_id 
        END as other_user_id,
        content as last_message,
        created_at,
        CASE WHEN sender_id = ? THEN true ELSE false END as is_mine
      FROM ${this.tableName}
      WHERE sender_id = ? OR receiver_id = ?
      ORDER BY other_user_id, created_at DESC
    `, [userId, userId, userId, userId]);

        const conversationData = conversations.rows;

        // Get user details and unread counts
        const withDetails = await Promise.all(
            conversationData.map(async (conv) => {
                const user = await db('users')
                    .where({ id: conv.other_user_id })
                    .select('id', 'username', 'avatar_url')
                    .first();

                const [{ count }] = await db(this.tableName)
                    .where({ sender_id: conv.other_user_id, receiver_id: userId, read: false })
                    .count();

                return {
                    user,
                    last_message: {
                        content: conv.last_message,
                        created_at: conv.created_at,
                        is_mine: conv.is_mine
                    },
                    unread_count: parseInt(count)
                };
            })
        );

        // Sort by last message time
        withDetails.sort((a, b) =>
            new Date(b.last_message.created_at) - new Date(a.last_message.created_at)
        );

        // Paginate
        const offset = (page - 1) * limit;
        const paginated = withDetails.slice(offset, offset + limit);

        return {
            data: paginated,
            pagination: {
                page,
                limit,
                total: withDetails.length,
                totalPages: Math.ceil(withDetails.length / limit)
            }
        };
    }

    /**
     * Get messages with specific user
     */
    static async getWithUser(userId, otherUserId, { page = 1, limit = 20 }) {
        const offset = (page - 1) * limit;

        const messages = await db(this.tableName)
            .where(function () {
                this.where({ sender_id: userId, receiver_id: otherUserId })
                    .orWhere({ sender_id: otherUserId, receiver_id: userId });
            })
            .select(
                'id',
                'content',
                'sender_id',
                'read',
                'created_at',
                db.raw(`CASE WHEN sender_id = '${userId}' THEN true ELSE false END as is_mine`)
            )
            .orderBy('created_at', 'desc')
            .limit(limit)
            .offset(offset);

        const [{ count }] = await db(this.tableName)
            .where(function () {
                this.where({ sender_id: userId, receiver_id: otherUserId })
                    .orWhere({ sender_id: otherUserId, receiver_id: userId });
            })
            .count();

        return {
            data: messages.reverse(), // Chronological order
            pagination: {
                page,
                limit,
                total: parseInt(count),
                totalPages: Math.ceil(parseInt(count) / limit)
            }
        };
    }

    /**
     * Mark message as read
     */
    static async markAsRead(messageId, userId) {
        const [message] = await db(this.tableName)
            .where({ id: messageId, receiver_id: userId })
            .update({ read: true })
            .returning('*');

        return message;
    }

    /**
     * Mark all messages from user as read
     */
    static async markAllAsRead(userId, senderId) {
        return db(this.tableName)
            .where({ receiver_id: userId, sender_id: senderId, read: false })
            .update({ read: true });
    }

    /**
     * Get unread count
     */
    static async getUnreadCount(userId) {
        const [{ count }] = await db(this.tableName)
            .where({ receiver_id: userId, read: false })
            .count();

        return parseInt(count);
    }
}

module.exports = Message;
