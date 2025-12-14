const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'your-secret-key-change-in-production';

// Middleware
app.use(bodyParser.json());

/**
 * @route GET /
 * @description Serve the API documentation HTML page (default route)
 * @access Public
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {HTML} API documentation page
 */
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/api-documentation.html');
});

// Pool of 10 names for mock login
const namePool = [
  'Alice Johnson',
  'Bob Smith',
  'Charlie Brown',
  'Diana Prince',
  'Ethan Hunt',
  'Fiona Green',
  'George Wilson',
  'Hannah Lee',
  'Ivan Torres',
  'Julia Martinez'
];

/**
 * Middleware to verify JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

/**
 * @route POST /login
 * @description Mock login endpoint that returns a random username and JWT token
 * @access Public
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success status, username, and JWT token
 * @example
 * // Response:
 * {
 *   "success": true,
 *   "username": "Alice Johnson",
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * }
 */
app.post('/login', (req, res) => {
  // Pick a random name from the pool
  const randomName = namePool[Math.floor(Math.random() * namePool.length)];
  
  // Create JWT token
  const token = jwt.sign(
    { username: randomName },
    SECRET_KEY,
    { expiresIn: '1h' }
  );

  res.json({
    success: true,
    username: randomName,
    token: token
  });
});

/**
 * @route POST /register
 * @description Mock registration endpoint that returns success without actually registering
 * @access Public
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body (not processed)
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success status and message
 * @example
 * // Response:
 * {
 *   "success": true,
 *   "message": "Registration successful"
 * }
 */
app.post('/register', (req, res) => {
  res.json({
    success: true,
    message: 'Registration successful'
  });
});

/**
 * @route GET /profile
 * @description Get user profile information
 * @access Private (requires JWT authentication)
 * @param {Object} req - Express request object
 * @param {Object} req.user - User information from JWT token (added by authenticateToken middleware)
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success status and profile data
 * @security Bearer
 * @example
 * // Headers:
 * // Authorization: Bearer <jwt_token>
 * //
 * // Response:
 * {
 *   "success": true,
 *   "profile": {
 *     "username": "Alice Johnson",
 *     "email": "alice.johnson@example.com",
 *     "joined": "2024-01-15",
 *     "bio": "This is a dummy profile for testing purposes",
 *     "posts": 42,
 *     "followers": 128,
 *     "following": 95
 *   }
 * }
 */
app.get('/profile', authenticateToken, (req, res) => {
  res.json({
    success: true,
    profile: {
      username: req.user.username,
      email: `${req.user.username.toLowerCase().replace(' ', '.')}@example.com`,
      joined: '2024-01-15',
      bio: 'This is a dummy profile for testing purposes',
      posts: 42,
      followers: 128,
      following: 95
    }
  });
});

/**
 * @route POST /logout
 * @description Logout endpoint that instructs client to clear JWT token
 * @access Public
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success status and message
 * @note This endpoint does not invalidate the token server-side. The client is responsible for clearing the token.
 * @example
 * // Response:
 * {
 *   "success": true,
 *   "message": "Logout successful. Please clear the token on client side."
 * }
 */
app.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful. Please clear the token on client side.'
  });
});

/**
 * @route GET /api-documentation
 * @description Serve the API documentation HTML page
 * @access Public
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {HTML} API documentation page
 * @example
 * // Access via browser: http://localhost:3000/api-documentation
 */
app.get('/api-documentation', (req, res) => {
  res.sendFile(__dirname + '/api-documentation.html');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('\nAvailable routes:');
  console.log('  GET  /         - API documentation (default)');
  console.log('  POST /login    - Get a random username and JWT token');
  console.log('  POST /register - Mock registration');
  console.log('  GET  /profile  - Get user profile (requires JWT)');
  console.log('  POST /logout   - Logout endpoint');
  console.log('  GET  /api-documentation - View API documentation');
});
