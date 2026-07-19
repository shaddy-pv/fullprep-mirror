# 🚀 FullPrep Complete Postman Testing Guide

This is your master manual for setting up, organizing, and testing all **80+ APIs** of the FullPrep backend using Postman. Follow this guide to build a robust Postman Workspace.

---

## 🛠️ Step 1: Initial Postman Setup

### 1. Create a Postman Environment
Instead of hardcoding URLs and tokens, create a Postman Environment (e.g., `FullPrep Local`):
1. In Postman, go to **Environments** (left sidebar) -> **Create Environment**.
2. Add the following Variables:
   - `base_url` : `http://localhost:3000/api`
   - `token` : *(leave empty, we will automate this)*
   - `admin_token` : *(leave empty)*
   - `problem_id` : *(leave empty)*
   - `user_id` : *(leave empty)*
3. Make sure to **select this environment** in the top-right dropdown!

### 2. Automate Authentication (Crucial!)
To avoid copying and pasting your token 80 times, do this for your **Login** request:
1. Create a request to login (`POST {{base_url}}/auth/login`).
2. Go to the **Tests** tab of that request.
3. Paste this code:
   ```javascript
   if (pm.response.code === 200) {
       var jsonData = pm.response.json();
       // Assuming the response has the token at jsonData.token
       pm.environment.set("token", jsonData.token);
       if (jsonData.user && jsonData.user.role === 'admin') {
           pm.environment.set("admin_token", jsonData.token);
       }
   }
   ```
4. Now, every time you login, Postman automatically saves your token!

### 3. Setup Collection-Level Authorization
1. Create a Collection called **FullPrep API**.
2. Click on the Collection name, go to the **Authorization** tab.
3. Type: `Bearer Token`.
4. Token: `{{token}}` (or `{{admin_token}}` for the Admin folder).
5. Now, *every* request inside this collection will automatically be authenticated.

---

## 📂 Step 2: The 80+ API Collection Structure

Create folders inside your "FullPrep API" collection exactly like this. 

### 🛡️ 1. Auth Folder
- **Register** (`POST {{base_url}}/auth/register`)
  - **Body (raw JSON):** `{ "name": "Test User", "email": "test@test.com", "password": "password123" }`
- **Login** (`POST {{base_url}}/auth/login`)
  - **Body (raw JSON):** `{ "email": "test@test.com", "password": "password123" }`
  - *(Remember to add the Tests script from Step 1 here!)*
- **Get Me** (`GET {{base_url}}/auth/me`)
- **Update Profile** (`PATCH {{base_url}}/auth/update-profile`)
  - **Body:** `{ "bio": "Hello World" }`

### 🧩 2. Problems Folder
- **Get All Problems** (`GET {{base_url}}/problems?page=1&limit=10`)
- **Get Single Problem** (`GET {{base_url}}/problems/{{problem_id}}`)
- **Get Tags** (`GET {{base_url}}/problems/tags`)
- **Get Random** (`GET {{base_url}}/problems/random`)
- **Toggle Bookmark** (`POST {{base_url}}/problems/{{problem_id}}/bookmark`)
- **Vote** (`POST {{base_url}}/problems/{{problem_id}}/vote`)
  - **Body:** `{ "vote": 1 }`
- **[Admin] Create Problem** (`POST {{base_url}}/problems`)
  - **Body:** `{ "name": "Two Sum", "description": "...", "difficulty": "Easy" }`
- **[Admin] Sync** (`POST {{base_url}}/problems/sync`)

### 💻 3. Submissions Folder
- **Run Code** (`POST {{base_url}}/submissions/run`)
  - **Body:** `{ "code": "console.log('hi');", "languageId": 63, "problemId": "{{problem_id}}" }`
- **Submit Code** (`POST {{base_url}}/submissions`)
  - **Body:** `{ "code": "console.log('hi');", "languageId": 63, "problemId": "{{problem_id}}" }`
- **Get My History** (`GET {{base_url}}/submissions`)
- **Get Single Submission** (`GET {{base_url}}/submissions/{submission_id}`)
- **[Admin] Rejudge** (`POST {{base_url}}/submissions/{submission_id}/rejudge`)

### 👥 4. Users Folder
- **Search** (`GET {{base_url}}/users/search?q=john`)
- **[Admin] List Users** (`GET {{base_url}}/users`)
- **[Admin] Get User** (`GET {{base_url}}/users/{{user_id}}`)
- **[Admin] Create Admin** (`POST {{base_url}}/users/admin`)
- **[Admin] Change Role** (`PATCH {{base_url}}/users/{{user_id}}/role`)
  - **Body:** `{ "role": "mentor" }`
- **[Admin] Ban User** (`PATCH {{base_url}}/users/{{user_id}}/status`)
  - **Body:** `{ "isActive": false }`

### 🏆 5. Contests Folder
- **Active Contests** (`GET {{base_url}}/contests`)
- **Daily** (`GET {{base_url}}/contests/daily`)
- **Weekly** (`GET {{base_url}}/contests/weekly`)
- **Submit Contest** (`POST {{base_url}}/contests/submit`)
  - **Body:** `{ "contestId": "...", "timeTaken": 3600 }`
- **[Admin] Create Contest** (`POST {{base_url}}/contests`)
  - **Body:** `{ "title": "Summer Code", "type": "Weekly", "startTime": "2026-08-01T00:00:00Z", "endTime": "2026-08-07T00:00:00Z" }`

### 🤝 6. Friends Folder
- **Get My Friends** (`GET {{base_url}}/friends`)
- **Get Pending Requests** (`GET {{base_url}}/friends/requests`)
- **Send Request** (`POST {{base_url}}/friends/request/{{target_user_id}}`)
- **Accept Request** (`POST {{base_url}}/friends/accept/{{target_user_id}}`)
- **Reject Request** (`POST {{base_url}}/friends/reject/{{target_user_id}}`)
- **Check Status** (`GET {{base_url}}/friends/status/{{target_user_id}}`)

### 📚 7. Learning Paths Folder
- **Get Paths** (`GET {{base_url}}/learning-paths`)
- **Get Specific Path** (`GET {{base_url}}/learning-paths/{{path_id}}`)
- **Enroll** (`POST {{base_url}}/learning-paths/{{path_id}}/enroll`)
- **[Admin] Create Path** (`POST {{base_url}}/learning-paths`)

### 🔔 8. Notifications Folder
- **Get Notifications** (`GET {{base_url}}/notifications`)
- **Read All** (`PATCH {{base_url}}/notifications/read-all`)
- **Read Single** (`PATCH {{base_url}}/notifications/{{notification_id}}/read`)
- **Clear All** (`DELETE {{base_url}}/notifications/clear-all`)

### 💳 9. Payments Folder
- **Create Order** (`POST {{base_url}}/payment/create-order`)
- **Verify Order** (`POST {{base_url}}/payment/verify`)
  - **Body:** `{ "razorpay_order_id": "...", "razorpay_payment_id": "...", "razorpay_signature": "..." }`
- **History** (`GET {{base_url}}/payment/history`)

### 🤖 10. AI Mentor Folder
- **Get Chat History** (`GET {{base_url}}/ai/history`)
- **Get Problem Chat** (`GET {{base_url}}/ai/chat/{{problem_id}}`)
- **Send Message** (`POST {{base_url}}/ai/chat/{{problem_id}}`)
  - **Body:** `{ "message": "Can you explain the optimal approach?" }`

### 🩺 11. System / Misc Folder
- **Health Check** (`GET {{base_url}}/health`)
- **Readiness** (`GET {{base_url}}/ready`)
- **Contact Us** (`POST {{base_url}}/contact`)
  - *Note: In Postman, go to Body -> `form-data` instead of raw JSON. Add keys: `name`, `email`, `subject`, `message`. Change the `resume` key type from Text to File to upload.*

---

## 🧪 Step 3: Best Practices for API Testing
1. **Always test Login first**: Because you set up the Environment script in Step 1, hitting Login will refresh your token automatically for all other requests.
2. **Copy IDs to Variables**: When you create a problem or a user, copy its `_id` into your Postman Environment variables (like `{{problem_id}}`). This way, you don't have to keep pasting long IDs into the URLs.
3. **Use Admin vs User Tokens**: Some routes (like creating a problem) fail with a normal user token. You should log in to an Admin account, run the Login test, and let it populate `{{admin_token}}` to use on those specific folders.
