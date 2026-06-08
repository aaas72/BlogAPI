# Full-Stack Blog Application (Monorepo)

A professional, feature-rich full-stack blog application built with **React (Vite)** on the frontend and **Node.js (Express)** with **MongoDB** on the backend. This project features robust user authentication, post management, nested comments, file uploads, advanced search, a custom analytics system, and an admin dashboard overview.

---

## 📁 Repository Structure

This is a Monorepo containing both the frontend client and the backend server:

```text
├── client/                 # Frontend React Application (Vite, custom CSS, API integrations)
│   ├── public/             # Static assets & icons
│   └── src/                # React components, pages, hooks, contexts, & services
│
├── server/                 # Backend Node.js / Express API
│   ├── config/             # Database connection & Winston logger configuration
│   ├── controllers/        # Core business logic (Auth, Posts, Comments, Admin, Analytics, Search)
│   ├── middleware/         # Custom Express middlewares (Auth, Admin validation, Uploads, Analytics, Logging)
│   ├── models/             # Mongoose Schemas (User, Post, Comment, Analytics)
│   ├── routes/             # Express routes defining API endpoints
│   ├── scripts/            # Database seeding scripts (seed.js)
│   └── sql/                # SQL schema backups (MySQL/PostgreSQL)
│
└── README.md               # Root Project Documentation
```

---

## 🚀 Key Features

### 🔒 Authentication & Users
*   Secure user registration and login using **JWT (JSON Web Tokens)**.
*   Password hashing using **bcryptjs**.
*   Profile editing (update name, email, and upload profile avatar).
*   Role-based access control (`user` and `admin`).

### 📝 Post & Content Management
*   Full CRUD operations on posts.
*   Support for draft, published, and archived states.
*   Like and unlike posts.
*   Automated reading time calculation based on word count.
*   Excerpt generation from content.

### 💬 Nested Comments System
*   Comment on posts with support for nested replies.
*   Like and unlike comments.
*   Admin moderation (approved, pending, or rejected statuses).

### 🔍 Advanced Search Engine
*   **Quick Title Search:** Dynamic suggestion search for autocompletion.
*   **Advanced Search:** Search by query in Title, Content, or Tags using MongoDB regex. Filter by author, tags, date range, minimum views, and sort by date or popularity.

### 🖼️ File Upload System
*   Profile avatar upload.
*   Single cover image upload for posts.
*   Multi-image upload (up to 5 files).
*   Integrated with **Multer** and image buffer processors for security and resizing.

### 📊 Analytics & Tracking System
*   Session-based page view and post view tracking.
*   Device type detection (Desktop, Mobile, Tablet).
*   Custom event logging.
*   Search keyword analytic reports for administrator insights.

---

## 🛠️ Installation & Setup

### Prerequisites
*   [Node.js](https://nodejs.org/) (v16+ recommended)
*   [MongoDB](https://www.mongodb.com/try/download/community) (Local instance or MongoDB Atlas URI)

### 1. Server Configuration & Run
1.  Navigate to the `server/` directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a environment configuration file at `server/config/.env` with the following variables:
    ```env
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/blog_app_db
    JWT_SECRET=your_jwt_secret_key_here
    SESSION_SECRET=your_session_secret_key_here
    NODE_ENV=development
    ```
4.  *(Optional)* Seed the database with mock Turkish content for testing:
    ```bash
    npm run seed
    ```
5.  Start the development server:
    ```bash
    npm run dev
    ```

### 2. Client Configuration & Run
1.  Navigate to the `client/` directory:
    ```bash
    cd ../client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `client/` directory:
    ```env
    VITE_API_URL=http://localhost:5000/api
    ```
4.  Start the client development server:
    ```bash
    npm run dev
    ```

---

## 🔌 API Endpoints Reference

### 🔑 Authentication Service (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new user |
| `POST` | `/api/auth/login` | Public | Authenticate user & get token |
| `GET` | `/api/auth/me` | Protected | Get current user's profile |
| `PUT` | `/api/auth/profile` | Protected | Update profile information |

### 📝 Posts Service (`/api/posts`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/posts/` | Public | Get all posts (supports query filters) |
| `GET` | `/api/posts/:id` | Public | Get single post detail & track view |
| `GET` | `/api/posts/me/posts`| Protected | Get posts written by current user |
| `POST` | `/api/posts/` | Protected | Create a new blog post |
| `PUT` | `/api/posts/:id` | Protected | Update a post (author only) |
| `DELETE`| `/api/posts/:id` | Protected | Delete a post (author or admin) |
| `POST` | `/api/posts/:id/like`| Protected | Toggle like/unlike on a post |

### 💬 Comments Service (`/api/comments`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/comments/post/:postId` | Public | Get approved comments for a post |
| `GET` | `/api/comments/:id/replies` | Public | Get replies for a parent comment |
| `GET` | `/api/comments/me` | Protected | Get comments created by current user |
| `POST` | `/api/comments/post/:postId` | Protected | Add a comment or reply to a post |
| `PUT` | `/api/comments/:id` | Protected | Update a comment |
| `DELETE`| `/api/comments/:id` | Protected | Delete a comment and its replies |
| `POST` | `/api/comments/:id/like` | Protected | Toggle like on a comment |

### 🔍 Search Service (`/api/search`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/search/posts` | Public | Advanced post search with filters |
| `GET` | `/api/search/titles` | Public | Fast title lookup (suggestions) |
| `GET` | `/api/search/tags` | Public | Retrieve popular tags |
| `GET` | `/api/search/stats` | Protected | Basic blog statistical overview |
| `GET` | `/api/search/comments` | Protected | Query and filter comment contents |

### 🖼️ Upload Service (`/api/upload`)
| Method | Endpoint | Access | Form-Data Key | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/upload/avatar` | Protected | `avatar` (File) | Upload user avatar image |
| `POST` | `/api/upload/post-image` | Protected | `image` (File) | Upload post cover image |
| `POST` | `/api/upload/multiple` | Protected | `files` (Files) | Upload multiple files (max 5) |

### 📊 Analytics Service (`/api/analytics`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/analytics/track` | Public | Log a custom tracking event |
| `GET` | `/api/analytics/post/:postId`| Protected | Detailed analytics report for a post |
| `GET` | `/api/analytics/dashboard` | Admin Only | Full dashboard analytics over N days |
| `GET` | `/api/analytics/search` | Admin Only | Query report on user search keywords |

### 🛠️ Admin Moderation Service (`/api/admin`)
*(All admin endpoints require an administrator account)*
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | Overview statistics & recent activities |
| `GET` | `/api/admin/users` | List users with pagination and search |
| `PUT` | `/api/admin/users/:userId/status` | Change user status (`isActive`) or role |
| `DELETE`| `/api/admin/users/:userId` | Delete user and all their associated content |
| `GET` | `/api/admin/posts` | Fetch all posts with statuses |
| `PUT` | `/api/admin/posts/:postId/status` | Update post status (`published`, `draft`, `archived`) |
| `DELETE`| `/api/admin/posts/:postId` | Delete post and its comments |
| `GET` | `/api/admin/comments` | Fetch all comments |
| `PUT` | `/api/admin/comments/:commentId/status`| Moderate comment status (`approved`, `pending`, `rejected`) |
| `DELETE`| `/api/admin/comments/:commentId` | Delete a comment |

---

## ⚡ MongoDB Aggregations & Index Optimization

### Text Indexing
In `Post.js`, text indexes are registered on search fields to facilitate fast query planning:
```javascript
PostSchema.index({
  title: 'text', 
  content: 'text', 
  tags: 'text' 
});
PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.index({ status: 1, createdAt: -1 });
```

### Daily Statistical Aggregation
For rendering reports in the Admin Panel, MongoDB's aggregation pipeline transforms raw events into daily metrics by matching events, parsing dates, grouping, and sorting:
```javascript
const dailyStats = await AnalyticsEvent.aggregate([
  { $match: { event: "page_view", createdAt: { $gte: startDate } } },
  {
    $group: {
      _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
      views: { $sum: 1 },
      uniqueVisitors: { $addToSet: "$sessionId" }
    }
  },
  {
    $project: {
      date: "$_id",
      views: 1,
      uniqueVisitors: { $size: "$uniqueVisitors" },
      _id: 0
    }
  },
  { $sort: { date: 1 } }
]);
```
