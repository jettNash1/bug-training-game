# Infrastructure Setup Guide

This guide covers full setup of the Bug Training Game infrastructure from scratch. The application uses three services:

- **MongoDB Atlas** -- Database
- **Render** -- Backend API (Node.js web service)
- **AWS (S3 + EC2)** -- Frontend hosting and deployment

---

## Table of Contents

1. [MongoDB Atlas Setup](#1-mongodb-atlas-setup)
2. [Render Web Service Setup](#2-render-web-service-setup)
3. [AWS Frontend Hosting](#3-aws-frontend-hosting)
4. [Deploying Updates via EC2 (PuTTY)](#4-deploying-updates-via-ec2-putty)
5. [Updating Codebase URLs](#5-updating-codebase-urls)
6. [Local Development Setup](#6-local-development-setup)
7. [Environment Variable Reference](#7-environment-variable-reference)
8. [Important Notes](#8-important-notes)

---

## 1. MongoDB Atlas Setup

### 1.1 Create an Account and Cluster

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign up with a company email.
2. Create a new **Organization** (e.g. your company name), then a **Project** (e.g. `bug-training-game`).
3. Click **"Build a Database"** and select a tier:
   - **M0 (Free)**: 512 MB storage, shared resources. Fine for low-traffic use.
   - **M2/M5 (Shared)**: More storage and better performance.
   - **M10+ (Dedicated)**: For production workloads.
4. Configuration:
   - **Provider**: AWS
   - **Region**: `eu-west-2` (London) -- matches the existing S3 bucket region.
   - **Cluster Name**: e.g. `BugTrainingCluster`
5. Click **Create Deployment**.

### 1.2 Create a Database User

1. Go to **Database Access** in the left sidebar.
2. Click **"Add New Database User"**.
   - **Authentication**: Password
   - **Username**: e.g. `bugtraining-admin`
   - **Password**: Generate a strong password and **save it securely**.
   - **Role**: `Atlas Admin` (or `readWriteAnyDatabase` for least privilege)
3. Click **Add User**.

### 1.3 Configure Network Access

1. Go to **Network Access** in the left sidebar.
2. Click **"Add IP Address"**.
3. Select **"Allow Access from Anywhere"** (`0.0.0.0/0`).
   - This is required because both Render and EC2 use dynamic/varying IPs.
   - If you later have a static IP for EC2, you can restrict to that IP plus Render's range.
4. Click **Confirm**.

### 1.4 Get the Connection String

1. Go to **Database** > click **"Connect"** on your cluster.
2. Select **"Drivers"** > **Node.js**.
3. Copy the connection string:
   ```
   mongodb+srv://bugtraining-admin:<password>@bugtrainingcluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual password.
5. **Add the database name** before the `?`:
   ```
   mongodb+srv://bugtraining-admin:YOUR_PASSWORD@bugtrainingcluster.xxxxx.mongodb.net/bug-training-game?retryWrites=true&w=majority
   ```
6. Save this URI -- it is needed for both Render and EC2 environment variables.

### 1.5 Restore from a Backup

If you have a backup created with `mongodump`:

1. Install [MongoDB Database Tools](https://www.mongodb.com/try/download/database-tools) on a local machine.
2. Run:
   ```bash
   mongorestore \
     --uri "mongodb+srv://bugtraining-admin:YOUR_PASSWORD@bugtrainingcluster.xxxxx.mongodb.net/bug-training-game" \
     --drop \
     ./dump/bug-training-game
   ```
   - `--drop` replaces existing collections (safe on a fresh cluster).
   - `./dump/bug-training-game` is the path to the backup folder.

If **no backup exists**, the application creates all necessary collections and indexes automatically on first startup.

### 1.6 Create a Backup (for future use)

```bash
mongodump \
  --uri "mongodb+srv://bugtraining-admin:YOUR_PASSWORD@bugtrainingcluster.xxxxx.mongodb.net/bug-training-game" \
  --out ./dump
```

This creates `./dump/bug-training-game/` containing BSON files for all collections (`users`, `settings`, `scheduledresets`, etc.).

---

## 2. Render Web Service Setup

Render hosts the Node.js backend API server.

### 2.1 Create an Account

1. Go to [render.com](https://render.com) and sign up with a company email.
2. Connect the **GitHub** (or GitLab) account that hosts the repository.

### 2.2 Create the Web Service

1. From the Render dashboard, click **"New +"** > **"Web Service"**.
2. Select the `bug-training-game` repository.
3. Configure:

| Setting | Value |
|---|---|
| **Name** | `bug-training-game-api` |
| **Region** | EU (Frankfurt) or closest to your users |
| **Branch** | Your production branch (e.g. `main`) |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `node backend/server.js` |
| **Instance Type** | Free tier or Starter ($7/mo for no spin-down) |

> **Alternative**: You can use the existing `render.yaml` via **"New +"** > **"Blueprint"**, but you will still need to add secret environment variables manually.

### 2.3 Set Environment Variables

In the Render service dashboard, go to **"Environment"** and add:

| Key | Value | Notes |
|---|---|---|
| `NODE_ENV` | `production` | |
| `PORT` | `10000` | Render default |
| `NODE_VERSION` | `18.x` | Required Node version |
| `MONGODB_URI` | Your Atlas connection string from [1.4](#14-get-the-connection-string) | |
| `JWT_SECRET` | *(random 64-character hex string)* | See below for generation |
| `JWT_REFRESH_SECRET` | *(different random 64-character hex string)* | Must differ from JWT_SECRET |
| `ADMIN_USERNAME` | Your primary admin username | |
| `ADMIN_PASSWORD` | Your primary admin password | |
| `ADMIN_USERNAME_2` | *(optional)* Second admin username | |
| `ADMIN_PASSWORD_2` | *(optional)* Second admin password | |
| `ADMIN_USERNAME_3` | *(optional)* Third admin username | |
| `ADMIN_PASSWORD_3` | *(optional)* Third admin password | |
| `ALLOWED_ORIGINS` | `http://learning-hub.s3-website.eu-west-2.amazonaws.com` | The S3 frontend URL |

**Generate secure secrets** by running locally:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Run this twice to get two different values for `JWT_SECRET` and `JWT_REFRESH_SECRET`.

### 2.4 Deploy and Verify

1. Click **"Create Web Service"** -- Render builds and deploys automatically.
2. Note your service URL (e.g. `https://bug-training-game-api.onrender.com`).
3. Verify by visiting:
   ```
   https://bug-training-game-api.onrender.com/health
   ```
   Expected response:
   ```json
   { "status": "ok", "mongodb": "connected", "timestamp": "..." }
   ```

---

## 3. AWS Frontend Hosting

The frontend is hosted as a static website on an **S3 bucket**. Deployment is done from an **EC2 instance** via SSH (PuTTY).

### 3.1 S3 Bucket Setup (if creating from scratch)

If the S3 bucket `learning-hub` does not already exist:

1. Create the bucket in `eu-west-2`:
   ```bash
   aws s3 mb s3://learning-hub --region eu-west-2
   ```

2. Enable static website hosting:
   ```bash
   aws s3 website s3://learning-hub --index-document index.html --error-document index.html
   ```

3. Set the bucket policy for public read access:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::learning-hub/*"
       }
     ]
   }
   ```
   Apply via:
   ```bash
   aws s3api put-bucket-policy --bucket learning-hub --policy file://bucket-policy.json
   ```

4. The frontend URL will be:
   ```
   http://learning-hub.s3-website.eu-west-2.amazonaws.com/
   ```

### 3.2 EC2 Instance Setup (if creating from scratch)

If the EC2 instance does not already exist:

1. Launch a `t2.micro` (or similar) instance in `eu-west-2` with Amazon Linux 2 or Ubuntu.
2. Ensure the security group allows **SSH (port 22)** from your office IP.
3. Save the `.pem` key pair file securely -- this is needed for PuTTY access.
4. SSH in and install prerequisites:
   ```bash
   # Install Node.js 18
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   source ~/.bashrc
   nvm install 18
   nvm use 18

   # Install PM2 globally
   npm install -g pm2

   # Install AWS CLI (if not pre-installed)
   sudo yum install -y awscli   # Amazon Linux
   # or: sudo apt install -y awscli   # Ubuntu

   # Configure AWS CLI with credentials that have S3 write access
   aws configure
   ```
5. Clone the repository:
   ```bash
   mkdir -p ~/apps
   cd ~/apps
   git clone https://github.com/YOUR_ORG/bug-training-game.git
   cd bug-training-game
   ```
6. Create the `.env` file:
   ```bash
   cp .env.example .env
   nano .env
   ```
   Fill in the same values as the Render environment variables (see [Section 7](#7-environment-variable-reference)).

7. Install dependencies and start with PM2:
   ```bash
   npm install
   pm2 start backend/server.js --name bug-training-game
   pm2 startup
   pm2 save
   ```

---

## 4. Deploying Updates via EC2 (PuTTY)

This is the standard process for deploying code changes to both the backend and frontend.

### 4.1 Connect to EC2

1. Open **PuTTY**.
2. Enter the EC2 instance's **public IP** or **public DNS** as the hostname.
3. Go to **Connection** > **SSH** > **Auth** > **Credentials** and browse to the `.ppk` private key file.
   - If you only have a `.pem` file, convert it using **PuTTYgen**: Load the `.pem`, then click **Save private key** to get a `.ppk`.
4. Click **Open** to connect. Log in as `ec2-user` (Amazon Linux) or `ubuntu` (Ubuntu).

### 4.2 Deploy Backend + Frontend

Run these commands in order:

```bash
# Navigate to the project
cd ~/apps/bug-training-game/

# Pull latest changes from the repository
git pull

# Install any new dependencies (if package.json changed)
npm install

# Restart the backend via PM2
pm2 restart bug-training-game

# Sync frontend files to S3
cd frontend
aws s3 sync . s3://learning-hub --exclude "node_modules/*" --exclude ".git/*" --delete
```

### 4.3 Verify

- **Backend**: Check PM2 status and logs:
  ```bash
  pm2 status
  pm2 logs bug-training-game --lines 20
  ```
- **Frontend**: Visit the S3 URL in a browser:
  ```
  http://learning-hub.s3-website.eu-west-2.amazonaws.com/
  ```

---

## 5. Updating Codebase URLs

After creating your Render service, you may need to update hardcoded URLs if the service name differs from the original. The following files contain Render URLs:

### `frontend/config.js`

- Line 3: `window.location.hostname === 'bug-training-game.onrender.com'`
- Line 13: `return 'https://bug-training-game-api.onrender.com';`
- Line 40: `'https://bug-training-game.onrender.com'`

### `frontend/api-service.js`

- References to `bug-training-game-api.onrender.com`

### `backend/server.js`

- Lines 38-41: CORS `allowedOrigins` array contains:
  - `https://bug-training-game.onrender.com`
  - `http://bug-training-game.onrender.com`
  - `https://bug-training-game-api.onrender.com`
  - `http://bug-training-game-api.onrender.com`

Replace all instances of `bug-training-game.onrender.com` and `bug-training-game-api.onrender.com` with your new Render service URL.

> **Note**: The AWS S3 origin (`http://learning-hub.s3-website.eu-west-2.amazonaws.com`) is already present in the CORS configuration and does not need changing unless the bucket name changes.

---

## 6. Local Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_ORG/bug-training-game.git
   cd bug-training-game
   ```

2. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

3. Fill in the `.env` with your MongoDB Atlas URI and chosen secrets. Set `NODE_ENV=development`.

4. Install dependencies and start the backend:
   ```bash
   npm install
   npm run dev
   ```
   The backend starts on port `10000` by default (or whatever `PORT` is set to in `.env`).

5. In a separate terminal, start the frontend dev server:
   ```bash
   cd frontend
   npx http-server -p 8080 -c-1
   ```

6. Access the app at `http://localhost:8080`.

> **Note**: The frontend `config.js` sends API requests to `http://localhost:3000` in development. Either set `PORT=3000` in your `.env`, or update line 17 of `frontend/config.js` to match your port.

---

## 7. Environment Variable Reference

| Variable | Required | Description |
|---|---|---|
| `NODE_ENV` | Yes | `development` or `production` |
| `PORT` | Yes | Server port (default `10000`, Render also expects `10000`) |
| `MONGODB_URI` | Yes | MongoDB Atlas connection string (see [1.4](#14-get-the-connection-string)) |
| `JWT_SECRET` | Yes | Secret for signing JWT access tokens (64-char hex) |
| `JWT_REFRESH_SECRET` | Yes | Secret for signing JWT refresh tokens (64-char hex, different from above) |
| `ADMIN_USERNAME` | Yes | Primary admin login username |
| `ADMIN_PASSWORD` | Yes | Primary admin login password |
| `ADMIN_USERNAME_2` | No | Second admin username |
| `ADMIN_PASSWORD_2` | No | Second admin password |
| `ADMIN_USERNAME_3` | No | Third admin username |
| `ADMIN_PASSWORD_3` | No | Third admin password |
| `ALLOWED_ORIGINS` | No | Comma-separated list of additional allowed CORS origins |
| `NODE_VERSION` | No | Node.js version for Render (set to `18.x`) |

---

## 8. Important Notes

### Node.js Version
The project requires **Node.js >=14.0.0 <20.0.0** (per `package.json`). Use **Node 18 LTS** across all environments.

### Render Free Tier Spin-Down
Render's free tier spins the service down after 15 minutes of inactivity. The first request after spin-down takes 30-60 seconds to respond. Options:
- Upgrade to a paid Starter instance ($7/month) for always-on.
- Use an uptime monitor (e.g. UptimeRobot) to ping `/health` every 14 minutes.

### MongoDB Atlas Free Tier
M0 clusters have 512 MB storage and pause after 60 days of inactivity. Monitor usage in the Atlas dashboard and upgrade if needed.

### Auto-Created Database Resources
On first startup, the backend automatically:
- Creates indexes on the `users` collection (`username`, `quizResults.quizName`, `quizProgress`).
- Initializes default settings (e.g. `quizTimerSeconds: 60`).

No manual database schema setup or seeding is required.

### SSL/HTTPS
- **Render**: Provides free TLS certificates automatically.
- **MongoDB Atlas**: `mongodb+srv://` connections are encrypted by default.
- **S3**: The S3 static website endpoint is HTTP only. For HTTPS, set up a CloudFront distribution in front of the S3 bucket.

### PuTTY Key Conversion
If you only have a `.pem` key file from AWS:
1. Open **PuTTYgen**.
2. Click **Load** and select the `.pem` file (change filter to "All Files").
3. Click **Save private key** to create a `.ppk` file.
4. Use the `.ppk` file in PuTTY under **Connection > SSH > Auth > Credentials**.
