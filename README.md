Here’s a detailed README file for your Git repository, covering installation and setup for both the frontend (React) and the backend (n8n workflow).  

---

## README.md  

```markdown
# OAuth Authentication with n8n and React

This repository contains an implementation of OAuth authentication using `n8n` as the backend and a `React.js` frontend. The `n8n` workflow handles authentication, token exchange, user data retrieval, and exposure via a webhook.

---

## 📌 Features
- OAuth authentication flow
- Secure token exchange
- Fetch and expose user details via API
- React-based frontend for handling user authentication

---

## 🚀 Installation & Setup

### 1️⃣ Clone the Repository
```sh
git clone https://github.com/your-repo-name.git
cd your-repo-name
```

---

## 🔧 Backend (n8n) Setup

### 2️⃣ Install n8n
You can install `n8n` globally via npm or use Docker:

#### **Using npm**
```sh
npm install -g n8n
```
#### **Using Docker**
```sh
docker run -it --rm \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

---

### 3️⃣ Start n8n
```sh
n8n start
```
> This starts `n8n` on `http://localhost:5678`

---

### 4️⃣ Import Workflow into n8n
1. Open `n8n` at `http://localhost:5678`
2. Go to **"Workflow" → "Import Workflow"**
3. Upload `My_workflow (2).json` from this repository
4. Click **"Save"** and **"Activate Workflow"**

---

### 5️⃣ n8n Workflow Steps (Manual Execution)
#### 1️⃣ Receive OAuth Code
- Listens for OAuth code from the frontend.

#### 2️⃣ Exchange Code for Access Token
- Calls `https://api.unipile.com/oauth/token` to exchange the code for an access token.

#### 3️⃣ Check for Access Token
- Validates if the token exists.

#### 4️⃣ Fetch User Details
- Calls `https://api.unipile.com/v1/me` to fetch user details.

#### 5️⃣ Format User Data
- Extracts and structures user information.

#### 6️⃣ Expose User Data (Webhook)
- Makes user details available via `http://localhost:5678/webhook-test/user/details`.

---

## 🎨 Frontend (React) Setup

### 6️⃣ Install Dependencies
```sh
cd frontend
npm install
```

---

### 7️⃣ Configure OAuth Provider
1. Open `frontend/src/config.js`
2. Set up OAuth client details:
```javascript
export const OAUTH_CONFIG = {
  client_id: "YOUR_CLIENT_ID",
  redirect_uri: "http://localhost:3000/callback",
  authorization_url: "https://api.unipile.com/oauth/authorize",
  token_url: "http://localhost:5678/webhook-test/oauth/callback",
};
```

---

### 8️⃣ Start React App
```sh
npm start
```
> Runs the app on `http://localhost:3000`

---

## 🔥 Testing the Setup
1. Open `http://localhost:3000` in a browser.
2. Click **"Login with OAuth"**.
3. Authorize via Unipile and redirect to `http://localhost:3000/callback`.
4. Check n8n logs for authentication success.
5. Test user data retrieval:  
   ```sh
   curl -X GET http://localhost:5678/webhook-test/user/details
   ```

---

## ✅ Conclusion
This setup enables OAuth authentication using `n8n` and `React`. Ensure all credentials are properly configured in the frontend and backend before deploying.

---

## 🛠 Troubleshooting
- If n8n fails to start, try restarting:
  ```sh
  n8n stop && n8n start
  ```
- If React doesn’t load OAuth data, check console logs (`F12` in browser).
- Use Postman or `curl` to manually test webhooks.

---

## 📜 License
This project is licensed under the MIT License.

```

---

Let me know if you need modifications! 🚀
