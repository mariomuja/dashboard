const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.SCIM_PORT || 3005;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory user storage (use database in production)
let users = [
  {
    id: '1',
    userName: 'admin@example.com',
    name: {
      formatted: 'Admin User',
      familyName: 'User',
      givenName: 'Admin'
    },
    emails: [{ value: 'admin@example.com', primary: true }],
    active: true,
    groups: ['admin'],
    meta: {
      resourceType: 'User',
      created: new Date().toISOString(),
      lastModified: new Date().toISOString()
    }
  }
];

let groups = [
  {
    id: '1',
    displayName: 'admin',
    members: [{ value: '1', display: 'admin@example.com' }],
    meta: {
      resourceType: 'Group',
      created: new Date().toISOString(),
      lastModified: new Date().toISOString()
    }
  }
];

// Bearer token authentication middleware
const authenticateSCIM = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const expectedToken = process.env.SCIM_TOKEN || 'scim-bearer-token-change-in-production';
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      detail: 'Authorization header required',
      status: 401
    });
  }

  const token = authHeader.substring(7);
  if (token !== expectedToken) {
    return res.status(401).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      detail: 'Invalid token',
      status: 401
    });
  }

  next();
};

// SCIM 2.0 Service Provider Config
app.get('/scim/v2/ServiceProviderConfig', (req, res) => {
  res.json({
    schemas: ['urn:ietf:params:scim:schemas:core:2.0:ServiceProviderConfig'],
    documentationUri: 'http://localhost:4200/docs/scim',
    patch: {
      supported: true
    },
    bulk: {
      supported: false,
      maxOperations: 0,
      maxPayloadSize: 0
    },
    filter: {
      supported: true,
      maxResults: 200
    },
    changePassword: {
      supported: true
    },
    sort: {
      supported: true
    },
    etag: {
      supported: false
    },
    authenticationSchemes: [
      {
        name: 'OAuth Bearer Token',
        description: 'Authentication using Bearer Token',
        specUri: 'http://www.rfc-editor.org/info/rfc6750',
        type: 'oauthbearertoken',
        primary: true
      }
    ]
  });
});

// SCIM 2.0 Resource Types
app.get('/scim/v2/ResourceTypes', (req, res) => {
  res.json({
    schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
    totalResults: 2,
    Resources: [
      {
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:ResourceType'],
        id: 'User',
        name: 'User',
        endpoint: '/scim/v2/Users',
        description: 'User Account',
        schema: 'urn:ietf:params:scim:schemas:core:2.0:User'
      },
      {
        schemas: ['urn:ietf:params:scim:schemas:core:2.0:ResourceType'],
        id: 'Group',
        name: 'Group',
        endpoint: '/scim/v2/Groups',
        description: 'Group',
        schema: 'urn:ietf:params:scim:schemas:core:2.0:Group'
      }
    ]
  });
});

// SCIM 2.0 Users Endpoints

// Get all users
app.get('/scim/v2/Users', authenticateSCIM, (req, res) => {
  const { startIndex = 1, count = 100, filter } = req.query;
  
  let filteredUsers = [...users];
  
  // Basic filter support (e.g., userName eq "admin@example.com")
  if (filter) {
    const emailMatch = filter.match(/userName eq "([^"]+)"/);
    if (emailMatch) {
      filteredUsers = filteredUsers.filter(u => u.userName === emailMatch[1]);
    }
  }

  const start = parseInt(startIndex) - 1;
  const end = start + parseInt(count);
  const pagedUsers = filteredUsers.slice(start, end);

  res.json({
    schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
    totalResults: filteredUsers.length,
    startIndex: parseInt(startIndex),
    itemsPerPage: pagedUsers.length,
    Resources: pagedUsers.map(u => ({
      ...u,
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:User']
    }))
  });
});

// Get user by ID
app.get('/scim/v2/Users/:id', authenticateSCIM, (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  
  if (!user) {
    return res.status(404).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      detail: 'User not found',
      status: 404
    });
  }

  res.json({
    schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
    ...user
  });
});

// Create user
app.post('/scim/v2/Users', authenticateSCIM, (req, res) => {
  const { userName, name, emails, active = true } = req.body;

  if (!userName) {
    return res.status(400).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      detail: 'userName is required',
      status: 400
    });
  }

  // Check if user already exists
  if (users.find(u => u.userName === userName)) {
    return res.status(409).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      detail: 'User already exists',
      status: 409
    });
  }

  const newUser = {
    id: (users.length + 1).toString(),
    userName,
    name: name || { formatted: userName },
    emails: emails || [{ value: userName, primary: true }],
    active,
    groups: [],
    meta: {
      resourceType: 'User',
      created: new Date().toISOString(),
      lastModified: new Date().toISOString()
    }
  };

  users.push(newUser);

  res.status(201).json({
    schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
    ...newUser
  });
});

// Update user (PUT)
app.put('/scim/v2/Users/:id', authenticateSCIM, (req, res) => {
  const index = users.findIndex(u => u.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      detail: 'User not found',
      status: 404
    });
  }

  const { userName, name, emails, active, groups } = req.body;
  
  users[index] = {
    ...users[index],
    userName: userName || users[index].userName,
    name: name || users[index].name,
    emails: emails || users[index].emails,
    active: active !== undefined ? active : users[index].active,
    groups: groups || users[index].groups,
    meta: {
      ...users[index].meta,
      lastModified: new Date().toISOString()
    }
  };

  res.json({
    schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
    ...users[index]
  });
});

// Patch user (PATCH)
app.patch('/scim/v2/Users/:id', authenticateSCIM, (req, res) => {
  const index = users.findIndex(u => u.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      detail: 'User not found',
      status: 404
    });
  }

  const { Operations } = req.body;
  
  if (!Operations || !Array.isArray(Operations)) {
    return res.status(400).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      detail: 'Invalid patch operations',
      status: 400
    });
  }

  Operations.forEach(op => {
    if (op.op === 'replace') {
      Object.assign(users[index], op.value);
    }
  });

  users[index].meta.lastModified = new Date().toISOString();

  res.json({
    schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
    ...users[index]
  });
});

// Delete user
app.delete('/scim/v2/Users/:id', authenticateSCIM, (req, res) => {
  const index = users.findIndex(u => u.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      detail: 'User not found',
      status: 404
    });
  }

  users.splice(index, 1);
  res.status(204).send();
});

// SCIM 2.0 Groups Endpoints

// Get all groups
app.get('/scim/v2/Groups', authenticateSCIM, (req, res) => {
  res.json({
    schemas: ['urn:ietf:params:scim:api:messages:2.0:ListResponse'],
    totalResults: groups.length,
    startIndex: 1,
    itemsPerPage: groups.length,
    Resources: groups.map(g => ({
      ...g,
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:Group']
    }))
  });
});

// Get group by ID
app.get('/scim/v2/Groups/:id', authenticateSCIM, (req, res) => {
  const group = groups.find(g => g.id === req.params.id);
  
  if (!group) {
    return res.status(404).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      detail: 'Group not found',
      status: 404
    });
  }

  res.json({
    schemas: ['urn:ietf:params:scim:schemas:core:2.0:Group'],
    ...group
  });
});

// Create group
app.post('/scim/v2/Groups', authenticateSCIM, (req, res) => {
  const { displayName, members = [] } = req.body;

  if (!displayName) {
    return res.status(400).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      detail: 'displayName is required',
      status: 400
    });
  }

  const newGroup = {
    id: (groups.length + 1).toString(),
    displayName,
    members,
    meta: {
      resourceType: 'Group',
      created: new Date().toISOString(),
      lastModified: new Date().toISOString()
    }
  };

  groups.push(newGroup);

  res.status(201).json({
    schemas: ['urn:ietf:params:scim:schemas:core:2.0:Group'],
    ...newGroup
  });
});

// Update group
app.put('/scim/v2/Groups/:id', authenticateSCIM, (req, res) => {
  const index = groups.findIndex(g => g.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      detail: 'Group not found',
      status: 404
    });
  }

  const { displayName, members } = req.body;
  
  groups[index] = {
    ...groups[index],
    displayName: displayName || groups[index].displayName,
    members: members || groups[index].members,
    meta: {
      ...groups[index].meta,
      lastModified: new Date().toISOString()
    }
  };

  res.json({
    schemas: ['urn:ietf:params:scim:schemas:core:2.0:Group'],
    ...groups[index]
  });
});

// Delete group
app.delete('/scim/v2/Groups/:id', authenticateSCIM, (req, res) => {
  const index = groups.findIndex(g => g.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({
      schemas: ['urn:ietf:params:scim:api:messages:2.0:Error'],
      detail: 'Group not found',
      status: 404
    });
  }

  groups.splice(index, 1);
  res.status(204).send();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'SCIM 2.0 Provisioning',
    users: users.length,
    groups: groups.length
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`SCIM 2.0 service running on http://localhost:${PORT}`);
  console.log('');
  console.log('SCIM 2.0 Endpoints:');
  console.log('  GET  /scim/v2/ServiceProviderConfig');
  console.log('  GET  /scim/v2/ResourceTypes');
  console.log('  GET  /scim/v2/Users');
  console.log('  POST /scim/v2/Users');
  console.log('  GET  /scim/v2/Users/:id');
  console.log('  PUT  /scim/v2/Users/:id');
  console.log('  PATCH /scim/v2/Users/:id');
  console.log('  DELETE /scim/v2/Users/:id');
  console.log('  GET  /scim/v2/Groups');
  console.log('  POST /scim/v2/Groups');
  console.log('');
  console.log('⚠️  Bearer Token Required: ' + (process.env.SCIM_TOKEN || 'scim-bearer-token-change-in-production'));
  console.log('');
  console.log('See SCIM-SETUP.md for IdP configuration');
});

