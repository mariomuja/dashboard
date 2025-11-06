const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const LdapStrategy = require('passport-ldapauth');

const app = express();
const PORT = process.env.LDAP_PORT || 3004;

// Middleware
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'ldap-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000
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

// LDAP Strategy Configuration
passport.use(new LdapStrategy({
  server: {
    url: process.env.LDAP_URL || 'ldap://localhost:389',
    bindDN: process.env.LDAP_BIND_DN || 'cn=admin,dc=example,dc=com',
    bindCredentials: process.env.LDAP_BIND_PASSWORD || 'admin',
    searchBase: process.env.LDAP_SEARCH_BASE || 'dc=example,dc=com',
    searchFilter: process.env.LDAP_SEARCH_FILTER || '(uid={{username}})',
    tlsOptions: {
      rejectUnauthorized: false // For development only
    }
  },
  usernameField: 'username',
  passwordField: 'password'
},
(user, done) => {
  // Map LDAP attributes to user object
  const mappedUser = {
    id: user.uid || user.sAMAccountName,
    username: user.uid || user.sAMAccountName,
    email: user.mail || `${user.uid}@example.com`,
    name: user.cn || user.displayName || user.uid,
    groups: user.memberOf || [],
    department: user.department || user.ou,
    title: user.title,
    provider: 'ldap'
  };
  
  return done(null, mappedUser);
}));

// Routes

// LDAP Login
app.post('/auth/ldap',
  passport.authenticate('ldapauth', { session: true }),
  (req, res) => {
    res.json({
      success: true,
      message: 'LDAP authentication successful',
      user: req.user
    });
  }
);

// Active Directory Login (same as LDAP but with AD-specific mapping)
app.post('/auth/ad', (req, res, next) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  // For AD, we might use sAMAccountName instead of uid
  const adStrategy = new LdapStrategy({
    server: {
      url: process.env.AD_URL || 'ldap://ad.example.com:389',
      bindDN: process.env.AD_BIND_DN || 'cn=admin,dc=corp,dc=example,dc=com',
      bindCredentials: process.env.AD_BIND_PASSWORD || 'admin',
      searchBase: process.env.AD_SEARCH_BASE || 'dc=corp,dc=example,dc=com',
      searchFilter: '(sAMAccountName={{username}})',
      tlsOptions: {
        rejectUnauthorized: false
      }
    },
    usernameField: 'username',
    passwordField: 'password'
  },
  (user, done) => {
    const mappedUser = {
      id: user.sAMAccountName || user.uid,
      username: user.sAMAccountName || user.uid,
      email: user.mail || user.userPrincipalName,
      name: user.displayName || user.cn,
      groups: user.memberOf || [],
      department: user.department,
      title: user.title,
      provider: 'active-directory'
    };
    done(null, mappedUser);
  });

  passport.authenticate(adStrategy, (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: 'Authentication failed', details: err.message });
    }
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Login failed' });
      }
      res.json({
        success: true,
        message: 'Active Directory authentication successful',
        user: user
      });
    });
  })(req, res, next);
});

// Sync users from LDAP/AD
app.post('/api/ldap/sync', async (req, res) => {
  try {
    // This would sync users from LDAP/AD to local database
    // For demonstration, returning mock data
    
    res.json({
      success: true,
      message: 'User sync initiated',
      summary: {
        usersFound: 150,
        usersCreated: 10,
        usersUpdated: 5,
        usersFailed: 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Sync failed', details: error.message });
  }
});

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
    res.json({ success: true });
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'LDAP/AD Service',
    ldapConfigured: !!process.env.LDAP_URL,
    adConfigured: !!process.env.AD_URL
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`LDAP/AD service running on http://localhost:${PORT}`);
  console.log('');
  console.log('Authentication Methods:');
  console.log('  POST /auth/ldap - LDAP authentication');
  console.log('  POST /auth/ad - Active Directory authentication');
  console.log('  POST /api/ldap/sync - Sync users from directory');
  console.log('');
  console.log('⚠️  IMPORTANT: Configure environment variables:');
  console.log('  LDAP_URL, LDAP_BIND_DN, LDAP_BIND_PASSWORD, LDAP_SEARCH_BASE');
  console.log('  AD_URL, AD_BIND_DN, AD_BIND_PASSWORD, AD_SEARCH_BASE');
  console.log('');
  console.log('See LDAP-SETUP.md for configuration instructions');
});

