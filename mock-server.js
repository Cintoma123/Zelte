/**
 * Simple Mock API Server for Zelte Testing
 * 
 * Provides fake endpoints for API testing:
 * - GET /api/health - Health check
 * - POST /api/login - User login
 * - GET /api/profile - User profile
 * - PUT /api/profile - Update profile
 * - DELETE /api/profile - Delete profile
 */

const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 8080;

// Mock data
let users = {
  'test-user': {
    id: 1,
    username: 'test-user',
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User'
  }
};

let sessions = {};

// Utility functions
function parseBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', chunk => body += chunk.toString());
    request.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
    request.on('error', reject);
  });
}

function sendResponse(response, statusCode, data) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(data));
}

// Request handler
async function handleRequest(request, response) {
  const parsedUrl = url.parse(request.url, true);
  const pathname = parsedUrl.pathname;
  const method = request.method;

  // Enable CORS
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    response.writeHead(200);
    response.end();
    return;
  }

  // Routes
  if (pathname === '/api/health') {
    return sendResponse(response, 200, {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'zelte-mock-backend'
    });
  }

  if (pathname === '/api/login' && method === 'POST') {
    const body = await parseBody(request);
    const { username, password } = body;

    if (!username || !password) {
      return sendResponse(response, 400, {
        error: 'Missing username or password'
      });
    }

    const user = users[username];
    if (!user || user.password !== password) {
      return sendResponse(response, 401, {
        error: 'Invalid credentials'
      });
    }

    const token = `token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessions[token] = { userId: user.id, username: user.username };

    return sendResponse(response, 200, {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name
      }
    });
  }

  if (pathname === '/api/profile' && method === 'GET') {
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      return sendResponse(response, 401, { error: 'Missing authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const session = sessions[token];

    if (!session) {
      return sendResponse(response, 401, { error: 'Invalid token' });
    }

    const user = Object.values(users).find(u => u.id === session.userId);
    if (!user) {
      return sendResponse(response, 404, { error: 'User not found' });
    }

    return sendResponse(response, 200, {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name
    });
  }

  if (pathname === '/api/profile' && method === 'PUT') {
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      return sendResponse(response, 401, { error: 'Missing authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const session = sessions[token];

    if (!session) {
      return sendResponse(response, 401, { error: 'Invalid token' });
    }

    const body = await parseBody(request);
    const user = Object.values(users).find(u => u.id === session.userId);

    if (!user) {
      return sendResponse(response, 404, { error: 'User not found' });
    }

    // Update user
    if (body.name) user.name = body.name;
    if (body.email) user.email = body.email;

    return sendResponse(response, 200, {
      message: 'Profile updated',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name
      }
    });
  }

  if (pathname === '/api/profile' && method === 'DELETE') {
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      return sendResponse(response, 401, { error: 'Missing authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const session = sessions[token];

    if (!session) {
      return sendResponse(response, 401, { error: 'Invalid token' });
    }

    // Delete user's session
    delete sessions[token];

    return sendResponse(response, 200, {
      message: 'Profile deleted successfully'
    });
  }

  // 404
  sendResponse(response, 404, {
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /api/health',
      'POST /api/login',
      'GET /api/profile',
      'PUT /api/profile',
      'DELETE /api/profile'
    ]
  });
}

// Create and start server
const server = http.createServer(handleRequest);
server.listen(PORT, () => {
  console.log(`
🚀 Mock API Server Running
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Server: http://localhost:${PORT}
  
Available Endpoints:
  GET  /api/health           - Health check
  POST /api/login            - Login (username, password)
  GET  /api/profile          - Get profile (requires Bearer token)
  PUT  /api/profile          - Update profile (requires Bearer token)
  DELETE /api/profile        - Delete profile (requires Bearer token)

Test Credentials:
  Username: test-user
  Password: password123

Start Testing:
  npx zelte init test-collection
  npx zelte run
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Server shutting down...');
  server.close(() => process.exit(0));
});
