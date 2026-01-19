# 🔌 Thiết Kế API

## 1. Tổng Quan

### 1.1. API Specifications
- **Base URL:** `https://localhost:5000/api`
- **Format:** JSON
- **Authentication:** JWT Bearer Token
- **API Key:** Header `X-API-Key`

### 1.2. Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  }
}
```

**Paginated Response:**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

## 2. Authentication APIs

### 2.1. Đăng Ký

```
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "newuser",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

**Validation Rules:**
- `email`: Required, valid email format
- `username`: Required, 3-50 characters, alphanumeric + underscore
- `password`: Required, min 8 characters, must contain uppercase, lowercase, number
- `confirmPassword`: Must match password

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "newuser"
    },
    "token": "jwt_token_here"
  },
  "message": "Registration successful"
}
```

**Errors:**
- `400 VALIDATION_ERROR`: Input validation failed
- `409 EMAIL_EXISTS`: Email already registered
- `409 USERNAME_EXISTS`: Username already taken

---

### 2.2. Đăng Nhập

```
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "player1",
      "avatar_url": "https://...",
      "is_admin": false
    },
    "token": "jwt_token_here"
  },
  "message": "Login successful"
}
```

**Errors:**
- `400 VALIDATION_ERROR`: Missing fields
- `401 INVALID_CREDENTIALS`: Wrong email/password

---

### 2.3. Đăng Xuất

```
POST /api/auth/logout
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

### 2.4. Lấy Thông Tin User Hiện Tại

```
GET /api/auth/me
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "player1",
    "avatar_url": "https://...",
    "is_admin": false,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

---

## 3. User APIs

### 3.1. Tìm Kiếm Người Dùng

```
GET /api/users?search=keyword&page=1&limit=10
Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| search | string | - | Tìm theo username hoặc email |
| page | number | 1 | Trang hiện tại |
| limit | number | 10 | Số kết quả mỗi trang |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "username": "player1",
      "avatar_url": "https://..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

---

### 3.2. Lấy Profile User

```
GET /api/users/:id
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "player1",
    "avatar_url": "https://...",
    "created_at": "2024-01-01T00:00:00Z",
    "stats": {
      "total_games": 100,
      "total_wins": 65,
      "total_score": 15000,
      "achievements_count": 10
    }
  }
}
```

---

### 3.3. Cập Nhật Profile

```
PUT /api/users/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**
```json
{
  "username": "newusername",
  "avatar": <file>
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "newusername",
    "avatar_url": "https://new-avatar-url"
  },
  "message": "Profile updated successfully"
}
```

---

### 3.4. Lấy Thành Tựu Của User

```
GET /api/users/:id/achievements
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "First Win",
      "description": "Win your first game",
      "icon": "🏆",
      "unlocked_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": 2,
      "name": "Caro Master",
      "description": "Win 10 Caro games",
      "icon": "🎯",
      "unlocked_at": null
    }
  ]
}
```

---

## 4. Game APIs

### 4.1. Lấy Danh Sách Games

```
GET /api/games
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Caro Hàng 5",
      "type": "caro",
      "enabled": true,
      "config": {
        "boardSize": { "rows": 15, "cols": 15 },
        "winCondition": 5
      },
      "stats": {
        "total_plays": 1500,
        "avg_rating": 4.5
      }
    }
  ]
}
```

---

### 4.2. Lấy Chi Tiết Game

```
GET /api/games/:id
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Caro Hàng 5",
    "type": "caro",
    "enabled": true,
    "config": { ... },
    "instructions": "Đặt 5 quân liên tiếp...",
    "stats": {
      "total_plays": 1500,
      "avg_rating": 4.5,
      "total_ratings": 200
    },
    "comments": [
      {
        "id": "uuid",
        "user": { "id": "uuid", "username": "player1" },
        "content": "Great game!",
        "created_at": "2024-01-15"
      }
    ]
  }
}
```

---

### 4.3. Tạo Game Session (Start Game)

```
POST /api/games/:id/sessions
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "config": {
    "boardSize": { "rows": 15, "cols": 15 },
    "aiLevel": "medium"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "gameId": 1,
    "state": {
      "board": [[0,0,0,...], ...],
      "currentPlayer": 1,
      "moves": []
    },
    "score": 0,
    "time_spent": 0
  },
  "message": "Game session created"
}
```

---

### 4.4. Cập Nhật Game Session (Save Game)

```
PUT /api/games/sessions/:sessionId
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "state": {
    "board": [[0,1,0,...], ...],
    "currentPlayer": 2,
    "moves": [{"x": 7, "y": 7, "player": 1}]
  },
  "score": 100,
  "time_spent": 120,
  "completed": false
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "state": { ... },
    "score": 100,
    "time_spent": 120
  },
  "message": "Game saved successfully"
}
```

---

### 4.5. Load Game Session

```
GET /api/games/sessions/:sessionId
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "gameId": 1,
    "game": {
      "name": "Caro Hàng 5",
      "type": "caro"
    },
    "state": { ... },
    "score": 100,
    "time_spent": 120,
    "completed": false,
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

---

### 4.6. Lấy Saved Games Của User

```
GET /api/games/sessions?completed=false&page=1&limit=10
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "sessionId": "uuid",
      "game": { "id": 1, "name": "Caro Hàng 5" },
      "score": 100,
      "created_at": "2024-01-15",
      "updated_at": "2024-01-15"
    }
  ],
  "pagination": { ... }
}
```

---

### 4.7. Đánh Giá Game

```
POST /api/games/:id/ratings
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "stars": 5
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "stars": 5,
    "game_id": 1
  },
  "message": "Rating submitted"
}
```

---

### 4.8. Comment Game

```
POST /api/games/:id/comments
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "content": "This game is awesome!"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "content": "This game is awesome!",
    "user": {
      "id": "uuid",
      "username": "player1"
    },
    "created_at": "2024-01-15T10:30:00Z"
  },
  "message": "Comment posted"
}
```

---

## 5. Friend APIs

### 5.1. Lấy Danh Sách Bạn Bè

```
GET /api/friends?status=accepted&page=1&limit=10
Authorization: Bearer <token>
```

**Query Parameters:**
| Param | Type | Values | Description |
|-------|------|--------|-------------|
| status | string | pending, accepted, all | Lọc theo trạng thái |
| page | number | - | Trang |
| limit | number | - | Số lượng |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "friend": {
        "id": "uuid",
        "username": "player2",
        "avatar_url": "https://..."
      },
      "status": "accepted",
      "created_at": "2024-01-10"
    }
  ],
  "pagination": { ... }
}
```

---

### 5.2. Gửi Lời Mời Kết Bạn

```
POST /api/friends/request
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "friend_id": "uuid-of-user"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "friend_id": "uuid",
    "status": "pending"
  },
  "message": "Friend request sent"
}
```

**Errors:**
- `400 ALREADY_FRIENDS`: Already friends
- `400 REQUEST_EXISTS`: Request already sent

---

### 5.3. Chấp Nhận Lời Mời

```
PUT /api/friends/:requestId/accept
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "accepted"
  },
  "message": "Friend request accepted"
}
```

---

### 5.4. Từ Chối Lời Mời

```
PUT /api/friends/:requestId/reject
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Friend request rejected"
}
```

---

### 5.5. Hủy Kết Bạn

```
DELETE /api/friends/:friendId
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Friend removed"
}
```

---

## 6. Message APIs

### 6.1. Lấy Danh Sách Cuộc Hội Thoại

```
GET /api/messages/conversations?page=1&limit=10
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "user": {
        "id": "uuid",
        "username": "player2",
        "avatar_url": "https://..."
      },
      "last_message": {
        "content": "Hello!",
        "created_at": "2024-01-15T10:30:00Z",
        "is_mine": false
      },
      "unread_count": 2
    }
  ],
  "pagination": { ... }
}
```

---

### 6.2. Lấy Tin Nhắn Với Một User

```
GET /api/messages/:userId?page=1&limit=20
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "content": "Hello!",
      "sender_id": "uuid",
      "is_mine": false,
      "read": true,
      "created_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": "uuid",
      "content": "Hi there!",
      "sender_id": "my-uuid",
      "is_mine": true,
      "read": true,
      "created_at": "2024-01-15T10:31:00Z"
    }
  ],
  "pagination": { ... }
}
```

---

### 6.3. Gửi Tin Nhắn

```
POST /api/messages
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "receiver_id": "uuid",
  "content": "Hello, want to play a game?"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "content": "Hello, want to play a game?",
    "receiver_id": "uuid",
    "created_at": "2024-01-15T10:35:00Z"
  },
  "message": "Message sent"
}
```

---

### 6.4. Đánh Dấu Đã Đọc

```
PUT /api/messages/:messageId/read
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Message marked as read"
}
```

---

## 7. Ranking APIs

### 7.1. Ranking Theo Game (Toàn Hệ Thống)

```
GET /api/rankings/:gameId?page=1&limit=10
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "user": {
        "id": "uuid",
        "username": "CaroMaster",
        "avatar_url": "https://..."
      },
      "highest_score": 15000,
      "total_games": 100,
      "wins": 75
    }
  ],
  "pagination": { ... }
}
```

---

### 7.2. Ranking Bạn Bè

```
GET /api/rankings/:gameId/friends?page=1&limit=10
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "user": { ... },
      "highest_score": 12000
    }
  ],
  "pagination": { ... }
}
```

---

### 7.3. Ranking Cá Nhân (Lịch Sử)

```
GET /api/rankings/:gameId/personal?page=1&limit=10
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "session_id": "uuid",
      "score": 15000,
      "time_spent": 300,
      "completed_at": "2024-01-15"
    }
  ],
  "pagination": { ... }
}
```

---

## 8. Admin APIs

### 8.1. Dashboard Statistics

```
GET /api/admin/statistics
Authorization: Bearer <token>
X-Admin-Access: true
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 1000,
      "new_today": 15,
      "new_this_week": 80,
      "active_today": 250
    },
    "games": {
      "total_plays": 50000,
      "plays_today": 500,
      "most_popular": [
        { "id": 1, "name": "Caro Hàng 5", "plays": 15000 },
        { "id": 5, "name": "Ghép Hàng 3", "plays": 12000 }
      ]
    },
    "ratings": {
      "average": 4.3,
      "total": 5000
    }
  }
}
```

---

### 8.2. Quản Lý Users

```
GET /api/admin/users?search=&page=1&limit=10
Authorization: Bearer <token>
```

```
PUT /api/admin/users/:id
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "is_admin": true,
  "is_banned": false
}
```

```
DELETE /api/admin/users/:id
Authorization: Bearer <token>
```

---

### 8.3. Quản Lý Games

```
PUT /api/admin/games/:id
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "enabled": false,
  "config": {
    "boardSize": { "rows": 20, "cols": 20 },
    "winCondition": 5
  }
}
```

---

## 9. API Documentation

### Truy Cập API Docs

```
GET /api-docs
Header: X-API-Key: <your-api-key>
```

Swagger UI sẽ hiển thị với đầy đủ:
- Tất cả endpoints
- Request/Response schemas
- Try it out functionality
- Authentication

---

## 10. Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| VALIDATION_ERROR | 400 | Input validation failed |
| INVALID_CREDENTIALS | 401 | Wrong email/password |
| UNAUTHORIZED | 401 | Missing/invalid token |
| FORBIDDEN | 403 | Access denied |
| NOT_FOUND | 404 | Resource not found |
| EMAIL_EXISTS | 409 | Email already registered |
| USERNAME_EXISTS | 409 | Username already taken |
| ALREADY_FRIENDS | 400 | Already friends |
| SERVER_ERROR | 500 | Internal server error |
