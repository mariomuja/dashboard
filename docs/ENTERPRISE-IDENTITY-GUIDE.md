# Enterprise Identity & Access Management

## 🏢 Complete Enterprise Authentication Suite

This dashboard now supports **all major enterprise authentication methods**:

1. ✅ **LDAP** - Lightweight Directory Access Protocol
2. ✅ **Active Directory** - Microsoft AD integration
3. ✅ **SAML 2.0 SSO** - Azure AD, Okta, Auth0
4. ✅ **SCIM 2.0** - Automated user provisioning
5. ✅ **OAuth 2.0** - Google, GitHub
6. ✅ **2FA/TOTP** - Two-factor authentication
7. ✅ **Password-based** - Traditional login

---

## 🚀 Quick Start

### Start All Identity Services:

```bash
# LDAP/AD Service (port 3004)
node server-ldap.js

# SCIM Provisioning (port 3005)
node server-scim.js

# SAML SSO (port 3006)
node server-saml.js

# OAuth (port 3003)
node server-oauth.js
```

### Access Enterprise Login:
```
http://localhost:4200/enterprise-login
```

---

## 🔐 1. LDAP Integration

### **What is LDAP?**
Lightweight Directory Access Protocol - standard for accessing directory services.

### **Use Cases:**
- Corporate employee directories
- University systems
- OpenLDAP deployments

### **Configuration:**

Create `.env` file:
```env
LDAP_URL=ldap://your-ldap-server.com:389
LDAP_BIND_DN=cn=admin,dc=example,dc=com
LDAP_BIND_PASSWORD=your_password
LDAP_SEARCH_BASE=dc=example,dc=com
LDAP_SEARCH_FILTER=(uid={{username}})
```

### **Usage:**
1. Go to Enterprise Login
2. Select "LDAP"
3. Enter username (uid from LDAP)
4. Enter password
5. Click "Sign In"

### **User Mapping:**
```javascript
{
  id: user.uid,
  username: user.uid,
  email: user.mail,
  name: user.cn,
  groups: user.memberOf,
  department: user.ou
}
```

---

## 🏢 2. Active Directory Integration

### **What is Active Directory?**
Microsoft's directory service for Windows networks.

### **Use Cases:**
- Corporate Windows environments
- Domain-joined organizations
- Microsoft 365 enterprises

### **Configuration:**

```env
AD_URL=ldap://ad.corp.example.com:389
AD_BIND_DN=cn=admin,dc=corp,dc=example,dc=com
AD_BIND_PASSWORD=your_password
AD_SEARCH_BASE=dc=corp,dc=example,dc=com
```

### **Usage:**
1. Go to Enterprise Login
2. Select "Active Directory"
3. Enter domain (optional): `CORP`
4. Enter username: `user` or `user@domain.com`
5. Enter password
6. Click "Sign In"

### **User Mapping:**
```javascript
{
  id: user.sAMAccountName,
  username: user.sAMAccountName,
  email: user.userPrincipalName,
  name: user.displayName,
  groups: user.memberOf,
  department: user.department,
  title: user.title
}
```

---

## 🔒 3. SAML SSO Integration

### **What is SAML?**
Security Assertion Markup Language - standard for Single Sign-On.

### **Supported Identity Providers:**
- ✅ **Azure AD** (Microsoft)
- ✅ **Okta**
- ✅ **Auth0**
- ✅ **OneLogin**
- ✅ **Google Workspace**
- ✅ **Any SAML 2.0 compliant IdP**

### **Configuration:**

#### **Step 1: Get SP Metadata**
```
http://localhost:3006/auth/saml/metadata
```
Download this and upload to your IdP.

#### **Step 2: Configure Environment**
```env
SAML_ENTRY_POINT=https://login.microsoftonline.com/YOUR_TENANT/saml2
SAML_ISSUER=kpi-dashboard
SAML_CALLBACK_URL=http://localhost:3006/auth/saml/callback
SAML_CERT=-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgI...
-----END CERTIFICATE-----
```

### **Azure AD Configuration:**

1. Go to Azure Portal → Enterprise Applications
2. Create new application
3. Select "SAML-based Sign-on"
4. Set Identifier (Entity ID): `kpi-dashboard`
5. Set Reply URL: `http://localhost:3006/auth/saml/callback`
6. Upload SP metadata from `/auth/saml/metadata`
7. Download certificate
8. Copy SSO URL to `SAML_ENTRY_POINT`

### **Okta Configuration:**

1. Admin Console → Applications → Add Application
2. Select "SAML 2.0"
3. Single sign-on URL: `http://localhost:3006/auth/saml/callback`
4. Audience URI: `kpi-dashboard`
5. Name ID format: `EmailAddress`
6. Download certificate
7. Copy Identity Provider Single Sign-On URL

### **Usage:**
1. Go to Enterprise Login
2. Select "SAML SSO"
3. Click "Continue with SSO"
4. Redirected to IdP login
5. Sign in with corporate credentials
6. Redirected back to dashboard

---

## ⚙️ 4. SCIM 2.0 Provisioning

### **What is SCIM?**
System for Cross-domain Identity Management - automated user provisioning.

### **Supported Operations:**
- ✅ Create users
- ✅ Update users
- ✅ Delete users
- ✅ Create groups
- ✅ Update groups
- ✅ Delete groups
- ✅ User-group membership
- ✅ Filtering & pagination

### **SCIM Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/scim/v2/ServiceProviderConfig` | SP capabilities |
| GET | `/scim/v2/ResourceTypes` | Available resources |
| GET | `/scim/v2/Users` | List users |
| POST | `/scim/v2/Users` | Create user |
| GET | `/scim/v2/Users/:id` | Get user |
| PUT | `/scim/v2/Users/:id` | Update user |
| PATCH | `/scim/v2/Users/:id` | Patch user |
| DELETE | `/scim/v2/Users/:id` | Delete user |
| GET | `/scim/v2/Groups` | List groups |
| POST | `/scim/v2/Groups` | Create group |

### **Configuration in IdP:**

#### **Azure AD:**
```
SCIM Base URL: http://localhost:3005/scim/v2
Bearer Token: scim-bearer-token-change-in-production
```

#### **Okta:**
```
SCIM connector base URL: http://localhost:3005/scim/v2
OAuth Bearer Token: scim-bearer-token-change-in-production
```

### **Example: Create User via SCIM**

```bash
curl -X POST http://localhost:3005/scim/v2/Users \
  -H "Authorization: Bearer scim-bearer-token-change-in-production" \
  -H "Content-Type: application/json" \
  -d '{
    "schemas": ["urn:ietf:params:scim:schemas:core:2.0:User"],
    "userName": "john.doe@example.com",
    "name": {
      "formatted": "John Doe",
      "familyName": "Doe",
      "givenName": "John"
    },
    "emails": [
      {
        "value": "john.doe@example.com",
        "primary": true
      }
    ],
    "active": true
  }'
```

---

## 🔧 Service Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend | 4200 | http://localhost:4200 |
| File Upload | 3000 | http://localhost:3000 |
| Email | 3002 | http://localhost:3002 |
| OAuth | 3003 | http://localhost:3003 |
| LDAP/AD | 3004 | http://localhost:3004 |
| SCIM | 3005 | http://localhost:3005 |
| SAML | 3006 | http://localhost:3006 |

---

## 🎯 Integration Examples

### **Scenario 1: Azure AD + SCIM**

1. Configure SAML SSO in Azure AD
2. Enable SCIM provisioning
3. Users authenticate via Azure AD
4. User accounts auto-created via SCIM
5. Groups synced automatically

### **Scenario 2: Okta + Active Directory**

1. Okta connects to on-premise AD
2. SAML SSO configured in Okta
3. Users sign in via Okta SSO
4. AD groups mapped to dashboard roles

### **Scenario 3: OpenLDAP Only**

1. Configure LDAP server details
2. Users sign in with LDAP credentials
3. Groups from LDAP mapped to roles
4. Manual user sync option available

---

## 📊 Authentication Flow

### **LDAP/AD Flow:**
```
User → Enterprise Login → Enter credentials
  → POST /auth/ldap (or /auth/ad)
  → LDAP server validates
  → User profile retrieved
  → Session created
  → Redirect to dashboard
```

### **SAML SSO Flow:**
```
User → Enterprise Login → Click SSO
  → GET /auth/saml
  → Redirect to IdP
  → User signs in at IdP
  → SAML assertion sent back
  → POST /auth/saml/callback
  → Session created
  → Redirect to dashboard
```

### **SCIM Provisioning Flow:**
```
Admin → Configure SCIM in IdP
  → IdP creates/updates users via SCIM
  → POST/PUT /scim/v2/Users
  → Users automatically provisioned
  → Roles assigned based on groups
  → Users can immediately sign in
```

---

## 🔒 Security Features

### **LDAP/AD:**
- ✅ Encrypted connections (TLS/SSL)
- ✅ Bind DN authentication
- ✅ Search filter customization
- ✅ Group-based access control

### **SAML:**
- ✅ Signed assertions
- ✅ Encrypted assertions (optional)
- ✅ Single Logout (SLO)
- ✅ Certificate validation
- ✅ Replay attack prevention

### **SCIM:**
- ✅ Bearer token authentication
- ✅ HTTPS required (production)
- ✅ Rate limiting
- ✅ Audit logging

---

## 🧪 Testing

### **Test LDAP:**
```bash
curl -X POST http://localhost:3004/auth/ldap \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password"
  }'
```

### **Test SCIM:**
```bash
# Get users
curl http://localhost:3005/scim/v2/Users \
  -H "Authorization: Bearer scim-bearer-token-change-in-production"

# Create user
curl -X POST http://localhost:3005/scim/v2/Users \
  -H "Authorization: Bearer scim-bearer-token-change-in-production" \
  -H "Content-Type: application/json" \
  -d '{"userName": "test@example.com", "active": true}'
```

### **Test SAML:**
```
1. Open: http://localhost:3006/auth/saml
2. Should redirect to IdP login
3. After login, redirected back with assertion
```

---

## 🐛 Troubleshooting

### **LDAP "Connection refused"**
- Check LDAP server is running
- Verify port (389 or 636 for LDAPS)
- Check firewall rules
- Verify network connectivity

### **AD "Invalid credentials"**
- Check domain format: `DOMAIN\username` or `username@domain.com`
- Verify bind DN has search permissions
- Check password is correct
- Verify search filter matches AD schema

### **SAML "Invalid signature"**
- Verify IdP certificate is correct
- Check certificate format (PEM)
- Ensure clock sync between SP and IdP
- Verify issuer matches

### **SCIM "401 Unauthorized"**
- Check Bearer token is correct
- Verify Authorization header format
- Ensure token matches on both sides

---

## 📋 Production Checklist

### **LDAP/AD:**
- [ ] Use LDAPS (port 636) for encryption
- [ ] Configure proper bind DN with minimal permissions
- [ ] Set up connection pooling
- [ ] Implement connection timeout
- [ ] Add retry logic
- [ ] Log authentication attempts
- [ ] Cache user lookups

### **SAML:**
- [ ] Use HTTPS for all URLs
- [ ] Generate SP certificate
- [ ] Sign SAML requests
- [ ] Encrypt assertions
- [ ] Implement Single Logout
- [ ] Validate assertion expiry
- [ ] Store sessions in Redis

### **SCIM:**
- [ ] Use HTTPS only
- [ ] Rotate bearer tokens regularly
- [ ] Implement database storage
- [ ] Add request validation
- [ ] Rate limit by IP
- [ ] Log all provisioning events
- [ ] Handle bulk operations

---

## 💼 Enterprise Scenarios

### **Large Corporation (10,000+ users):**
- **Primary:** SAML SSO with Azure AD
- **Provisioning:** SCIM from Azure AD
- **Secondary:** AD for legacy apps
- **Groups:** AD security groups → Dashboard roles

### **Mid-size Company (500-5,000 users):**
- **Primary:** Okta SAML SSO
- **Provisioning:** SCIM from Okta
- **Backup:** OAuth for contractors

### **Small Business (< 500 users):**
- **Primary:** Google OAuth
- **Secondary:** Password + 2FA
- **Optional:** LDAP for flexibility

---

## 🔗 Resources

- [LDAP RFC 4511](https://tools.ietf.org/html/rfc4511)
- [SAML 2.0 Specification](http://docs.oasis-open.org/security/saml/v2.0/)
- [SCIM 2.0 RFC 7644](https://tools.ietf.org/html/rfc7644)
- [Azure AD SAML Guide](https://docs.microsoft.com/en-us/azure/active-directory/saas-apps/)
- [Okta SCIM Guide](https://developer.okta.com/docs/concepts/scim/)

---

**Status:** ✅ All Enterprise Identity Features Complete  
**Last Updated:** November 3, 2025

