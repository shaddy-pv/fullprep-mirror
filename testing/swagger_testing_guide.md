# 🚀 FullPrep Swagger Testing Master Guide

This document is your ultimate cheat sheet for testing all **80+ endpoints** in your Swagger UI (`http://localhost:3000/api-docs`). 

> [!IMPORTANT]  
> **First Step: Authentication (The 🔒 Icon)**  
> Most APIs require you to be logged in. Before testing protected routes:
> 1. Go to `POST /api/auth/login`.
> 2. Click **Try it out**, enter your email/password in the JSON body, and click **Execute**.
> 3. Copy the `token` from the response.
> 4. Scroll to the top of the Swagger page, click the green **Authorize** button (or any 🔒 icon), and paste the token. Now you can test all private routes!

---

## 🛡️ 1. Auth APIs (`/api/auth`)
*Handles user registration, login, and profile fetching.*

| Endpoint | Method | Parameters / Body Needed | What it does |
|---|---|---|---|
| `/api/auth/register` | `POST` | `name`, `email`, `password` | Creates a new user account. |
| `/api/auth/login` | `POST` | `email`, `password` | Logs in and gives you the JWT Token. |
| `/api/auth/me` | `GET` | **🔒 Token Only** | Fetches the currently logged-in user's profile. |
| `/api/auth/update-profile` | `PATCH` | (Optional) `name`, `bio`, etc. | Updates the user's profile info. |
| `/api/auth/forgot-password` | `POST` | `email` | Triggers a password reset email. |

---

## 🧩 2. Problem APIs (`/api/problems`)
*Core coding problems management.*

| Endpoint | Method | Parameters / Body Needed | What it does |
|---|---|---|---|
| `/api/problems` | `GET` | (Optional) `page`, `limit`, `difficulty`, `tags` | Lists problems. Try `page=1`, `limit=10`. |
| `/api/problems/{id}` | `GET` | URL: `id` (e.g. `60b9...`) | Fetches a specific problem by its ID. |
| `/api/problems/tags` | `GET` | None | Lists all available problem tags (e.g., Array, DP). |
| `/api/problems/random` | `GET` | None | Fetches a random problem to solve. |
| `/api/problems/{id}/bookmark` | `POST` | **🔒 Token**, URL: `id` | Toggles bookmarking a problem. |
| `/api/problems/{id}/vote` | `POST` | **🔒 Token**, Body: `{ "vote": 1 }` | Upvotes (`1`) or downvotes (`-1`) a problem. |
| `/api/problems` | `POST` | **🔒 Admin Token**, Body: `name`, `description` | Creates a new custom problem. |
| `/api/problems/sync` | `POST` | **🔒 Admin Token**, Body: `{ "mode": "ALL" }` | Syncs problems from the upstream server. |

---

## 💻 3. Submission APIs (`/api/submissions`)
*Where users run and submit their code.*

| Endpoint | Method | Parameters / Body Needed | What it does |
|---|---|---|---|
| `/api/submissions/run` | `POST` | **🔒 Token**, Body: `code`, `languageId`, `problemId` | Runs code against public test cases only. |
| `/api/submissions` | `POST` | **🔒 Token**, Body: `code`, `languageId`, `problemId` | Submits code for full hidden evaluation. |
| `/api/submissions` | `GET` | **🔒 Token**, Query: `page`, `limit` | Gets the user's submission history. |
| `/api/submissions/{id}` | `GET` | **🔒 Token**, URL: `id` | Gets details of a specific past submission. |
| `/api/submissions/{id}/rejudge` | `POST`| **🔒 Admin Token**, URL: `id` | Forces a re-evaluation of a submission. |

---

## 👥 4. User APIs (`/api/users`)
*Admin controls and user searching.*

| Endpoint | Method | Parameters / Body Needed | What it does |
|---|---|---|---|
| `/api/users/search` | `GET` | Query: `q` (Search term) | Searches for users by name or email. |
| `/api/users` | `GET` | **🔒 Admin Token**, Query: `page`, `limit` | Lists all users in the system. |
| `/api/users/{id}` | `GET` | **🔒 Admin Token**, URL: `id` | Gets details of a specific user. |
| `/api/users/admin` | `POST` | **🔒 Admin Token**, Body: `name`, `email`, `password`, `role` | Creates a new admin or mentor user. |
| `/api/users/{id}/role` | `PATCH` | **🔒 Admin Token**, URL: `id`, Body: `role` | Promotes/demotes a user. |
| `/api/users/{id}/status`| `PATCH` | **🔒 Admin Token**, URL: `id`, Body: `isActive` | Bans or unbans a user. |

---

## 🏆 5. Contest APIs (`/api/contests`)
*Daily/Weekly challenges and leaderboards.*

| Endpoint | Method | Parameters / Body Needed | What it does |
|---|---|---|---|
| `/api/contests` | `GET` | None | Lists active and upcoming contests. |
| `/api/contests/daily` | `GET` | None | Gets the daily challenge. |
| `/api/contests/weekly`| `GET` | None | Gets the weekly challenge. |
| `/api/contests/submit`| `POST` | **🔒 Token**, Body: `contestId`, `timeTaken` | Submits the user's contest result/score. |
| `/api/contests` | `POST` | **🔒 Admin Token**, Body: `title`, `type`, `startTime`, `endTime` | Creates a new contest. |

---

## 🤝 6. Friend APIs (`/api/friends`)
*Social connectivity.*

> [!TIP]
> None of the `GET` requests in this section require parameters because they automatically use your 🔒 Token to figure out who you are!

| Endpoint | Method | Parameters / Body Needed | What it does |
|---|---|---|---|
| `/api/friends` | `GET` | **🔒 Token Only** | Lists all your accepted friends. |
| `/api/friends/requests`| `GET` | **🔒 Token Only** | Lists people who sent you friend requests. |
| `/api/friends/request/{id}`| `POST` | **🔒 Token**, URL: `id` | Sends a friend request to a user ID. |
| `/api/friends/accept/{id}`| `POST` | **🔒 Token**, URL: `id` | Accepts a pending friend request from a user ID. |
| `/api/friends/reject/{id}`| `POST` | **🔒 Token**, URL: `id` | Rejects a pending friend request. |

---

## 📚 7. Learning Path APIs (`/api/learning-paths`)
*Curated coding curriculums.*

| Endpoint | Method | Parameters / Body Needed | What it does |
|---|---|---|---|
| `/api/learning-paths` | `GET` | None (Token optional for progress) | Lists all learning paths. |
| `/api/learning-paths/{id}`| `GET`| URL: `id` | Gets details for a specific learning path. |
| `/api/learning-paths/{id}/enroll`| `POST`| **🔒 Token**, URL: `id` | Enrolls you in the learning path. |
| `/api/learning-paths` | `POST`| **🔒 Admin Token**, Body: `title`, `description`, `modules` | Creates a new learning path curriculum. |

---

## 🔔 8. Notification APIs (`/api/notifications`)
*In-app alerts.*

| Endpoint | Method | Parameters / Body Needed | What it does |
|---|---|---|---|
| `/api/notifications` | `GET` | **🔒 Token Only** | Fetches your notifications. |
| `/api/notifications/{id}/read`| `PATCH`| **🔒 Token**, URL: `id` | Marks a specific notification as read. |
| `/api/notifications/read-all`| `PATCH`| **🔒 Token Only** | Marks all notifications as read. |
| `/api/notifications/clear-all`| `DELETE`| **🔒 Token Only** | Deletes all your notifications. |

---

## 💳 9. Payment APIs (`/api/payment`)
*Razorpay integrations.*

| Endpoint | Method | Parameters / Body Needed | What it does |
|---|---|---|---|
| `/api/payment/create-order` | `POST` | **🔒 Token Only** | Generates a Razorpay Order ID for purchase. |
| `/api/payment/verify` | `POST` | **🔒 Token**, Body: `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature` | Verifies successful payment. |
| `/api/payment/history` | `GET` | **🔒 Token Only** | Lists your past purchases. |

---

## 🤖 10. AI APIs (`/api/ai`)
*AI Mentor integrations.*

| Endpoint | Method | Parameters / Body Needed | What it does |
|---|---|---|---|
| `/api/ai/history` | `GET` | **🔒 Token Only** | Fetches your recent AI conversations. |
| `/api/ai/chat/{problemId}`| `GET` | **🔒 Token**, URL: `problemId` | Fetches chat history for a specific problem. |
| `/api/ai/chat/{problemId}`| `POST`| **🔒 Token**, URL: `problemId`, Body: `{ "message": "Help me!" }` | Sends a message to the AI for help. |

---

## 🩺 11. Misc APIs (Health, Contact, Settings)

| Endpoint | Method | Parameters / Body Needed | What it does |
|---|---|---|---|
| `/api/health` | `GET` | None | Checks if the server is alive. |
| `/api/contact` | `POST` | Form-Data: `name`, `email`, `subject`, `message`, `resume` | Submits the contact us form. |
| `/api/team` | `GET` | None | Lists team members. |
| `/api/settings` | `GET` / `PUT` | **🔒 Admin Token** | Gets/Updates global platform settings. |

---

## 💡 Quick Tips for Testing in Swagger
1. **Required vs Optional:** If a field has a red asterisk `*` in Swagger, you MUST fill it. If not, you can delete it from the JSON body if you want.
2. **Path Parameters:** Things in the URL like `{id}` or `{problemId}` will show up as input text boxes in Swagger. You must paste a valid MongoDB ObjectId (like `6a3105cb850252cffbbd5168`) there.
3. **Empty Bodies:** If you click "Try it out" and the body is pre-filled with `{}` but the API doesn't actually need a body (like `GET` requests), just leave it alone and click Execute.
