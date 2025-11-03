const express = require('express');
const session = require('express-session');
const passport = require('passport');
const SamlStrategy = require('passport-saml').Strategy;
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.SAML_PORT || 3006;

// Middleware
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'saml-session-secret',
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

// SAML Strategy Configuration
const samlStrategy = new SamlStrategy(
  {
    // Service Provider (SP) settings
    callbackUrl: process.env.SAML_CALLBACK_URL || 'http://localhost:3006/auth/saml/callback',
    entryPoint: process.env.SAML_ENTRY_POINT || 'https://login.microsoftonline.com/YOUR_TENANT_ID/saml2',
    issuer: process.env.SAML_ISSUER || 'kpi-dashboard',
    
    // Identity Provider (IdP) certificate
    cert: process.env.SAML_CERT || 'CERTIFICATE_FROM_IDP',
    
    // Optional: SP private key for signing requests
    // privateKey: fs.readFileSync('./certs/sp-key.pem', 'utf-8'),
    // decryptionPvk: fs.readFileSync('./certs/sp-key.pem', 'utf-8'),
    
    // SAML options
    identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
    signatureAlgorithm: 'sha256',
    
    // Attribute mapping
    attributeConsumingServiceIndex: false,
    disableRequestedAuthnContext: true,
    forceAuthn: false,
    
    // For Azure AD
    wantAssertionsSigned: true,
    wantAuthnResponseSigned: false
  },
  (profile, done) => {
    // Map SAML attributes to user object
    const user = {
      id: profile.nameID || profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
      email: profile.email || profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
      name: profile.displayName || profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
      firstName: profile.firstName || profile.givenname,
      lastName: profile.lastName || profile.surname,
      groups: profile.groups || profile['http://schemas.microsoft.com/ws/2008/06/identity/claims/groups'] || [],
      provider: 'saml',
      idpIssuer: profile.issuer,
      sessionIndex: profile.sessionIndex
    };
    
    return done(null, user);
  }
);

passport.use('saml', samlStrategy);

// Routes

// Initiate SAML login
app.get('/auth/saml',
  passport.authenticate('saml', { failureRedirect: '/', failureFlash: true }),
  (req, res) => {
    res.redirect('/');
  }
);

// SAML callback (POST)
app.post('/auth/saml/callback',
  passport.authenticate('saml', { failureRedirect: 'http://localhost:4200/login?error=saml' }),
  (req, res) => {
    res.redirect('http://localhost:4200?saml=success');
  }
);

// Service Provider Metadata (for IdP configuration)
app.get('/auth/saml/metadata', (req, res) => {
  const metadata = samlStrategy.generateServiceProviderMetadata(
    null, // decryptionCert
    null  // signingCert
  );
  res.type('application/xml');
  res.send(metadata);
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
  if (req.user && req.user.sessionIndex) {
    // SAML Single Logout
    samlStrategy.logout(req, (err, request) => {
      if (err) {
        return res.status(500).json({ error: 'Logout failed' });
      }
      req.logout((logoutErr) => {
        if (logoutErr) {
          return res.status(500).json({ error: 'Logout failed' });
        }
        // In production, redirect to IdP logout URL
        res.json({ success: true, logoutUrl: request });
      });
    });
  } else {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: 'Logout failed' });
      }
      res.json({ success: true });
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'SAML SSO Service',
    configured: {
      entryPoint: !!process.env.SAML_ENTRY_POINT,
      certificate: !!process.env.SAML_CERT
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`SAML SSO service running on http://localhost:${PORT}`);
  console.log('');
  console.log('SAML Endpoints:');
  console.log('  GET  /auth/saml - Initiate SAML login');
  console.log('  POST /auth/saml/callback - SAML assertion consumer');
  console.log('  GET  /auth/saml/metadata - SP metadata (for IdP)');
  console.log('  GET  /api/auth/user - Get current user');
  console.log('  POST /api/auth/logout - Logout (with SLO)');
  console.log('');
  console.log('⚠️  IMPORTANT: Configure SAML settings:');
  console.log('  SAML_ENTRY_POINT - IdP SSO URL');
  console.log('  SAML_CERT - IdP certificate');
  console.log('  SAML_ISSUER - SP entity ID');
  console.log('');
  console.log('SP Metadata URL: http://localhost:3006/auth/saml/metadata');
  console.log('');
  console.log('See SAML-SETUP.md for IdP configuration');
});

