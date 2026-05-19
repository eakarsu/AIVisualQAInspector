const rateLimit = require('express-rate-limit');
let ipKeyGenerator;
try {
  ({ ipKeyGenerator } = require('express-rate-limit'));
} catch (_) {
  ipKeyGenerator = (req) => req.ip;
}

const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  keyGenerator: (req, res) => {
    if (req.user && req.user.id) return String(req.user.id);
    if (typeof ipKeyGenerator === 'function') return ipKeyGenerator(req, res);
    return req.ip;
  },
  message: { error: 'AI rate limit exceeded. Max 20 requests per hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { aiRateLimiter };
