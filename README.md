# DG Interns Hub – Week 6: Backend Integration & Authentication System

![DG Interns Hub Week 6](https://img.shields.io/badge/DG%20Interns%20Hub-Week%206-6366f1?style=for-the-badge)
![Status](https://img.shields.io/badge/Project-Production%20Ready-10b981?style=for-the-badge)
![Node](https://img.shields.io/badge/Node.js-v20+-339933?style=for-the-badge&logo=node.js)
![Docker](https://img.shields.io/badge/Docker-MongoDB%20Container-2496ed?style=for-the-badge&logo=docker)
![JWT](https://img.shields.io/badge/Auth-JWT%20%2B%20bcryptjs-f59e0b?style=for-the-badge)

---

## 1. Project Title
**Week 6 Authentication System** — Built from scratch for **DG Interns Hub (Week 6: Backend Integration & Authentication System)**.

---

## 2. Objective
The objective of this project is to build a secure, full-stack authentication web application demonstrating end-to-end integration between:
1. A modern, responsive **Frontend** built with Semantic HTML5, CSS3 Glassmorphism, and Vanilla JavaScript.
2. A robust **REST API** backend powered by Node.js and Express.
3. Industry-standard **Password Hashing** with `bcryptjs` (salt factor 10).
4. Stateless, token-based session management using **JSON Web Tokens (JWT)** and custom authorization middleware.
5. A persistent, containerized **MongoDB Database** running locally via **Docker & Docker Compose**.
6. A **Protected User Dashboard** accessible only to verified clients bearing a valid Bearer token.

---

## 3. Features

### 👤 Signup (Registration)
- Complete input fields: **Full Name**, **Email Address**, **Password**, and **Confirm Password**.
- Client-side and server-side validation:
  - Non-empty name (minimum 2 characters).
  - RFC 5322 standard email format validation.
  - Password minimum length enforcement (minimum 6 characters).
  - Real-time password confirmation match checker.
  - Duplicate email detection with HTTP `409 Conflict` status code.
- Passwords are salt-hashed using **bcryptjs** before MongoDB persistence.
- Auto-generates JWT upon registration and redirects directly to the Dashboard.

### 🔑 Login (Authentication)
- Input fields: **Email Address** and **Password**.
- Validation for missing credentials.
- Compares submitted plain-text password against stored bcrypt hash using `bcrypt.compare()`.
- Uniform error messages preventing user enumeration attacks.
- Returns a signed JWT token on valid credentials.
- Stores JWT token securely in browser `localStorage` and routes to Dashboard.

### 🛡️ JWT Authentication Middleware
- Custom Express middleware (`backend/middleware/auth.js`).
- Extracts token from `Authorization: Bearer <token>` header.
- Verifies digital cryptographic signature using `jwt.verify()`.
- Decodes user ID payload and verifies user existence in MongoDB.
- Rejects missing, tampered, or expired tokens with HTTP `401 Unauthorized`.
- Protects private endpoints such as `GET /api/auth/me`.

### 📊 Protected User Dashboard
- Route protection: Users without a valid token are immediately redirected to `login.html`.
- Welcomes user by their registered name: **"Welcome, &lt;User Name&gt;"**.
- Displays user profile data: Email address, MongoDB `_id`, and Account Creation timestamp.
- Displays live **"JWT Verified &bull; Active Session"** badge.
- Interactive **JWT Token Inspector** allowing evaluators and mentors to review the raw token structure.
- **Logout button** that destroys the client session and redirects safely back to Login.

### 🐳 Dockerized MongoDB
- Official `mongo:7.0` container orchestrated through `docker-compose.yml`.
- Standard port `27017` exposed for host connections.
- Persistent Docker volume (`week6_mongodb_data`) preventing data loss on container restart.
- Healthcheck policy and `restart: unless-stopped`.

### 🔒 Security Best Practices
- **Never Plaintext:** Passwords are salt-hashed with bcrypt (10 rounds).
- **Data Sanitization:** Passwords and internal versions (`__v`) are stripped from JSON responses via Mongoose `toJSON` transforms.
- **Helmet:** Sets secure HTTP response headers.
- **CORS:** Configured properly for cross-origin requests.
- **Rate Limiting:** Protects `/api/auth/*` endpoints against brute-force login attacks.
- **Environment Isolation:** Secrets (`JWT_SECRET`, `MONGODB_URI`, `PORT`) are kept in `.env` and excluded via `.gitignore`.

---

## 4. Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | HTML5, Vanilla CSS3 | Responsive dark glassmorphism design, mobile-friendly cards |
| **Frontend Logic** | Vanilla JavaScript (ES6+) | Form validation, Fetch API calls, token handling, DOM updates |
| **Backend Runtime** | Node.js | Asynchronous JavaScript runtime environment |
| **Web Framework** | Express.js | REST API routing, static file serving, middleware |
| **Database** | MongoDB (v7.0) | NoSQL document database |
| **ODM** | Mongoose | Schema definitions, validation, pre-save hooks |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`) | Stateless token generation and cryptographic verification |
| **Password Security**| `bcryptjs` | Salted one-way password hashing and comparison |
| **Containerization** | Docker & Docker Compose | Isolated, reproducible container environment for MongoDB |
| **Security Headers** | Helmet & express-rate-limit | HTTP protection and anti-brute-force rate limiting |

---

## 5. Project Structure

```text
web for week 6/
│
├── frontend/                       # Client-Side Application (HTML/CSS/JS)
│   ├── index.html                  # Landing gateway & status portal
│   ├── signup.html                 # User registration page
│   ├── login.html                  # User login page
│   ├── dashboard.html              # Protected user dashboard
│   ├── css/
│   │   └── style.css               # Modern dark theme & design system
│   └── js/
│       ├── signup.js               # Signup validation & API integration
│       ├── login.js                # Login handling & JWT storage
│       └── dashboard.js            # Protected route validation & logout
│
├── backend/                        # Server-Side Application (Node.js/Express)
│   ├── config/
│   │   └── db.js                   # Mongoose MongoDB connection & error logging
│   ├── middleware/
│   │   └── auth.js                 # JWT verification middleware (protect)
│   ├── models/
│   │   └── User.js                 # Mongoose User schema & bcrypt pre-save hook
│   ├── routes/
│   │   └── auth.js                 # API endpoints (signup, login, me, logout)
│   ├── package.json                # Backend-specific package manifest
│   └── server.js                   # Express server entry point & static server
│
├── Dockerfile                      # Backend container configuration
├── docker-compose.yml              # Multi-container orchestration (MongoDB + App)
├── package.json                    # Root package manifest & npm scripts
├── .env.example                    # Template for environment variables
├── .env                            # Local environment configuration (git ignored)
├── .gitignore                      # Git exclusion rules
├── .dockerignore                    # Docker build context exclusions
└── README.md                       # Comprehensive documentation & evaluation guide
```

---

## 6. How Authentication Works

```text
┌──────────────┐                 ┌────────────────┐                 ┌─────────────────┐
│              │   Credentials   │                │   Query Email   │                 │
│  Client      ├────────────────►│  Express API   ├────────────────►│  MongoDB        │
│  (Browser)   │                 │  (Node.js)     │◄────────────────┤  (Docker)       │
│              │                 │                │   Hashed User   │                 │
│              │                 │  bcrypt.compare│                 └─────────────────┘
│              │                 │       ▼        │
│              │    JWT Token    │  jwt.sign()    │
│              │◄────────────────┤       ▼        │
│              │                 │  200 OK + JWT  │
└──────┬───────┘                 └────────────────┘
       │
       │ (Store in localStorage)
       ▼
┌──────────────┐                 ┌────────────────┐                 ┌─────────────────┐
│              │  GET /auth/me   │  Auth          │   Find by ID    │                 │
│  Protected   ├────────────────►│  Middleware    ├────────────────►│  MongoDB        │
│  Dashboard   │  Bearer <token> │  jwt.verify()  │◄────────────────┤  User Record    │
│              │◄────────────────┤  req.user = u  │   (No password) └─────────────────┘
└──────────────┘    200 OK + u   └────────────────┘
```

1. **Registration:** User submits name, email, and password. The backend checks for existing accounts, hashes the password via bcrypt (10 rounds), saves the user into MongoDB, signs a JWT, and returns it.
2. **Login:** User submits email and password. Backend queries MongoDB by email, uses `bcrypt.compare()` to compare passwords, signs a JWT with the user's ID, and returns the token.
3. **Session Storage:** The frontend saves the token in `localStorage`.
4. **Accessing Protected Routes:** For any protected action (such as loading `dashboard.html`), the client sends the token in the `Authorization` header:
   ```http
   Authorization: Bearer <token>
   ```
5. **Token Verification:** Express middleware checks the signature using `JWT_SECRET`. If valid, it attaches the user to `req.user` and permits access; if invalid or expired, it returns HTTP 401.

---

## 7. Signup Flow (Step-by-Step)

1. User enters their **Full Name**, **Email**, **Password**, and **Confirm Password** on `signup.html`.
2. Client-side JavaScript verifies that:
   - Name is not blank (length ≥ 2).
   - Email adheres to regex format.
   - Password is at least 6 characters.
   - Confirm password matches password exactly.
3. If validation succeeds, `signup.js` sends an HTTP `POST` request to `/api/auth/signup`.
4. The Express server executes backend validation on all fields.
5. It queries MongoDB: `User.findOne({ email })`. If found, it halts and returns `409 Conflict`.
6. The Mongoose `pre('save')` hook intercepts the document, generates a cryptographic salt via `bcrypt.genSalt(10)`, and hashes the password via `bcrypt.hash()`.
7. The user document is written to MongoDB.
8. Server signs a JWT with payload `{ id: user._id }` and expiration `1d`.
9. Server responds with HTTP `201 Created` containing the token and user details (with password stripped).
10. The client stores the token in `localStorage` and automatically navigates to `dashboard.html`.

---

## 8. Login Flow (Step-by-Step)

1. User enters **Email** and **Password** on `login.html`.
2. Client-side JavaScript ensures neither field is empty.
3. `login.js` sends an HTTP `POST` request to `/api/auth/login`.
4. Backend finds the user by email: `User.findOne({ email })`.
   - If not found, returns `401 Unauthorized` with `"Invalid email or password"`.
5. Backend invokes `user.comparePassword(password)` which executes:
   ```javascript
   bcrypt.compare(candidatePassword, storedHashedPassword);
   ```
   - If match fails, returns `401 Unauthorized` with `"Invalid email or password"`.
6. If credentials match, backend signs a JWT token using `JWT_SECRET`.
7. Returns HTTP `200 OK` with JSON payload `{ success: true, token, user }`.
8. Frontend stores `token` in `localStorage` and redirects to `dashboard.html`.

---

## 9. JWT Flow & Structure

A **JSON Web Token** consists of 3 Base64URL-encoded parts separated by dots (`.`):

```text
Header.Payload.Signature
```

1. **Header:** Contains token type (`JWT`) and signing algorithm (`HS256`).
2. **Payload:** Contains user claims:
   ```json
   {
     "id": "674390b1c0a87612f8a12345",
     "iat": 1727181600,
     "exp": 1727268000
   }
   ```
3. **Signature:** Cryptographic verification hash computed using:
   ```text
   HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), JWT_SECRET)
   ```
   *Only someone possessing `JWT_SECRET` can produce or verify this signature, guaranteeing the token cannot be tampered with by the client.*

---

## 10. Password Hashing (bcrypt Explained)

Plain-text passwords must **never** be stored in a database. Even if the database is compromised, hashed passwords cannot be reversed.

### How bcryptjs works in this project:
1. **Salt Generation:** bcrypt creates a random 16-byte string called a salt.
2. **Cost Factor (Salt Rounds = 10):** The key derivation algorithm executes $2^{10} = 1024$ iterations, making brute-force attacks computationally expensive.
3. **Hash Composition:**
   ```text
   $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
   ├───┼──┼──────────────────────┼─────────────────────────────┤
   Alg Cost        Salt                       Hash
   ```
4. **Verification:** When logging in, bcrypt extracts the original salt from the stored hash, applies it to the entered password, hashes it, and checks if the resulting hashes match.

---

## 11. MongoDB + Docker Setup

MongoDB runs in an isolated Docker container configured through `docker-compose.yml`.

### Docker Compose Configuration:
- **Image:** `mongo:7.0` (Official MongoDB Image)
- **Container Name:** `mongodb_week6`
- **Exposed Port:** `27017:27017`
- **Data Persistence Volume:** `week6_mongodb_data:/data/db`
- **Healthcheck:** Ping test via `mongosh` every 10 seconds.
- **Restart Policy:** `unless-stopped`

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:7.0
    container_name: mongodb_week6
    restart: unless-stopped
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
```

---

## 12. Installation Steps (Beginner Friendly)

### Prerequisites:
1. **Node.js** (v18 or higher recommended) — [Download Node.js](https://nodejs.org/)
2. **Docker Desktop** installed and running — [Download Docker](https://www.docker.com/products/docker-desktop/)
3. **Git** — [Download Git](https://git-scm.com/)

### Step 1: Open Terminal in the Project Directory
```bash
cd "d:\DG INTERNS HUB\WEEK 6\web for week 6"
```

### Step 2: Install Node.js Dependencies
```bash
npm install
```
*(This installs `express`, `mongoose`, `jsonwebtoken`, `bcryptjs`, `cors`, `helmet`, `dotenv`, and `express-rate-limit`)*

### Step 3: Verify Environment Configuration
The `.env` file is pre-configured with local defaults:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/week6_auth
JWT_SECRET=dg_interns_hub_week6_super_secure_jwt_secret_key_2026
JWT_EXPIRES_IN=1d
NODE_ENV=development
```

---

## 13. Run Commands

### Option A: Standard Workflow (Docker MongoDB + Node Server)
This is the recommended workflow for development and evaluation.

#### 1. Start MongoDB Container via Docker Compose:
```bash
docker compose up -d
```
Verify the container is running:
```bash
docker ps
```
*(You should see `mongodb_week6` in the container list with status `Up` on port `0.0.0.0:27017->27017/tcp`)*

#### 2. Start the Backend Server:
```bash
npm start
```
*(For auto-restart on changes during development, you can use: `npm run dev`)*

#### 3. Open in Browser:
Visit any of the following URLs in your web browser:
- **Landing Gateway:** [http://localhost:5000](http://localhost:5000)
- **Sign In Page:** [http://localhost:5000/login.html](http://localhost:5000/login.html)
- **Sign Up Page:** [http://localhost:5000/signup.html](http://localhost:5000/signup.html)
- **Dashboard:** [http://localhost:5000/dashboard.html](http://localhost:5000/dashboard.html)
- **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

### Option B: Full-Stack Dockerization (Run Everything in Docker)
To run both MongoDB and the Node.js backend together inside Docker:
```bash
docker compose --profile full up --build -d
```
To stop all containers:
```bash
docker compose --profile full down
```

---

## 14. API Endpoints

### Base URL: `http://localhost:5000/api`

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Public | Register new user, hashes password, returns JWT |
| `POST` | `/api/auth/login` | Public | Authenticate credentials, returns JWT |
| `GET` | `/api/auth/me` | Protected (JWT) | Returns current logged-in user profile |
| `POST` | `/api/auth/logout` | Public/User | Logs out user session |
| `GET` | `/api/health` | Public | Server uptime, MongoDB connectivity status |

### Sample JSON Responses:

#### 1. Successful Signup (`201 Created`):
```json
{
  "success": true,
  "message": "Account created successfully! Welcome to DG Interns Hub.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "67438bfd240217997be34512",
    "name": "Alex Morgan",
    "email": "alex@example.com",
    "createdAt": "2026-09-24T18:30:00.000Z"
  }
}
```

#### 2. Duplicate Email Error (`409 Conflict`):
```json
{
  "success": false,
  "message": "An account with this email address already exists. Please log in instead."
}
```

#### 3. Successful Login (`200 OK`):
```json
{
  "success": true,
  "message": "Login successful! Redirecting to Dashboard...",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "67438bfd240217997be34512",
    "name": "Alex Morgan",
    "email": "alex@example.com",
    "createdAt": "2026-09-24T18:30:00.000Z"
  }
}
```

#### 4. Invalid Credentials (`401 Unauthorized`):
```json
{
  "success": false,
  "message": "Invalid email or password."
}
```

#### 5. Protected User Endpoint (`GET /api/auth/me` with Bearer token) (`200 OK`):
```json
{
  "success": true,
  "message": "User authenticated successfully.",
  "user": {
    "id": "67438bfd240217997be34512",
    "name": "Alex Morgan",
    "email": "alex@example.com",
    "createdAt": "2026-09-24T18:30:00.000Z",
    "updatedAt": "2026-09-24T18:30:00.000Z"
  }
}
```

---

## 15. Security Features Summary

1. **Password Salt-Hashing:** Uses `bcryptjs` with salt round cost 10. Passwords are never stored or logged in plain text.
2. **Stateless JWT Authorization:** Signed tokens with configurable expiration (`JWT_EXPIRES_IN=1d`).
3. **No Password Exposure:** Mongoose `toJSON` method strips `password` and `__v` before any JSON serialization.
4. **Helmet Protection:** HTTP security headers applied to Express.
5. **CORS Safe:** Restricted allowed HTTP methods and explicit headers.
6. **Rate Limiting:** Protects `/api/auth/*` routes to block automated brute-force attacks (100 requests per 15 minutes).
7. **Input Normalization & Sanitization:** Trimmed names, lowercase normalized emails, strict regex checking.
8. **Environment Secrets:** No sensitive credentials hardcoded in codebase.

---

## 16. Screenshots Required for DG Interns Hub Submission

When preparing your Week 6 submission PDF or portal upload, take the following screenshots:

| # | Screenshot Title | What to Show |
| :- | :--- | :--- |
| 1 | **Docker Desktop & Container** | Docker Desktop showing `mongodb_week6` container running with green status and port `27017:27017`. |
| 2 | **Signup Page UI** | `signup.html` showing the dark glassmorphism card, inputs, and password checklist indicators. |
| 3 | **Signup Validation Error** | `signup.html` displaying error banner for mismatched passwords or short password (&lt; 6 chars). |
| 4 | **Login Page UI** | `login.html` showing email/password fields with modern styling and visibility toggles. |
| 5 | **Login Error Handling** | `login.html` showing "Invalid email or password" alert on incorrect credentials. |
| 6 | **Protected Dashboard** | `dashboard.html` showing "Welcome, &lt;Name&gt;", email, MongoDB ID, and active JWT verified badge. |
| 7 | **JWT Token Inspector** | The expanded token inspector in the dashboard showing the raw JWT token. |
| 8 | **MongoDB Data in Shell/Compass** | `mongosh` or MongoDB Compass showing the stored user document with the `password` field containing only the `$2a$10$...` hash. |
| 9 | **Console / Network Tab** | Browser DevTools Network tab showing `POST /api/auth/login` returning status `200` with the token. |

---

## 17. Learning Outcomes

By completing this Week 6 project, you have acquired practical engineering competency in:
1. **Full-Stack Architecture:** Connecting client-side applications (HTML/CSS/JS) to an Express REST API.
2. **Cryptographic Security:** Applying one-way hash algorithms (bcrypt) with salts to eliminate plain-text passwords.
3. **Token-Based Authentication:** Implementing stateless JWT authorization flows with HTTP Bearer tokens.
4. **Middleware Design:** Writing custom Express middleware to intercept requests, verify signatures, and protect routes.
5. **Containerization with Docker:** Deploying and managing persistent database services using Docker Compose.
6. **Database Modeling:** Creating Mongoose schemas with data validation rules, pre-save hooks, and virtual transforms.

---

## 18. Testing Checklist

Use this checklist during your self-test and presentation:

### Signup Tests:
- [x] **Valid Signup:** Submit name, unique email, 6+ character password. Should redirect to Dashboard.
- [x] **Duplicate Email:** Attempt to register with the same email again. Should show "Account with this email already exists".
- [x] **Invalid Email:** Enter `alex.com` (missing `@`). Should show email format error.
- [x] **Empty Fields:** Leave a field blank. Should show required field error.
- [x] **Short Password:** Enter 5 characters. Checklist and alert should flag length requirement.
- [x] **Password Mismatch:** Enter two different passwords. Should flag mismatch.

### Login Tests:
- [x] **Correct Credentials:** Enter registered email and password. Should log in and redirect.
- [x] **Wrong Password:** Enter registered email with wrong password. Should reject with 401 error.
- [x] **Unknown Email:** Enter non-existent email. Should reject with 401 error.
- [x] **Empty Fields:** Click Sign In with empty inputs. Should prompt for inputs.

### Authentication & Route Protection Tests:
- [x] **Direct Access without Token:** Navigate to `http://localhost:5000/dashboard.html` in an Incognito window. Should redirect immediately to `login.html`.
- [x] **Protected API Check:** Run `curl http://localhost:5000/api/auth/me` without Authorization header. Should return `401 Unauthorized`.
- [x] **Valid Bearer Check:** Run `curl -H "Authorization: Bearer <TOKEN>" http://localhost:5000/api/auth/me`. Should return user info.
- [x] **Logout:** Click Logout on the Dashboard. Should clear `localStorage` and redirect to Login. Back button should not allow dashboard access without re-login.

### Database Verification Tests:
- [x] User document is stored in MongoDB database `week6_auth` under collection `users`.
- [x] `password` field stores only the `$2a$10$...` bcrypt hash string.
- [x] Plain-text password is never stored or visible.

---

## 19. Presentation Script for Evaluation / Mentor Viva

Use this concise walkthrough when explaining your project to your evaluator:

> *"Good morning / afternoon! For my DG Interns Hub Week 6 project, I built a secure full-stack Authentication System from scratch using Node.js, Express, MongoDB running in Docker, and Vanilla HTML/CSS/JavaScript.*
>
> *Here is how the architecture functions:*
>
> 1. *When a user signs up on our frontend, client-side validation ensures the email format, name, and matching passwords meet requirements. Upon submission, our Express backend validates the payload, checks for duplicate accounts in MongoDB, and uses a Mongoose pre-save hook with **bcryptjs** (using a salt cost of 10) to hash the password before saving. The plain-text password is never stored anywhere.*
> 2. *When logging in, the server verifies the password using `bcrypt.compare()` against the stored hash. If matched, it signs a **JSON Web Token (JWT)** using our environment secret. The JWT contains the user ID in its payload and expires in 24 hours.*
> 3. *The client stores this token in `localStorage`. When the user navigates to the Dashboard, our custom **protect middleware** checks the `Authorization: Bearer <token>` header, decodes the signature with `jwt.verify()`, and verifies the user in MongoDB. If unauthorized, access is denied and the user is redirected to Login.*
> 4. *Our database is containerized using **Docker Compose** with the official MongoDB image, port 27017, and a persistent Docker volume so all user data is safely preserved.*
> 5. *Finally, we enforced security best practices including Helmet HTTP headers, CORS policies, rate limiting on authentication routes to prevent brute-force attacks, and safe JSON transformations that strip password hashes from all responses."*
