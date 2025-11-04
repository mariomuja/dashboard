const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const cors = require('cors');

const app = express();
const PORT = process.env.OAUTH_PORT || 3003;

// Middleware
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'dashboard-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
app.use(passport.initialize());
app.use(passport.session());

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'YOUR_GOOGLE_CLIENT_SECRET',
  callbackURL: 'http://localhost:3003/auth/google/callback'
},
(accessToken, refreshToken, profile, done) => {
  const user = {
    id: profile.id,
    provider: 'google',
    email: profile.emails[0].value,
    name: profile.displayName,
    photo: profile.photos[0]?.value,
    accessToken: accessToken
  };
  return done(null, user);
}));

// GitHub OAuth Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID || 'YOUR_GITHUB_CLIENT_ID',
  clientSecret: process.env.GITHUB_CLIENT_SECRET || 'YOUR_GITHUB_CLIENT_SECRET',
  callbackURL: 'http://localhost:3003/auth/github/callback'
},
(accessToken, refreshToken, profile, done) => {
  const user = {
    id: profile.id,
    provider: 'github',
    username: profile.username,
    email: profile.emails?.[0]?.value || '',
    name: profile.displayName || profile.username,
    photo: profile.photos?.[0]?.value,
    accessToken: accessToken
  };
  return done(null, user);
}));

// Routes

// Google OAuth
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:4200/login' }),
  (req, res) => {
    // Successful authentication
    res.redirect('http://localhost:4200?oauth=success&provider=google');
  }
);

// GitHub OAuth
app.get('/auth/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: 'http://localhost:4200/login' }),
  (req, res) => {
    // Successful authentication
    res.redirect('http://localhost:4200?oauth=success&provider=github');
  }
);

// Get current user
app.get('/api/auth/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      authenticated: true,
      user: req.user
    });
  } else {
    res.json({
      authenticated: false
    });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Session destroy failed' });
      }
      res.clearCookie('connect.sid');
      res.json({ success: true, message: 'Logged out and session cleared' });
    });
  });
});

// Clear session endpoint (GET for easy access via browser)
app.get('/api/auth/clear-session', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Session clear failed' });
    }
    res.clearCookie('connect.sid');
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Session Cleared</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
          .container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto; }
          h1 { color: #10b981; }
          .icon { font-size: 60px; margin-bottom: 20px; }
          button { background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 6px; font-size: 16px; cursor: pointer; margin-top: 20px; }
          button:hover { background: #2563eb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">✅</div>
          <h1>OAuth Session Cleared!</h1>
          <p>The "PersonalAccessToken" user and all OAuth session data have been removed.</p>
          <p>Your OAuth cookies have been cleared.</p>
          <button onclick="window.location.href='http://localhost:4200/oauth-login'">Go to OAuth Login</button>
          <button onclick="window.location.href='http://localhost:4200'">Go to Dashboard</button>
        </div>
      </body>
      </html>
    `);
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'OAuth Service',
    providers: {
      google: process.env.GOOGLE_CLIENT_ID ? 'configured' : 'not configured',
      github: process.env.GITHUB_CLIENT_ID ? 'configured' : 'not configured'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`OAuth service running on http://localhost:${PORT}`);
  console.log('');
  console.log('OAuth Providers:');
  console.log('  Google: http://localhost:3003/auth/google');
  console.log('  GitHub: http://localhost:3003/auth/github');
  console.log('');
  console.log('⚠️  IMPORTANT: Set environment variables for OAuth to work:');
  console.log('  GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET');
  console.log('  GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET');
  console.log('');
  console.log('See OAUTH-SETUP.md for configuration instructions');
});

