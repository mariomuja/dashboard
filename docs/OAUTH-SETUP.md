# OAuth Setup Guide

## 🔐 OAuth Integration Setup

This guide explains how to set up Google and GitHub OAuth authentication for the KPI Dashboard.

---

## Prerequisites

- Google Cloud Account (for Google OAuth)
- GitHub Account (for GitHub OAuth)
- OAuth service running on port 3003

---

## 📝 Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google+ API" or "People API"

### Step 2: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Configure consent screen if prompted
4. Application type: **Web application**
5. Name: `KPI Dashboard`
6. Authorized JavaScript origins:
   ```
   http://localhost:4200
   http://localhost:3003
   ```
7. Authorized redirect URIs:
   ```
   http://localhost:3003/auth/google/callback
   ```
8. Click **Create**
9. Copy **Client ID** and **Client Secret**

### Step 3: Configure Environment

Create `.env` file in project root:
```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

---

## 🐙 GitHub OAuth Setup

### Step 1: Register OAuth App

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click **OAuth Apps** → **New OAuth App**
3. Fill in details:
   - **Application name:** KPI Dashboard
   - **Homepage URL:** `http://localhost:4200`
   - **Authorization callback URL:** `http://localhost:3003/auth/github/callback`
4. Click **Register application**
5. Copy **Client ID**
6. Generate **Client Secret** and copy it

### Step 2: Configure Environment

Add to `.env` file:
```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

---

## 🚀 Starting OAuth Service

### Step 1: Install Dependencies

Already installed ✅ (done via npm install)

### Step 2: Create .env File

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Session Secret
SESSION_SECRET=your_random_secret_key_here

# Server Port
OAUTH_PORT=3003
```

### Step 3: Start Server

```bash
node server-oauth.js
```

You should see:
```
OAuth service running on http://localhost:3003

OAuth Providers:
  Google: http://localhost:3003/auth/google
  GitHub: http://localhost:3003/auth/github
```

---

## 🔧 Configuration

### For Development:

The OAuth service is configured for `http://localhost:4200` (frontend) and `http://localhost:3003` (OAuth service).

### For Production:

1. Update callback URLs in Google/GitHub OAuth app settings
2. Update `.env` with production URLs
3. Enable HTTPS
4. Set `secure: true` in session cookie config
5. Use proper session secret (not default)

---

## 🎯 Usage

### Login with OAuth:

1. Go to `http://localhost:4200/oauth-login`
2. Click **"Continue with Google"** or **"Continue with GitHub"**
3. Authorize the application
4. You'll be redirected back and logged in
5. User info is stored in session

### Check Authentication:

```typescript
// GET http://localhost:3003/api/auth/user
// Returns:
{
  "authenticated": true,
  "user": {
    "id": "12345",
    "provider": "google",
    "email": "user@example.com",
    "name": "John Doe",
    "photo": "https://...",
    "accessToken": "..."
  }
}
```

### Logout:

```typescript
// POST http://localhost:3003/api/auth/logout
```

---

## 🧪 Testing OAuth

### Test Google OAuth:

1. Start OAuth server: `node server-oauth.js`
2. Open browser: `http://localhost:3003/auth/google`
3. Sign in with Google account
4. Check redirect to dashboard

### Test GitHub OAuth:

1. Open browser: `http://localhost:3003/auth/github`
2. Authorize with GitHub account
3. Check redirect to dashboard

---

## 📊 Endpoints

### Authentication Endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auth/google` | Initiate Google OAuth |
| GET | `/auth/google/callback` | Google callback |
| GET | `/auth/github` | Initiate GitHub OAuth |
| GET | `/auth/github/callback` | GitHub callback |
| GET | `/api/auth/user` | Get current user |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/health` | Health check |

---

## 🔒 Security Considerations

### Production Checklist:

- [ ] Use HTTPS for all URLs
- [ ] Generate strong session secret
- [ ] Enable secure cookies
- [ ] Set proper CORS origins
- [ ] Store secrets in environment variables (not in code)
- [ ] Use Redis for session storage (not memory)
- [ ] Implement rate limiting
- [ ] Add CSRF protection
- [ ] Validate redirect URLs
- [ ] Log authentication events

---

## 🐛 Troubleshooting

### OAuth Not Working?

1. **Check environment variables are set**
   ```bash
   echo %GOOGLE_CLIENT_ID%
   echo %GITHUB_CLIENT_ID%
   ```

2. **Verify callback URLs match exactly**
   - Must be exact match in OAuth app settings
   - Include protocol (http://)
   - Check port numbers

3. **Check OAuth server is running**
   ```bash
   curl http://localhost:3003/api/health
   ```

4. **Check browser console for errors**
   - CORS errors mean server config issue
   - Redirect errors mean callback URL mismatch

5. **Verify scopes are correct**
   - Google: `profile`, `email`
   - GitHub: `user:email`

### Common Errors:

**"redirect_uri_mismatch"**
- Fix: Update callback URL in OAuth app to match exactly

**"invalid_client"**
- Fix: Check client ID and secret are correct

**CORS errors**
- Fix: Verify `http://localhost:4200` in CORS config

**Session not persisting**
- Fix: Enable credentials in HTTP requests (`withCredentials: true`)

---

## 💡 Tips

1. **For Testing:** Use test Google/GitHub accounts
2. **Ethereal Email:** For development, OAuth service uses test SMTP
3. **Session Duration:** Default 24 hours, configurable
4. **Multiple Providers:** Users can link multiple OAuth providers

---

## 📝 Integration with Dashboard

### Update Login Component:

Add OAuth option to existing login:

```typescript
// In login.component.html
<button routerLink="/oauth-login">
  Sign in with OAuth
</button>
```

### Store OAuth User:

```typescript
// After OAuth success
this.authService.setUser(oauthUser);
this.userRoleService.setUser('admin'); // Or map from OAuth
```

---

## 🔗 Resources

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Passport.js Documentation](http://www.passportjs.org/)

---

**Status:** ✅ OAuth Integration Complete  
**Last Updated:** November 3, 2025

