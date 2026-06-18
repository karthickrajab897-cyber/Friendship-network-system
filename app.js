/* ============================================================
   Smart Friendship Network — Node.js Backend Server
   ============================================================
   Run: node app.js
   Then open: http://localhost:3000
   ============================================================ */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// ──────────────── Configuration ────────────────
const PORT = 3000;
const ROOT_DIR = __dirname;

// ──────────────── MIME Types ────────────────
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.webp': 'image/webp',
    '.zip': 'application/zip'
};

// ──────────────── In-Memory Database ────────────────
// This acts as a simple backend data store
let users = [];
let friendships = [];
let friendRequests = [];
let nextId = 100;

// Pre-load demo users
const DEMO_USERS = [
    { id: 1, name: "Ramesh S", email: "ramesh@demo.com", password: "demo123", bio: "CS student passionate about tech.", location: "Karur, India", interests: "coding, art", skills: "python", avatarColor: "#3b82f6" },
    { id: 2, name: "Karthick Raja", email: "karthick@demo.com", password: "demo123", bio: "AI & Web Dev enthusiast.", location: "Chennai, India", interests: "Coding, AI, Web Dev, Machine Learning", skills: "Python, React, TensorFlow, Node.js", avatarColor: "#06b6d4" },
    { id: 3, name: "Grace Kim", email: "grace@demo.com", password: "demo123", bio: "NLP Researcher.", location: "Seoul, South Korea", interests: "AI, NLP, Machine Learning, Coding", skills: "Python, PyTorch, NLTK, Transformers", avatarColor: "#10b981" },
    { id: 4, name: "Alice Chen", email: "alice@demo.com", password: "demo123", bio: "UI/UX Designer.", location: "Taipei, Taiwan", interests: "Design, UI/UX, Photography, Art", skills: "Figma, Adobe XD, CSS, Illustration", avatarColor: "#8b5cf6" },
    { id: 5, name: "Jake Rivera", email: "jake@demo.com", password: "demo123", bio: "Full-stack developer.", location: "Mexico City, Mexico", interests: "Web Dev, Design, Photography, Coding", skills: "JavaScript, React, Node.js, MongoDB", avatarColor: "#f59e0b" },
    { id: 6, name: "Luna Zhang", email: "luna@demo.com", password: "demo123", bio: "Cloud architect.", location: "Beijing, China", interests: "Databases, Distributed Systems, Cloud", skills: "AWS, Kubernetes, Docker, Go", avatarColor: "#ec4899" },
    { id: 7, name: "Marco Silva", email: "marco@demo.com", password: "demo123", bio: "Systems programmer.", location: "São Paulo, Brazil", interests: "Rust, C++, Systems, Art", skills: "Rust, C++, Assembly, Linux", avatarColor: "#14b8a6" },
    { id: 8, name: "Sarah Okonkwo", email: "sarah@demo.com", password: "demo123", bio: "Data scientist.", location: "Lagos, Nigeria", interests: "Python, Data Science, AI, Statistics", skills: "Python, R, Pandas, Tableau, SQL", avatarColor: "#f97316" },
    { id: 9, name: "Dev Patel", email: "dev@demo.com", password: "demo123", bio: "Mobile developer.", location: "Ahmedabad, India", interests: "Flutter, React Native, Design, Coding", skills: "Flutter, Dart, React Native, Firebase", avatarColor: "#a78bfa" },
    { id: 10, name: "Omar Rashid", email: "omar@demo.com", password: "demo123", bio: "Blockchain developer.", location: "Dubai, UAE", interests: "Blockchain, Crypto, Web Dev", skills: "Solidity, Ethereum, Web3.js, React", avatarColor: "#06d6a0" }
];
users = [...DEMO_USERS];
nextId = 100;

// Pre-load some friendships
friendships = [
    { user1: 1, user2: 2 }, { user1: 1, user2: 3 }, { user1: 1, user2: 4 },
    { user1: 2, user2: 3 }, { user1: 2, user2: 5 }, { user1: 3, user2: 6 },
    { user1: 4, user2: 5 }, { user1: 5, user2: 7 }, { user1: 6, user2: 8 }
];

// ──────────────── API Route Handler ────────────────
function handleAPI(req, res, urlPath, body) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // GET /api/users
    if (urlPath === '/api/users' && req.method === 'GET') {
        return sendJSON(res, 200, users.map(u => ({ ...u, password: undefined })));
    }

    // POST /api/users (register)
    if (urlPath === '/api/users' && req.method === 'POST') {
        const data = JSON.parse(body || '{}');
        const newUser = { id: nextId++, ...data };
        users.push(newUser);
        return sendJSON(res, 201, { ...newUser, password: undefined });
    }

    // GET /api/users/:id
    const userMatch = urlPath.match(/^\/api\/users\/(\d+)$/);
    if (userMatch && req.method === 'GET') {
        const user = users.find(u => u.id === parseInt(userMatch[1]));
        if (user) return sendJSON(res, 200, { ...user, password: undefined });
        return sendJSON(res, 404, { error: 'User not found' });
    }

    // GET /api/user/me
    if (urlPath === '/api/user/me') {
        return sendJSON(res, 200, users[0] ? { ...users[0], password: undefined } : {});
    }

    // GET /api/friends/count
    if (urlPath === '/api/friends/count') {
        return sendJSON(res, 200, { count: friendships.length });
    }

    // GET /api/friends/list
    if (urlPath === '/api/friends/list') {
        return sendJSON(res, 200, users.slice(1, 9).map(u => ({ ...u, password: undefined })));
    }

    // GET /api/friends/:userId
    const friendsMatch = urlPath.match(/^\/api\/friends\/(\d+)$/);
    if (friendsMatch && req.method === 'GET') {
        const uid = parseInt(friendsMatch[1]);
        const friendIds = friendships
            .filter(f => f.user1 === uid || f.user2 === uid)
            .map(f => f.user1 === uid ? f.user2 : f.user1);
        const friendList = users.filter(u => friendIds.includes(u.id)).map(u => ({ ...u, password: undefined }));
        return sendJSON(res, 200, friendList);
    }

    // GET /api/mutual/count
    if (urlPath === '/api/mutual/count') {
        return sendJSON(res, 200, { count: 5 });
    }

    // GET /api/friends/mutual/:id1/:id2
    const mutualMatch = urlPath.match(/^\/api\/friends\/mutual\/(\d+)\/(\d+)$/);
    if (mutualMatch) {
        const id1 = parseInt(mutualMatch[1]), id2 = parseInt(mutualMatch[2]);
        const friends1 = new Set(friendships.filter(f => f.user1 === id1 || f.user2 === id1).map(f => f.user1 === id1 ? f.user2 : f.user1));
        const friends2 = new Set(friendships.filter(f => f.user1 === id2 || f.user2 === id2).map(f => f.user1 === id2 ? f.user2 : f.user1));
        const mutual = [...friends1].filter(id => friends2.has(id));
        return sendJSON(res, 200, users.filter(u => mutual.includes(u.id)).map(u => ({ ...u, password: undefined })));
    }

    // GET /api/suggestions
    if (urlPath === '/api/suggestions') {
        const suggestions = users.slice(2).map(u => ({
            ...u, password: undefined,
            match_score: Math.floor(Math.random() * 60) + 30,
            mutual_count: Math.floor(Math.random() * 3)
        }));
        return sendJSON(res, 200, suggestions);
    }

    // GET /api/friend-requests/pending
    if (urlPath === '/api/friend-requests/pending') {
        return sendJSON(res, 200, friendRequests);
    }

    // POST /api/friend-request/send
    if (urlPath === '/api/friend-request/send' && req.method === 'POST') {
        return sendJSON(res, 200, { success: true });
    }

    // POST /api/friend-request/accept or reject
    if (urlPath.startsWith('/api/friend-request/') && req.method === 'POST') {
        return sendJSON(res, 200, { success: true });
    }

    // GET /api/activities
    if (urlPath === '/api/activities') {
        return sendJSON(res, 200, [
            { user_name: "Karthick", action: " accepted your request", target_name: "", icon: "fa-check-circle", time_ago: "1 hr ago" },
            { user_name: "Grace Kim", action: " liked your profile", target_name: "", icon: "fa-heart", time_ago: "2 hr ago" }
        ]);
    }

    // GET /api/search
    if (urlPath.startsWith('/api/search')) {
        const url = new URL('http://localhost' + urlPath);
        const q = (url.searchParams.get('q') || '').toLowerCase();
        const results = users.filter(u => u.name.toLowerCase().includes(q) || (u.interests && u.interests.toLowerCase().includes(q)));
        return sendJSON(res, 200, results.map(u => ({ ...u, password: undefined })));
    }

    // GET /api/dashboard/stats
    if (urlPath === '/api/dashboard/stats') {
        return sendJSON(res, 200, {
            totalUsers: users.length,
            totalConnections: friendships.length,
            pendingRequests: friendRequests.length,
            popularInterests: [{ name: 'Coding', count: 8 }, { name: 'AI', count: 5 }, { name: 'Design', count: 3 }],
            growthData: [2, 4, 6, 8, 10],
            popularSkills: [{ name: 'Python', count: 6 }, { name: 'React', count: 4 }, { name: 'JavaScript', count: 5 }]
        });
    }

    // GET /api/dashboard/user/:id
    const dashUserMatch = urlPath.match(/^\/api\/dashboard\/user\/(\d+)$/);
    if (dashUserMatch) {
        return sendJSON(res, 200, { totalFriends: 8, pendingRequests: 3, likemindedMatches: [] });
    }

    // GET /api/graph/path/:from/:to
    const pathMatch = urlPath.match(/^\/api\/graph\/path\/(\d+)\/(\d+)$/);
    if (pathMatch) {
        const from = parseInt(pathMatch[1]), to = parseInt(pathMatch[2]);
        const fromUser = users.find(u => u.id === from);
        const toUser = users.find(u => u.id === to);
        return sendJSON(res, 200, {
            path: [fromUser, toUser].filter(Boolean).map(u => ({ id: u.id, name: u.name })),
            distance: 2
        });
    }

    // Fallback
    return sendJSON(res, 404, { error: 'API endpoint not found' });
}

function sendJSON(res, status, data) {
    res.writeHead(status);
    res.end(JSON.stringify(data));
}

// ──────────────── Static File Server ────────────────
function serveStaticFile(res, filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 - File Not Found</h1>');
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
}

// ──────────────── HTTP Server ────────────────
const server = http.createServer((req, res) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end();
        return;
    }

    const urlPath = req.url.split('?')[0];

    // ── API Routes ──
    if (urlPath.startsWith('/api/')) {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => handleAPI(req, res, req.url.split('?')[0], body));
        return;
    }

    // ── Static Files ──
    let filePath;
    if (urlPath === '/' || urlPath === '/index.html') {
        filePath = path.join(ROOT_DIR, 'index.html');
    } else {
        filePath = path.join(ROOT_DIR, urlPath);
    }

    // Security: prevent directory traversal
    if (!filePath.startsWith(ROOT_DIR)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    serveStaticFile(res, filePath);
});

// ──────────────── Start Server ────────────────
server.listen(PORT, () => {
    console.log('');
    console.log('  ╔══════════════════════════════════════════════╗');
    console.log('  ║   🌐 Friendship Network Server Running!     ║');
    console.log('  ╠══════════════════════════════════════════════╣');
    console.log(`  ║   Local:   http://localhost:${PORT}             ║`);
    console.log('  ║   Status:  ✅ All systems operational        ║');
    console.log('  ║                                              ║');
    console.log('  ║   Pages:                                     ║');
    console.log(`  ║   • Landing:    http://localhost:${PORT}         ║`);
    console.log(`  ║   • Login:      http://localhost:${PORT}/auth.html  ║`);
    console.log(`  ║   • Dashboard:  http://localhost:${PORT}/dashboard.html ║`);
    console.log(`  ║   • Portfolio:  http://localhost:${PORT}/portfolio.html  ║`);
    console.log('  ║                                              ║');
    console.log('  ║   API Endpoints:                             ║');
    console.log(`  ║   • GET  /api/users                          ║`);
    console.log(`  ║   • POST /api/users (register)               ║`);
    console.log(`  ║   • GET  /api/friends/:id                    ║`);
    console.log(`  ║   • GET  /api/suggestions                    ║`);
    console.log(`  ║   • GET  /api/dashboard/stats                ║`);
    console.log('  ║                                              ║');
    console.log('  ║   Press Ctrl+C to stop the server            ║');
    console.log('  ╚══════════════════════════════════════════════╝');
    console.log('');

    // Auto-open browser
    const url = `http://localhost:${PORT}`;
    switch (process.platform) {
        case 'win32': exec(`start ${url}`); break;
        case 'darwin': exec(`open ${url}`); break;
        default: exec(`xdg-open ${url}`); break;
    }
});

// ──────────────── Graceful Shutdown ────────────────
process.on('SIGINT', () => {
    console.log('\n  🛑 Server shutting down...');
    server.close(() => {
        console.log('  ✅ Server stopped. Goodbye!\n');
        process.exit(0);
    });
});
