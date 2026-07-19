# FullPrep API Documentation

This document provides a comprehensive list of all API endpoints in the FullPrep backend.

## aiRoutes.js
Base Path: `/api/ai`

| Method | Endpoint | Description/Handler |
|--------|----------|---------------------|
| `GET` | `/history` | getRecentHistory |
| `GET` | `/chat/:problemId` | getChatHistory |
| `POST` | `/chat/:problemId` | sendChatMessage |

## authRoutes.js
Base Path: `/api/auth`

| Method | Endpoint | Description/Handler |
|--------|----------|---------------------|
| `POST` | `/register` | register |
| `POST` | `/login` | login |
| `POST` | `/logout` | logout |
| `POST` | `/oauth` | oauthSignIn <br/>*Called by NextAuth to upsert OAuth users* |
| `POST` | `/forgot-password` | forgotPassword |
| `POST` | `/reset-password` | resetPassword |
| `GET` | `/verify-email` | verifyEmail <br/>*Email verification link handler* |
| `GET` | `/public/:id` | getPublicProfile <br/>*Public profile fetcher* |
| `GET` | `/me` | getMe |
| `GET` | `/stats` | getUserStats |
| `GET` | `/sidebar-stats` | getSidebarStats |
| `GET` | `/leaderboard` | getLeaderboard |
| `PATCH` | `/update-profile` | updateProfile |
| `PATCH` | `/update-password` | updatePassword |
| `GET` | `/sessions` | getSessions |
| `DELETE` | `/sessions/:id` | revokeSession |
| `GET` | `/export` | exportData |
| `POST` | `/resend-verification` | resendVerification |
| `POST` | `/sync-verification` | syncVerification |
| `POST` | `/create-password` | createPassword <br/>*OAuth-only users setting password for first time* |
| `GET` | `/admin-check` | res |

## contactRoutes.js
Base Path: `/api/contact`

| Method | Endpoint | Description/Handler |
|--------|----------|---------------------|
| `POST` | `/` | res |

## contestRoutes.js
Base Path: `/api/contests`

| Method | Endpoint | Description/Handler |
|--------|----------|---------------------|
| `GET` | `/` | getActiveContests |
| `GET` | `/daily` | getDailyContest |
| `GET` | `/weekly` | getWeeklyContest |
| `POST` | `/submit` | submitContestResult |
| `POST` | `/` | createContest |
| `GET` | `/admin` | getAdminContests |
| `GET` | `/:id` | getContestById |
| `PATCH` | `/:id` | updateContest |
| `DELETE` | `/:id` | deleteContest |

## friendRoutes.js
Base Path: `/api/friends`

| Method | Endpoint | Description/Handler |
|--------|----------|---------------------|
| `POST` | `/request/:id` | sendFriendRequest |
| `POST` | `/accept/:id` | acceptFriendRequest |
| `POST` | `/reject/:id` | rejectFriendRequest |
| `GET` | `/status/:id` | getFriendStatus |
| `GET` | `/` | getFriends |
| `GET` | `/requests` | getPendingRequests |

## healthRoutes.js
Base Path: `/api`

| Method | Endpoint | Description/Handler |
|--------|----------|---------------------|
| `GET` | `/health` | res |
| `GET` | `/ready` | res |

## jobRoutes.js
Base Path: `/api/jobs`

| Method | Endpoint | Description/Handler |
|--------|----------|---------------------|

## learningPathRoutes.js
Base Path: `/api/learning-paths`

| Method | Endpoint | Description/Handler |
|--------|----------|---------------------|
| `GET` | `/` | getLearningPaths |
| `GET` | `/:id` | getLearningPathById |
| `POST` | `/:id/enroll` | enrollInLearningPath |
| `POST` | `/` | createLearningPath |
| `PUT` | `/:id` | updateLearningPath |
| `DELETE` | `/:id` | deleteLearningPath |

## notificationRoutes.js
Base Path: `/api/notifications`

| Method | Endpoint | Description/Handler |
|--------|----------|---------------------|
| `GET` | `/` | getNotifications |
| `PATCH` | `/read-all` | markAllAsRead |
| `PATCH` | `/:id/read` | markAsRead |
| `DELETE` | `/clear-all` | clearAllNotifications |

## paymentRoutes.js
Base Path: `/api/payment`

| Method | Endpoint | Description/Handler |
|--------|----------|---------------------|
| `POST` | `/create-order` | createOrder |
| `POST` | `/verify` | verifyPayment |
| `GET` | `/history` | getPaymentHistory |

## problemRoutes.js
Base Path: `/api/problems`

| Method | Endpoint | Description/Handler |
|--------|----------|---------------------|
| `GET` | `/tags` | getTags |
| `GET` | `/stats` | getStats |
| `GET` | `/search` | searchProblems |
| `GET` | `/random` | getRandomProblem |
| `GET` | `/` | listProblems |
| `POST` | `/sync` | syncProblems |
| `GET` | `/sync/status` | getSyncStatus |
| `GET` | `/sync/history` | getSyncHistory |
| `POST` | `/` | createProblem |
| `GET` | `/bookmarks` | getBookmarkedProblems |
| `GET` | `/:id` | getProblem |
| `POST` | `/:id/bookmark` | toggleBookmark |
| `POST` | `/:id/vote` | voteProblem |
| `GET` | `/:id/tests` | getProblemTests |
| `PATCH` | `/:id` | updateProblem |
| `DELETE` | `/:id` | deleteProblem |
| `POST` | `/:id/rejudge` | rejudgeProblem |

## settingsRoutes.js
Base Path: `/api/settings`

| Method | Endpoint | Description/Handler |
|--------|----------|---------------------|

## submissionRoutes.js
Base Path: `/api/submissions`

| Method | Endpoint | Description/Handler |
|--------|----------|---------------------|
| `POST` | `/run` | runCode <br/>*Run button — public tests only (synchronous)* |
| `POST` | `/` | submitCode <br/>*Submit button — hidden tests (async + poll)* |
| `GET` | `/` | getSubmissions |
| `GET` | `/:id` | getSubmission |
| `POST` | `/:id/rejudge` | rejudgeSubmission |
| `PATCH` | `/:id/flag` | flagSubmission |
| `DELETE` | `/:id` | deleteSubmission |

## teamRoutes.js
Base Path: `/api/team`

| Method | Endpoint | Description/Handler |
|--------|----------|---------------------|

## userRoutes.js
Base Path: `/api/users`

| Method | Endpoint | Description/Handler |
|--------|----------|---------------------|
| `GET` | `/search` | searchUsers |
| `PUT` | `/profile` | updateProfile |
| `GET` | `/` | getUsers |
| `POST` | `/admin` | createAdminUser |
| `GET` | `/:id` | getUserById |
| `GET` | `/:id/stats` | getAdminUserStats |
| `PATCH` | `/:id/role` | updateUserRole |
| `PATCH` | `/:id/status` | updateUserStatus |
| `DELETE` | `/:id` | deleteUser |

