/* ═══════════════════════════════════════════════════════════════
   Friendship Network — Dashboard Data Logic (ENHANCED)
   ═══════════════════════════════════════════════════════════════ */

let currentUser = null;

/* ─── Demo / Mock Data ─── */
// Free real-looking profile photos from pravatar.cc (no sign-up required)
const DEMO_DATA = {
    user: {
        id: 1,
        name: "Ramesh S",
        bio: "Proceeding Bachelor Degree in Computer Science. Passionate about technology and art.",
        location: "Karur, India",
        avatar_color: "#3b82f6",
        profile_pic: "https://i.pravatar.cc/150?img=61",
        interests: "coding, art",
        skills: "python",
        ideas: "Building an AI-based college management system that automates scheduling and student tracking.",
        vision: "To create tech that bridges the gap between rural students and quality education.",
        stats: { total_friends: 8, mutual_friends: 5, pending_requests: 3, suggested_count: 10 }
    },
    friends: [
        { id: 2, name: "Karthick Raja", avatar_color: "#06b6d4", profile_pic: "https://i.pravatar.cc/150?img=12", bio: "AI & Web Dev enthusiast. Building smart tools for everyday problems.", location: "Chennai, India", interests: "Coding, AI, Web Dev, Machine Learning", skills: "Python, React, TensorFlow, Node.js", ideas: "Developing an AI tutor that adapts to each student's learning pace.", vision: "Democratize education using AI and make it accessible to all." },
        { id: 3, name: "Grace Kim", avatar_color: "#10b981", profile_pic: "https://i.pravatar.cc/150?img=47", bio: "NLP Researcher working on human-language interfaces.", location: "Seoul, South Korea", interests: "AI, NLP, Machine Learning, Coding", skills: "Python, PyTorch, NLTK, Transformers", ideas: "Multilingual AI assistant that understands cultural context.", vision: "Language should never be a barrier to knowledge." },
        { id: 4, name: "Alice Chen", avatar_color: "#8b5cf6", profile_pic: "https://i.pravatar.cc/150?img=44", bio: "UI/UX Designer who believes design solves real problems.", location: "Taipei, Taiwan", interests: "Design, UI/UX, Photography, Art", skills: "Figma, Adobe XD, CSS, Illustration", ideas: "Design system for accessibility-first apps for people with disabilities.", vision: "Beautiful design is inclusive design for everyone." },
        { id: 5, name: "Jake Rivera", avatar_color: "#f59e0b", profile_pic: "https://i.pravatar.cc/150?img=33", bio: "Full-stack developer who codes by day and shoots photos by night.", location: "Mexico City, Mexico", interests: "Web Dev, Design, Photography, Coding", skills: "JavaScript, React, Node.js, MongoDB", ideas: "Open-source platform for freelancers to showcase and get paid.", vision: "Make the internet a fairer marketplace for independent creators." },
        { id: 6, name: "Luna Zhang", avatar_color: "#ec4899", profile_pic: "https://i.pravatar.cc/150?img=25", bio: "Cloud architect scaling services to millions of users.", location: "Beijing, China", interests: "Databases, Distributed Systems, Cloud", skills: "AWS, Kubernetes, Docker, Go", ideas: "Self-healing distributed database for edge computing scenarios.", vision: "Infrastructure should be invisible, resilient, and scalable by default." },
        { id: 7, name: "Marco Silva", avatar_color: "#14b8a6", profile_pic: "https://i.pravatar.cc/150?img=15", bio: "Systems programmer obsessed with performance and low-level code.", location: "São Paulo, Brazil", interests: "Rust, C++, Systems, Art", skills: "Rust, C++, Assembly, Linux", ideas: "Blazing-fast memory-safe OS kernel written in Rust.", vision: "Systems should be safe by default without sacrificing speed." },
        { id: 8, name: "Sarah Okonkwo", avatar_color: "#f97316", profile_pic: "https://i.pravatar.cc/150?img=56", bio: "Data scientist turning numbers into life-changing insights.", location: "Lagos, Nigeria", interests: "Python, Data Science, AI, Statistics", skills: "Python, R, Pandas, Tableau, SQL", ideas: "Healthcare prediction model for early disease detection in Africa.", vision: "Data-driven healthcare is the key to transforming African communities." },
        { id: 9, name: "Dev Patel", avatar_color: "#a78bfa", profile_pic: "https://i.pravatar.cc/150?img=3", bio: "Mobile developer crafting delightful cross-platform apps.", location: "Ahmedabad, India", interests: "Flutter, React Native, Design, Coding", skills: "Flutter, Dart, React Native, Firebase", ideas: "Super app combining social, payments, and local services for India.", vision: "One app to make rural India digitally empowered." }
    ],
    mutual: [
        { id: 2, name: "Karthick Raja", avatar_color: "#06b6d4", profile_pic: "https://i.pravatar.cc/150?img=12", bio: "AI & Web Dev enthusiast", interests: "Coding, AI, Web Dev", skills: "Python, React, TensorFlow" },
        { id: 3, name: "Grace Kim", avatar_color: "#10b981", profile_pic: "https://i.pravatar.cc/150?img=47", bio: "NLP Researcher", interests: "AI, NLP, Machine Learning", skills: "Python, PyTorch, NLTK" },
        { id: 4, name: "Alice Chen", avatar_color: "#8b5cf6", profile_pic: "https://i.pravatar.cc/150?img=44", bio: "UI/UX Designer", interests: "Design, UI/UX, Photography", skills: "Figma, Adobe XD" },
        { id: 5, name: "Jake Rivera", avatar_color: "#f59e0b", profile_pic: "https://i.pravatar.cc/150?img=33", bio: "Full-stack developer", interests: "Web Dev, Design", skills: "JavaScript, React, Node.js" },
        { id: 9, name: "Dev Patel", avatar_color: "#a78bfa", profile_pic: "https://i.pravatar.cc/150?img=3", bio: "Mobile developer", interests: "Flutter, React Native", skills: "Flutter, Dart" }
    ],
    pending: [
        { id: 10, sender_id: 10, sender_name: "Vasagan R", sender_color: "#22d3ee", sender_pic: "https://i.pravatar.cc/150?img=68", sender_bio: "Computer Science student, loves competitive programming.", created_at: "10 min ago" },
        { id: 11, sender_id: 11, sender_name: "Priya Nair", sender_color: "#fb7185", sender_pic: "https://i.pravatar.cc/150?img=49", sender_bio: "Data enthusiast and aspiring ML engineer.", created_at: "25 min ago" },
        { id: 12, sender_id: 12, sender_name: "Arun Kumar", sender_color: "#a3e635", sender_pic: "https://i.pravatar.cc/150?img=7", sender_bio: "Backend engineer passionate about scalable APIs.", created_at: "1 hr ago" }
    ],
    suggestions: [
        { id: 13, name: "Karthick Raja", avatar_color: "#06b6d4", profile_pic: "https://i.pravatar.cc/150?img=12", bio: "AI & Web Dev enthusiast. Building smart tools.", location: "Chennai, India", interests: "Coding, AI, Web Dev, Machine Learning", skills: "Python, React, TensorFlow, Node.js", ideas: "AI tutor that adapts to each student's learning pace.", vision: "Democratize education using AI.", match_score: 92, mutual_count: 0 },
        { id: 14, name: "Grace Kim", avatar_color: "#10b981", profile_pic: "https://i.pravatar.cc/150?img=47", bio: "NLP Researcher working on human-language interfaces.", location: "Seoul, South Korea", interests: "AI, NLP, Machine Learning, Coding", skills: "Python, PyTorch, NLTK, Transformers", ideas: "Multilingual AI assistant that understands cultural context.", vision: "Language should never be a barrier.", match_score: 87, mutual_count: 0 },
        { id: 15, name: "Alice Chen", avatar_color: "#8b5cf6", profile_pic: "https://i.pravatar.cc/150?img=44", bio: "UI/UX Designer. Beautiful design is inclusive design.", location: "Taipei, Taiwan", interests: "Design, UI/UX, Photography, Art", skills: "Figma, Adobe XD, CSS, Illustration", ideas: "Accessibility-first design system for disability apps.", vision: "Beautiful design is inclusive design for everyone.", match_score: 74, mutual_count: 0 },
        { id: 16, name: "Jake Rivera", avatar_color: "#f59e0b", profile_pic: "https://i.pravatar.cc/150?img=33", bio: "Full-stack developer, codes by day, shoots photos by night.", location: "Mexico City, Mexico", interests: "Web Dev, Design, Photography, Coding", skills: "JavaScript, React, Node.js, MongoDB", ideas: "Open-source platform for freelancers to get paid fairly.", vision: "Make internet a fairer marketplace for independent creators.", match_score: 68, mutual_count: 0 },
        { id: 17, name: "Luna Zhang", avatar_color: "#ec4899", profile_pic: "https://i.pravatar.cc/150?img=25", bio: "Cloud architect scaling services to millions.", location: "Beijing, China", interests: "Databases, Distributed Systems, Cloud", skills: "AWS, Kubernetes, Docker, Go", ideas: "Self-healing distributed database for edge computing.", vision: "Infrastructure should be invisible and resilient by default.", match_score: 61, mutual_count: 0 },
        { id: 18, name: "Omar Rashid", avatar_color: "#06d6a0", profile_pic: "https://i.pravatar.cc/150?img=52", bio: "Blockchain developer exploring decentralized finance.", location: "Dubai, UAE", interests: "Blockchain, Crypto, Web Dev", skills: "Solidity, Ethereum, Web3.js, React", ideas: "Decentralized identity system to eliminate password hacks.", vision: "A world where users own their digital identity.", match_score: 55, mutual_count: 0 },
        { id: 19, name: "Mei Lin", avatar_color: "#ff6b6b", profile_pic: "https://i.pravatar.cc/150?img=41", bio: "ML researcher with a love for open-source contributions.", location: "Singapore", interests: "ML, Data Science, Python, Research", skills: "Python, Scikit-learn, Pandas, PyTorch", ideas: "Federated learning framework for privacy-safe medical AI.", vision: "AI research should be open, reproducible, and ethical.", match_score: 50, mutual_count: 0 },
        { id: 20, name: "Ethan Brooks", avatar_color: "#4ecdc4", profile_pic: "https://i.pravatar.cc/150?img=18", bio: "Open-source contributor and Linux power user.", location: "Toronto, Canada", interests: "Open Source, Linux, Coding, Gaming", skills: "C, Bash, Python, Git, Rust", ideas: "Lightweight Linux distro optimized for developers.", vision: "Every developer should have a powerful free tool.", match_score: 45, mutual_count: 0 },
        { id: 21, name: "Zara Ahmed", avatar_color: "#ffd166", profile_pic: "https://i.pravatar.cc/150?img=29", bio: "AI ethicist exploring the intersection of philosophy and technology.", location: "London, UK", interests: "AI, Ethics, Philosophy, Design", skills: "Research, Writing, UX Research, Data Analysis", ideas: "AI audit framework to detect algorithmic bias in hiring systems.", vision: "Technology must be fair, transparent, and accountable.", match_score: 38, mutual_count: 0 },
        { id: 22, name: "Liam O'Brien", avatar_color: "#c77dff", profile_pic: "https://i.pravatar.cc/150?img=65", bio: "DevOps engineer automating everything that can be automated.", location: "Dublin, Ireland", interests: "DevOps, Cloud, Kubernetes, Python", skills: "Kubernetes, Terraform, CI/CD, Python, AWS", ideas: "Zero-downtime deployment tool for small teams.", vision: "Deployment should be a non-event, not a ceremony.", match_score: 33, mutual_count: 0 }
    ],
    activities: [
        { user_name: "Vasagan", action: " sent a friend request to ", target_name: "Raja B", icon: "fa-user-plus", time_ago: "10 min ago" },
        { user_name: "Vasagan", action: " sent a friend request to ", target_name: "ID Checker", icon: "fa-user-plus", time_ago: "10 min ago" },
        { user_name: "Vasagan", action: " sent a friend request to ", target_name: "Test User", icon: "fa-user-plus", time_ago: "10 min ago" },
        { user_name: "Vasagan", action: " sent a friend request to ", target_name: "Karan", icon: "fa-user-plus", time_ago: "10 min ago" },
        { user_name: "Karthick", action: " accepted your request", target_name: "", icon: "fa-check-circle", time_ago: "1 hr ago" },
        { user_name: "Grace Kim", action: " liked your profile", target_name: "", icon: "fa-heart", time_ago: "2 hr ago" }
    ]
};

/* ─── Initialization ─── */
document.addEventListener('DOMContentLoaded', () => {
    // Redirect to login if not logged in
    const stored = localStorage.getItem('sfn_currentUser');
    if (!stored) { window.location.href = 'auth.html'; return; }

    fetchDashboardData();
    setupSearch();
    initCanvasGraph();
    wireHeaderDropdown();
});

function wireHeaderDropdown() {
    // Wire Profile link
    document.querySelectorAll('.dropdown-item').forEach(item => {
        if (item.textContent.trim() === 'Profile') {
            item.addEventListener('click', e => { e.preventDefault(); openProfileModal(); });
        }
        if (item.textContent.trim() === 'Settings') {
            item.addEventListener('click', e => { e.preventDefault(); openSettingsModal(); });
        }
    });
    // Fix logout to clear correct key
    const logoutLink = document.querySelector('.dropdown-item.text-danger');
    if (logoutLink) {
        logoutLink.setAttribute('onclick', "localStorage.removeItem('sfn_currentUser'); window.location.href='auth.html';");
    }
}

async function fetchDashboardData() {
    // ── Primary: read from localStorage (offline / client-side mode) ──
    const stored = localStorage.getItem('sfn_currentUser');
    if (stored) {
        try {
            const logged = JSON.parse(stored);
            // Compute stats from localStorage data
            const allUsers = JSON.parse(localStorage.getItem('sfn_users') || '[]');
            const friends = JSON.parse(localStorage.getItem('sfn_friends_' + logged.id) || '[]');
            const pending = JSON.parse(localStorage.getItem('sfn_pending_' + logged.id) || '[]');
            const suggestions = allUsers.filter(u => u.id !== logged.id && !friends.find(f => f.id === u.id));

            currentUser = {
                id: logged.id,
                name: logged.name,
                email: logged.email || '',
                bio: logged.bio || '',
                location: logged.location || '',
                interests: logged.interests || '',
                skills: logged.skills || '',
                avatar_color: logged.avatarColor || logged.avatar_color || '#3b82f6',
                profile_pic: logged.profile_pic || '',
                stats: {
                    total_friends: friends.length,
                    mutual_friends: 0,
                    pending_requests: pending.length,
                    suggested_count: suggestions.length
                }
            };
        } catch (_) { }
    }

    // ── Fallback: try server ──
    if (!currentUser) {
        try {
            const res = await fetch('/api/user/me');
            if (res.ok) currentUser = await res.json();
        } catch (_) { }
    }

    if (!currentUser) currentUser = DEMO_DATA.user;

    renderProfile(currentUser);
    fetchActivities();
    fetchPendingRequests();
    fetchSuggestions();
    fetchFriendsCount();
    fetchMutualCount();
}

function renderProfile(user) {
    // Header
    const headerName = document.getElementById('header-name');
    const headerAvatar = document.getElementById('header-avatar');
    if (headerName) headerName.textContent = user.name;
    if (headerAvatar) {
        if (user.profile_pic) {
            headerAvatar.innerHTML = `<img src="${user.profile_pic}" alt="" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
            headerAvatar.style.background = 'transparent';
        } else {
            headerAvatar.textContent = user.name.charAt(0);
            headerAvatar.style.background = user.avatar_color;
        }
    }

    // Profile card
    const nameEl = document.getElementById('profile-name');
    const bioEl = document.getElementById('profile-bio');
    if (nameEl) nameEl.textContent = user.name;
    if (bioEl) bioEl.textContent = user.bio || 'No bio provided.';

    const locationEl = document.getElementById('profile-location');
    if (locationEl) {
        if (user.location) {
            locationEl.style.display = 'block';
            locationEl.innerHTML = `<i class="fas fa-map-marker-alt me-1"></i>${user.location}`;
        } else {
            locationEl.style.display = 'none';
        }
    }

    const avatar = document.getElementById('profile-avatar');
    if (avatar) {
        if (user.profile_pic) {
            avatar.innerHTML = `<img src="${user.profile_pic}" alt="${user.name}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
            avatar.style.background = 'transparent';
        } else {
            avatar.innerHTML = user.name.charAt(0);
            avatar.style.background = `linear-gradient(135deg, ${user.avatar_color}, ${adjustColor(user.avatar_color, -30)})`;
        }
    }

    // Interests & Skills
    renderTags('profile-interests', user.interests, 'badge-interest');
    renderTags('profile-skills', user.skills, 'badge-skill');

    // Stats
    const stats = user.stats || { total_friends: 0, mutual_friends: 0, pending_requests: 0, suggested_count: 0 };
    animateCounter('stat-total', stats.total_friends);
    animateCounter('stat-mutual', stats.mutual_friends);
    animateCounter('stat-pending', stats.pending_requests);
    animateCounter('stat-suggested', stats.suggested_count);
}

function renderTags(containerId, csvString, badgeClass) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = '';
    if (!csvString) return;
    csvString.split(',').forEach(item => {
        const span = document.createElement('span');
        span.className = `badge ${badgeClass}`;
        span.textContent = item.trim();
        el.appendChild(span);
    });
}

/* ─── Fetch stats from backend or fallback to demo ─── */
async function fetchFriendsCount() {
    try {
        const res = await fetch('/api/friends/count');
        if (res.ok) {
            const data = await res.json();
            animateCounter('stat-total', data.count);
            return;
        }
    } catch (_) { }
    animateCounter('stat-total', DEMO_DATA.friends.length);
}

async function fetchMutualCount() {
    try {
        const res = await fetch('/api/mutual/count');
        if (res.ok) {
            const data = await res.json();
            animateCounter('stat-mutual', data.count);
            return;
        }
    } catch (_) { }
    animateCounter('stat-mutual', DEMO_DATA.mutual.length);
}

/* ─── Suggestions ─── */
async function fetchSuggestions() {
    // First load real users from localStorage
    let suggestions = [];
    const me = JSON.parse(localStorage.getItem('sfn_currentUser') || 'null');
    if (me) {
        const allUsers = JSON.parse(localStorage.getItem('sfn_users') || '[]');
        const myFriends = JSON.parse(localStorage.getItem('sfn_friends_' + me.id) || '[]');
        const friendIds = new Set(myFriends.map(f => f.id));
        suggestions = allUsers
            .filter(u => u.id !== me.id && !friendIds.has(u.id))
            .map(u => ({ ...u, avatar_color: u.avatarColor || u.avatar_color || '#3b82f6', match_score: Math.floor(Math.random() * 60) + 30, mutual_count: 0 }));
    }
    if (suggestions.length === 0) suggestions = DEMO_DATA.suggestions;

    try {
        const res = await fetch('/api/suggestions');
        if (res.ok) suggestions = await res.json();
    } catch (_) { }
    renderSuggestions(suggestions);
    animateCounter('stat-suggested', suggestions.length);
    const badge = document.getElementById('suggestion-badge');
    if (badge) badge.textContent = suggestions.length;
}

function renderSuggestions(suggestions) {
    const list = document.getElementById('suggestions-list');
    if (!list) return;
    list.innerHTML = '';
    if (suggestions.length === 0) {
        list.innerHTML = '<div class="text-center text-muted p-4 small">No suggestions right now.</div>';
        return;
    }

    suggestions.forEach(s => {
        const matchClass = s.match_score >= 70 ? 'match-high' : s.match_score >= 40 ? 'match-medium' : 'match-low';
        const mutualText = s.mutual_count > 0 ? `${s.mutual_count} mutual friends` : 'No mutual friends';

        const avatarContent = s.profile_pic
            ? `<img src="${s.profile_pic}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`
            : s.name.charAt(0);
        const avatarStyle = s.profile_pic ? 'background: transparent;' : `background: ${s.avatar_color};`;

        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.id = `suggestion-${s.id}`;
        div.innerHTML = `
            <div class="d-flex align-items-center gap-3 mb-2">
                <div class="suggestion-avatar" style="${avatarStyle} cursor:pointer; transition: transform 0.2s, box-shadow 0.2s;"
                    onclick="openUserDetailModal({id:${s.id || 0},name:'${(s.name || '').replace(/'/g, '')}',bio:'${(s.bio || '').replace(/'/g, '')}',location:'${(s.location || '').replace(/'/g, '')}',interests:'${(s.interests || '').replace(/'/g, '')}',skills:'${(s.skills || '').replace(/'/g, '')}',avatar_color:'${s.avatar_color || '#3b82f6'}',profile_pic:'${s.profile_pic || ''}'},false)"
                    onmouseover="this.style.transform='scale(1.1)';this.style.boxShadow='0 0 16px ${s.avatar_color}66'"
                    onmouseout="this.style.transform='scale(1)';this.style.boxShadow='none'">
                    ${avatarContent}
                </div>
                <div class="flex-grow-1 min-width-0">
                    <h6 class="text-light mb-0 small fw-bold text-truncate" style="cursor:pointer;"
                        onclick="openUserDetailModal({id:${s.id || 0},name:'${(s.name || '').replace(/'/g, '')}',bio:'${(s.bio || '').replace(/'/g, '')}',location:'${(s.location || '').replace(/'/g, '')}',interests:'${(s.interests || '').replace(/'/g, '')}',skills:'${(s.skills || '').replace(/'/g, '')}',avatar_color:'${s.avatar_color || '#3b82f6'}',profile_pic:'${s.profile_pic || ''}'},false)">
                        ${s.name}
                    </h6>
                    <small class="text-muted d-block text-truncate" style="font-size:0.72rem;">${s.interests || 'No interests listed'}</small>
                </div>
                <span class="match-badge ${matchClass}"><i class="fas fa-fire" style="font-size:0.6rem;"></i>${s.match_score || '?'}%</span>
            </div>
            <div class="progress-thin mb-2">
                <div class="progress-bar" style="width: 0%;" data-target="${s.match_score}"></div>
            </div>
            <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted" style="font-size:0.7rem;"><i class="fas fa-users me-1"></i>${mutualText}</small>
                <button class="btn btn-connect" id="connect-btn-${s.id}" onclick="sendFriendRequest(${s.id}, this, '${s.name}')">
                    <i class="fas fa-user-plus me-1"></i>Connect
                </button>
            </div>
        `;
        list.appendChild(div);
    });


    setTimeout(() => {
        list.querySelectorAll('.progress-bar').forEach(bar => {
            bar.style.width = bar.dataset.target + '%';
        });
    }, 300);
}

/* ─── Activities ─── */
async function fetchActivities() {
    let activities = DEMO_DATA.activities;
    try {
        const res = await fetch('/api/activities');
        if (res.ok) activities = await res.json();
    } catch (_) { }
    renderActivities(activities);
}

function renderActivities(activities) {
    const list = document.getElementById('activity-list');
    if (!list) return;
    list.innerHTML = '';

    if (activities.length === 0) {
        list.innerHTML = '<li class="list-group-item bg-transparent text-center py-4 text-muted small">No recent activity</li>';
        return;
    }

    activities.forEach(a => {
        const item = document.createElement('div');
        item.className = 'activity-item d-flex align-items-center gap-3';
        item.innerHTML = `
            <div class="activity-icon bg-primary bg-opacity-10 text-primary"><i class="fas ${a.icon || 'fa-bolt'}"></i></div>
            <div class="flex-grow-1 min-width-0">
                <p class="mb-0 small text-light">
                    <span class="fw-semibold">${a.user_name}</span>
                    <span class="text-muted">${a.action}</span>
                    <span class="fw-semibold text-info">${a.target_name || ''}</span>
                </p>
                <small class="text-muted" style="font-size:0.68rem;">${a.time_ago}</small>
            </div>
        `;
        list.appendChild(item);
    });
}

/* ─── Pending Requests ─── */
async function fetchPendingRequests() {
    let requests = DEMO_DATA.pending;
    try {
        const res = await fetch('/api/friend-requests/pending');
        if (res.ok) requests = await res.json();
    } catch (_) { }
    renderPendingRequests(requests);
    const badge = document.getElementById('notif-count');
    if (badge) { badge.textContent = requests.length; badge.style.display = requests.length > 0 ? 'inline' : 'none'; }
    animateCounter('stat-pending', requests.length);
}

function renderPendingRequests(requests) {
    const list = document.getElementById('pending-requests-list');
    if (!list) return;
    list.innerHTML = '';
    if (requests.length === 0) {
        list.innerHTML = '<p class="text-muted small text-center mb-0">No pending requests</p>';
        return;
    }
    requests.forEach(r => {
        const avatarContent = r.sender_pic
            ? `<img src="${r.sender_pic}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`
            : r.sender_name.charAt(0);
        const avatarStyle = r.sender_pic ? 'background: transparent;' : `background:${r.sender_color};`;

        const card = document.createElement('div');
        card.className = 'request-card';
        card.id = `req-card-${r.id}`;
        card.innerHTML = `
            <div class="d-flex align-items-center gap-3 mb-2">
                <div class="suggestion-avatar" style="${avatarStyle} width:36px; height:36px; font-size:0.8rem;">
                    ${avatarContent}
                </div>
                <div>
                    <h6 class="text-light mb-0 small fw-bold">${r.sender_name}</h6>
                    <small class="text-muted" style="font-size:0.7rem;">${r.created_at}</small>
                </div>
            </div>
            <div class="d-flex gap-2">
                <button class="btn btn-sm btn-primary rounded-pill flex-grow-1" style="font-size:0.72rem;" onclick="handleRequest(${r.id}, 'accept', this, '${r.sender_name}')">
                    <i class="fas fa-check me-1"></i>Accept
                </button>
                <button class="btn btn-sm btn-glass rounded-pill flex-grow-1" style="font-size:0.72rem;" onclick="handleRequest(${r.id}, 'reject', this, '${r.sender_name}')">
                    <i class="fas fa-times me-1"></i>Decline
                </button>
            </div>
        `;
        list.appendChild(card);
    });
}

/* ─── Handle Request (Accept / Reject) ─── */
async function handleRequest(requestId, action, btn, senderName) {
    btn.disabled = true;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    try {
        const res = await fetch(`/api/friend-request/${action}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ request_id: requestId })
        });
        if (res.ok || true) { // also update UI in demo mode
            const card = document.getElementById(`req-card-${requestId}`);
            if (card) card.remove();
            if (action === 'accept') {
                showConnectedToast(senderName || 'User');
                // Update stats
                const statEl = document.getElementById('stat-total');
                if (statEl) animateCounter('stat-total', parseInt(statEl.textContent || 0) + 1);
                const pendingEl = document.getElementById('stat-pending');
                if (pendingEl) { const v = Math.max(0, parseInt(pendingEl.textContent || 0) - 1); pendingEl.textContent = v; }
                const badge = document.getElementById('notif-count');
                if (badge) { const v = Math.max(0, parseInt(badge.textContent || 0) - 1); badge.textContent = v; if (parseInt(badge.textContent) === 0) badge.style.display = 'none'; }
            } else {
                showToast(`Declined request from ${senderName}`, 'info');
                const pendingEl = document.getElementById('stat-pending');
                if (pendingEl) { const v = Math.max(0, parseInt(pendingEl.textContent || 0) - 1); pendingEl.textContent = v; }
            }
        } else {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    } catch (_) {
        // Demo mode: remove card anyway
        const card = document.getElementById(`req-card-${requestId}`);
        if (card) card.remove();
        if (action === 'accept') showConnectedToast(senderName || 'User');
        else showToast(`Declined request from ${senderName}`, 'info');
    }
}

/* ─── Send Friend Request (Connect) ─── */
async function sendFriendRequest(targetId, btn, targetName) {
    if (btn && btn.disabled) return;
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Sending...';
    }

    // Save to localStorage so the friends list persists
    const me = JSON.parse(localStorage.getItem('sfn_currentUser') || 'null');
    if (me && targetId) {
        const allUsers = JSON.parse(localStorage.getItem('sfn_users') || '[]');
        const target = allUsers.find(u => u.id === targetId);
        if (target) {
            const friends = JSON.parse(localStorage.getItem('sfn_friends_' + me.id) || '[]');
            if (!friends.find(f => f.id === targetId)) {
                friends.push({
                    id: target.id, name: target.name,
                    avatar_color: target.avatarColor || target.avatar_color || '#3b82f6',
                    bio: target.bio || '', interests: target.interests || '',
                    skills: target.skills || '', location: target.location || '',
                    profile_pic: target.profile_pic || ''
                });
                localStorage.setItem('sfn_friends_' + me.id, JSON.stringify(friends));
            }
        }
    }

    try { await fetch('/api/friend-request/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ target_id: targetId }) }); } catch (_) { }

    if (btn) {
        btn.innerHTML = '<i class="fas fa-check me-1"></i>Sent';
        btn.classList.remove('btn-connect');
        btn.classList.add('btn-glass');
    }
    showConnectedToast(targetName || 'User');
    // Update stats
    const statTotal = document.getElementById('stat-total');
    if (statTotal) animateCounter('stat-total', parseInt(statTotal.textContent || 0) + 1);
}

/* ─── Connected Toast ─── */
function showConnectedToast(name) {
    showToast(`🎉 You're now connected with <strong>${name}</strong>!`, 'success', 4000);
    // Celebrate: trigger glow pulse on stat card
    const statEl = document.getElementById('stat-total');
    if (statEl) {
        statEl.closest('.stat-card')?.classList.add('pulse-stat');
        setTimeout(() => statEl.closest('.stat-card')?.classList.remove('pulse-stat'), 1000);
    }
}

/* ─── Toast Notifications ─── */
function showToast(message, type = 'info', duration = 3000) {
    let container = document.getElementById('fn-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'fn-toast-container';
        container.style.cssText = `
            position: fixed; bottom: 28px; right: 28px; z-index: 9999;
            display: flex; flex-direction: column; gap: 12px; align-items: flex-end;
        `;
        document.body.appendChild(container);
    }

    const colors = { success: '#10b981', warning: '#f59e0b', danger: '#ef4444', info: '#06b6d4' };
    const icons = { success: 'fa-check-circle', warning: 'fa-exclamation-triangle', danger: 'fa-times-circle', info: 'fa-info-circle' };

    const toast = document.createElement('div');
    toast.style.cssText = `
        background: rgba(24,24,27,0.96);
        backdrop-filter: blur(20px);
        border: 1px solid ${colors[type]}44;
        border-left: 3px solid ${colors[type]};
        border-radius: 14px;
        padding: 14px 20px;
        color: #f8fafc;
        font-family: 'Inter', sans-serif;
        font-size: 0.85rem;
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 280px;
        max-width: 380px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.5), 0 0 20px ${colors[type]}22;
        animation: toastIn 0.35s cubic-bezier(0.175,0.885,0.32,1.275) both;
    `;
    toast.innerHTML = `
        <i class="fas ${icons[type]}" style="color:${colors[type]};font-size:1.1rem;flex-shrink:0;"></i>
        <span>${message}</span>
    `;

    // Inject keyframe if not already there
    if (!document.getElementById('toast-keyframes')) {
        const style = document.createElement('style');
        style.id = 'toast-keyframes';
        style.textContent = `
            @keyframes toastIn {
                from { opacity:0; transform: translateX(60px) scale(0.8); }
                to   { opacity:1; transform: translateX(0) scale(1); }
            }
            @keyframes toastOut {
                from { opacity:1; transform: translateX(0) scale(1); }
                to   { opacity:0; transform: translateX(60px) scale(0.8); }
            }
            @keyframes pulseStatCard {
                0%,100% { box-shadow: none; }
                50% { box-shadow: 0 0 30px rgba(16,185,129,0.6); border-color: #10b981; }
            }
            .pulse-stat { animation: pulseStatCard 0.8s ease !important; }
        `;
        document.head.appendChild(style);
    }

    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'toastOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

/* ─── Search ─── */
function setupSearch() {
    const input = document.getElementById('search-input');
    const typeSelect = document.getElementById('search-type');
    const resultsDiv = document.getElementById('search-results');
    if (!input) return;

    input.addEventListener('input', async () => {
        const q = input.value.trim().toLowerCase();
        if (q.length < 2) { resultsDiv.style.display = 'none'; return; }

        // Search demo data first
        const allPeople = [...DEMO_DATA.friends, ...DEMO_DATA.suggestions, ...DEMO_DATA.pending.map(p => ({ id: p.sender_id, name: p.sender_name, avatar_color: p.sender_color, interests: '' }))];
        let results = allPeople.filter(u => u.name.toLowerCase().includes(q) || (u.interests && u.interests.toLowerCase().includes(q)));

        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&type=${typeSelect.value}`);
            if (res.ok) results = await res.json();
        } catch (_) { }

        renderSearchResults(results);
    });

    document.addEventListener('click', e => {
        if (!e.target.closest('.search-wrapper')) resultsDiv.style.display = 'none';
    });
}

function renderSearchResults(results) {
    const div = document.getElementById('search-results');
    if (!div) return;
    div.innerHTML = '';
    if (results.length === 0) {
        div.innerHTML = '<div class="text-muted text-center py-4 small">No users found</div>';
        div.style.display = 'block';
        return;
    }
    results.slice(0, 8).forEach(u => {
        const item = document.createElement('div');
        item.className = 'search-result-item';

        const avatarContent = u.profile_pic
            ? `<img src="${u.profile_pic}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`
            : u.name.charAt(0);
        const avatarStyle = u.profile_pic ? 'background: transparent;' : `background:${u.avatar_color || '#3b82f6'};`;

        item.innerHTML = `
            <div class="search-result-avatar" style="${avatarStyle}">${avatarContent}</div>
            <div class="flex-grow-1 min-width-0">
                <h6 class="text-light mb-0 small fw-bold text-truncate">${u.name}</h6>
                <small class="text-muted d-block text-truncate" style="font-size:0.72rem;">${u.interests || ''}</small>
            </div>
            <button class="btn btn-connect btn-sm" onclick="sendFriendRequest(${u.id}, this, '${u.name}')" style="font-size:0.68rem;">Connect</button>
        `;
        div.appendChild(item);
    });
    div.style.display = 'block';
}

/* ─── Path Finder ─── */
function togglePathFinder() {
    const panel = document.getElementById('path-finder');
    if (!panel) return;
    if (panel.style.display === 'none') { panel.style.display = 'block'; loadPathFinderUsers(); }
    else { panel.style.display = 'none'; }
}

async function loadPathFinderUsers() {
    const fromSelect = document.getElementById('path-from');
    const toSelect = document.getElementById('path-to');
    if (!fromSelect || !toSelect) return;
    fromSelect.innerHTML = '<option value="">Choose from...</option>';
    toSelect.innerHTML = '<option value="">Choose to...</option>';
    [...DEMO_DATA.friends, ...DEMO_DATA.suggestions.slice(0, 5)].forEach(u => {
        fromSelect.innerHTML += `<option value="${u.id}">${u.name}</option>`;
        toSelect.innerHTML += `<option value="${u.id}">${u.name}</option>`;
    });
    if (currentUser) fromSelect.value = '';
}

async function findPath() {
    const from = document.getElementById('path-from').value;
    const to = document.getElementById('path-to').value;
    const resultDiv = document.getElementById('path-result');
    if (!resultDiv) return;
    if (!from || !to) {
        resultDiv.innerHTML = '<div class="text-warning small">Select both users.</div>';
        resultDiv.style.display = 'block';
        return;
    }
    // Demo path result
    const fromUser = [...DEMO_DATA.friends, ...DEMO_DATA.suggestions].find(u => u.id == from);
    const toUser = [...DEMO_DATA.friends, ...DEMO_DATA.suggestions].find(u => u.id == to);
    resultDiv.style.display = 'block';
    resultDiv.innerHTML = `
        <div class="p-3 rounded-3" style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.2);">
            <div class="d-flex align-items-center gap-2 mb-2">
                <i class="fas fa-check-circle text-success"></i>
                <span class="text-light small fw-bold">Path found! 2 connections apart</span>
            </div>
            <div class="d-flex flex-wrap align-items-center gap-2">
                <span class="path-node"><span style="width:24px;height:24px;border-radius:50%;background:#3b82f6;display:inline-flex;align-items:center;justify-content:center;font-size:0.65rem;font-weight:700;color:#fff;">R</span> You</span>
                <span class="path-arrow mx-2"><i class="fas fa-arrow-right"></i></span>
                <span class="path-node"><span style="width:24px;height:24px;border-radius:50%;background:${fromUser?.avatar_color || '#06b6d4'};display:inline-flex;align-items:center;justify-content:center;font-size:0.65rem;font-weight:700;color:#fff;">${(fromUser?.name || '?').charAt(0)}</span> ${fromUser?.name || '?'}</span>
                <span class="path-arrow mx-2"><i class="fas fa-arrow-right"></i></span>
                <span class="path-node"><span style="width:24px;height:24px;border-radius:50%;background:${toUser?.avatar_color || '#10b981'};display:inline-flex;align-items:center;justify-content:center;font-size:0.65rem;font-weight:700;color:#fff;">${(toUser?.name || '?').charAt(0)}</span> ${toUser?.name || '?'}</span>
            </div>
        </div>
    `;
}

/* ─── Counter Animation ─── */
function animateCounter(elementId, target) {
    const el = document.getElementById(elementId);
    if (!el) return;
    target = parseInt(target) || 0;
    let current = 0;
    const increment = Math.max(1, target / 30);
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) { el.textContent = target; clearInterval(timer); }
        else { el.textContent = Math.floor(current); }
    }, 40);
}

/* ─── Color Utility ─── */
function adjustColor(hex, amount) {
    try {
        hex = hex.replace('#', '');
        const num = parseInt(hex, 16);
        const r = Math.min(255, Math.max(0, (num >> 16) + amount));
        const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
        const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
        return '#' + (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
    } catch (_) { return hex; }
}

/* ─── Stat Card Modals ─── */
window.showUserListModal = async function (type) {
    const modalEl = document.getElementById('userListModal');
    if (!modalEl) return;
    const bsModal = new bootstrap.Modal(modalEl);

    const titles = { friends: '👥 Your Connections', mutual: '🤝 Mutual Friends', pending: '⏳ Pending Requests', suggestions: '✨ Suggested Friends' };
    document.getElementById('userListModalLabel').textContent = titles[type] || 'Users';

    // Load from localStorage (real user data)
    const me = JSON.parse(localStorage.getItem('sfn_currentUser') || 'null');
    const allUsers = JSON.parse(localStorage.getItem('sfn_users') || '[]');
    const myFriends = me ? JSON.parse(localStorage.getItem('sfn_friends_' + me.id) || '[]') : [];
    const myPending = me ? JSON.parse(localStorage.getItem('sfn_pending_' + me.id) || '[]') : [];

    let listData = [];
    if (type === 'friends') {
        // Real friends + demo fallback
        listData = myFriends.length > 0 ? myFriends : DEMO_DATA.friends;
    } else if (type === 'mutual') {
        listData = DEMO_DATA.mutual;
    } else if (type === 'pending') {
        listData = myPending.length > 0
            ? myPending.map(p => ({ id: p.sender_id, name: p.sender_name, avatar_color: p.sender_color, bio: p.sender_bio, isPending: true, reqId: p.id }))
            : DEMO_DATA.pending.map(p => ({ id: p.sender_id, name: p.sender_name, avatar_color: p.sender_color, bio: p.sender_bio, isPending: true, reqId: p.id }));
    } else {
        // Suggestions = users not already friends
        const friendIds = new Set(myFriends.map(f => f.id));
        const realSuggestions = allUsers.filter(u => me && u.id !== me.id && !friendIds.has(u.id));
        listData = realSuggestions.length > 0 ? realSuggestions : DEMO_DATA.suggestions;
    }

    // Try backend
    try {
        if (type === 'friends') {
            const r = await fetch('/api/friends/list'); if (r.ok) listData = await r.json();
        } else if (type === 'pending') {
            const r = await fetch('/api/friend-requests/pending'); if (r.ok) { const d = await r.json(); listData = d.map(p => ({ id: p.sender_id, name: p.sender_name, avatar_color: p.sender_color, bio: p.sender_bio, isPending: true, reqId: p.id })); }
        } else if (type === 'suggestions') {
            const r = await fetch('/api/suggestions'); if (r.ok) listData = await r.json();
        }
    } catch (_) { }

    const body = document.getElementById('userListModalBody');
    body.innerHTML = '';

    if (listData.length === 0) {
        body.innerHTML = '<div class="text-center text-muted p-5"><i class="fas fa-users fa-3x mb-3 d-block" style="opacity:0.3;"></i>No users found.</div>';
        bsModal.show();
        return;
    }

    listData.forEach((u, idx) => {
        const name = u.name || u.sender_name || '?';
        const color = u.avatar_color || u.sender_color || u.avatarColor || '#3b82f6';
        const subtext = u.bio || u.interests || u.sender_bio || '';
        const matchScore = u.match_score ? `<span class="match-badge ${u.match_score >= 70 ? 'match-high' : u.match_score >= 40 ? 'match-medium' : 'match-low'} ms-2">${u.match_score}%</span>` : '';
        const pic = u.profile_pic || u.sender_pic;

        const avatarContent = pic
            ? `<img src="${pic}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`
            : name.charAt(0);
        const avatarStyle = pic
            ? `width:44px;height:44px;border-radius:50%;background:transparent;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:1.1rem;margin-right:14px;flex-shrink:0;box-shadow:0 0 12px rgba(0,0,0,0.5);`
            : `width:44px;height:44px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:1.1rem;margin-right:14px;flex-shrink:0;box-shadow:0 0 12px ${color}44;`;

        const item = document.createElement('div');
        item.style.cssText = 'animation: fadeInUp 0.4s ease both;';
        item.style.animationDelay = `${idx * 0.05}s`;
        item.className = 'd-flex align-items-center mb-3 p-3 rounded-3';
        item.style.background = 'rgba(255,255,255,0.03)';
        item.style.border = '1px solid rgba(255,255,255,0.06)';
        item.style.transition = 'all 0.2s';
        item.style.cursor = 'pointer';

        item.innerHTML = `
            <div style="${avatarStyle}">${avatarContent}</div>
            <div class="flex-grow-1 min-width-0">
                <div class="d-flex align-items-center">
                    <h6 class="mb-0 fw-bold text-light" style="font-size:0.9rem;">${name}</h6>
                    ${matchScore}
                </div>
                <small class="text-muted d-block text-truncate" style="font-size:0.75rem;">${subtext ? subtext.substring(0, 60) : ''}</small>
            </div>
            ${!u.isPending ? `<button class="btn btn-connect btn-sm ms-2 flex-shrink-0" style="font-size:0.72rem;" onclick="event.stopPropagation();sendFriendRequest(${u.id || 0},this,'${name.replace(/'/g, "\'")}')" title="Connect"><i class="fas fa-user-plus me-1"></i>Connect</button>` : `
                <div class="d-flex gap-1 ms-2 flex-shrink-0">
                    <button class="btn btn-sm btn-primary rounded-pill" style="font-size:0.68rem;" onclick="event.stopPropagation();handleRequest(${u.reqId},'accept',this,'${name}')"><i class="fas fa-check"></i></button>
                    <button class="btn btn-sm btn-glass rounded-pill" style="font-size:0.68rem;" onclick="event.stopPropagation();handleRequest(${u.reqId},'reject',this,'${name}')"><i class="fas fa-times"></i></button>
                </div>
            `}
        `;
        // Click item to view full profile details
        item.addEventListener('click', () => {
            openUserDetailModal({ id: u.id, name, bio: u.bio || u.sender_bio || '', location: u.location || '', interests: u.interests || '', skills: u.skills || '', avatar_color: color, profile_pic: pic || '' }, false);
        });
        item.addEventListener('mouseenter', () => { item.style.background = 'rgba(255,255,255,0.06)'; item.style.transform = 'translateX(4px)'; });
        item.addEventListener('mouseleave', () => { item.style.background = 'rgba(255,255,255,0.03)'; item.style.transform = 'translateX(0)'; });
        body.appendChild(item);
    });

    bsModal.show();
};

/* ─── View Current User's Profile Modal ─── */
function openProfileModal() {
    if (!currentUser) return;
    openUserDetailModal(currentUser, true);
}

/* ─── View ANY user's profile detail ─── */
function openUserDetailModal(user, isSelf) {
    let existing = document.getElementById('userDetailModal');
    if (existing) existing.remove();

    const color = user.avatar_color || user.avatarColor || '#3b82f6';
    const initials = user.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';
    const picSrc = user.profile_pic || '';
    const interests = user.interests || '';
    const skills = user.skills || '';
    const ideas = user.ideas || '';
    const vision = user.vision || '';

    const tagHtml = (csv, bg, textColor, border) =>
        csv.split(',').filter(Boolean).map(t =>
            `<span style="display:inline-block;background:${bg};color:${textColor};border:1px solid ${border};border-radius:20px;padding:4px 12px;font-size:0.75rem;margin:3px;">${t.trim()}</span>`
        ).join('');

    const modal = document.createElement('div');
    modal.id = 'userDetailModal';
    modal.className = 'modal fade';
    modal.setAttribute('tabindex', '-1');
    modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable" style="max-width:440px;">
            <div class="modal-content" style="background:rgba(14,14,20,0.98);border:1px solid rgba(255,255,255,0.09);border-radius:24px;overflow:hidden;">
                <!-- Banner + Avatar -->
                <div style="height:90px;background:linear-gradient(135deg,${color}88,${color}22);position:relative;flex-shrink:0;">
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"
                        style="position:absolute;top:12px;right:14px;filter:drop-shadow(0 0 4px rgba(0,0,0,0.8));"></button>
                </div>
                <div style="padding:0 24px;margin-top:-45px;position:relative;z-index:2;flex-shrink:0;">
                    <div style="width:90px;height:90px;border-radius:50%;border:3px solid rgba(14,14,20,1);overflow:hidden;background:${color};display:flex;align-items:center;justify-content:center;box-shadow:0 0 28px ${color}66;font-size:2rem;font-weight:800;color:#fff;">
                        ${picSrc ? `<img src="${picSrc}" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.innerHTML='<span style=\\'font-size:2rem;font-weight:800;color:#fff;\\'>${initials}</span>'">` : `<span>${initials}</span>`}
                    </div>
                    ${isSelf ? `<span style="position:absolute;top:8px;right:24px;background:#10b981;color:#fff;font-size:0.7rem;padding:3px 10px;border-radius:20px;font-weight:600;">You</span>` : ''}
                </div>

                <!-- Body -->
                <div class="modal-body" style="padding:12px 24px 8px;color:#fff;">
                    <h4 style="font-weight:800;margin-bottom:2px;">${user.name || 'Unknown'}</h4>
                    ${user.location ? `<p style="color:#71717a;font-size:0.82rem;margin:0 0 8px;"><i class="fas fa-map-marker-alt me-1" style="color:${color};"></i>${user.location}</p>` : ''}
                    ${user.bio ? `<p style="color:#a1a1aa;font-size:0.88rem;line-height:1.5;margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid rgba(255,255,255,0.07);">${user.bio}</p>` : ''}

                    ${interests ? `
                    <div style="margin-bottom:14px;">
                        <h6 style="color:#60a5fa;font-size:0.68rem;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;"><i class="fas fa-heart me-1"></i>Interests</h6>
                        <div>${tagHtml(interests, 'rgba(59,130,246,0.12)', '#93c5fd', 'rgba(59,130,246,0.25)')}</div>
                    </div>` : ''}

                    ${skills ? `
                    <div style="margin-bottom:14px;">
                        <h6 style="color:#c4b5fd;font-size:0.68rem;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;"><i class="fas fa-laptop-code me-1"></i>Skills</h6>
                        <div>${tagHtml(skills, 'rgba(139,92,246,0.12)', '#c4b5fd', 'rgba(139,92,246,0.25)')}</div>
                    </div>` : ''}

                    ${ideas ? `
                    <div style="margin-bottom:14px;background:rgba(251,191,36,0.06);border:1px solid rgba(251,191,36,0.15);border-radius:14px;padding:12px 14px;">
                        <h6 style="color:#fbbf24;font-size:0.68rem;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;"><i class="fas fa-lightbulb me-1"></i>Ideas & Projects</h6>
                        <p style="color:#fde68a;font-size:0.84rem;margin:0;line-height:1.5;">${ideas}</p>
                    </div>` : ''}

                    ${vision ? `
                    <div style="margin-bottom:8px;background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.15);border-radius:14px;padding:12px 14px;">
                        <h6 style="color:#10b981;font-size:0.68rem;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;"><i class="fas fa-rocket me-1"></i>Vision</h6>
                        <p style="color:#6ee7b7;font-size:0.84rem;margin:0;line-height:1.5;">${vision}</p>
                    </div>` : ''}
                </div>

                <!-- Footer -->
                <div class="modal-footer" style="border:none;padding:12px 24px 20px;background:none;flex-wrap:nowrap;justify-content:center;gap:10px;">
                    ${isSelf
            ? `<button class="btn btn-glass rounded-pill w-100" onclick="window.location.href='portfolio.html'" style="font-size:0.85rem;"><i class="fas fa-briefcase me-2"></i>My Portfolio</button>
                           <button class="btn btn-primary rounded-pill w-100" onclick="bootstrap.Modal.getInstance(document.getElementById('userDetailModal')).hide(); openSettingsModal();"><i class="fas fa-edit me-2"></i>Edit Profile</button>`
            : `<button class="btn btn-glass rounded-pill flex-grow-1" onclick="window.location.href='portfolio.html?id=${user.id}'" style="font-size:0.85rem;"><i class="fas fa-user-circle me-2"></i>View Full Profile</button>
                           <button class="btn btn-connect rounded-pill flex-grow-1" onclick="sendFriendRequest(${user.id || 0}, this, '${(user.name || '').replace(/'/g, '')}'); bootstrap.Modal.getInstance(document.getElementById('userDetailModal')).hide();">
                               <i class="fas fa-user-plus me-2"></i>Connect
                           </button>`
        }
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    new bootstrap.Modal(modal).show();
    modal.addEventListener('hidden.bs.modal', () => modal.remove());
}

/* ─── Settings (Edit Profile) ─── */
function openSettingsModal() {
    // Remove existing if any
    let existing = document.getElementById('settingsModalDyn');
    if (existing) existing.remove();

    const u = currentUser || {};
    const modal = document.createElement('div');
    modal.id = 'settingsModalDyn';
    modal.className = 'modal fade';
    modal.setAttribute('tabindex', '-1');
    modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content" style="background:rgba(18,18,24,0.98);border:1px solid rgba(255,255,255,0.08);border-radius:20px;color:#fff;">
                <div class="modal-header border-0 pb-0">
                    <h5 class="modal-title fw-bold"><i class="fas fa-user-edit text-primary me-2"></i>Edit Profile</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body p-4">
                    <!-- Profile Photo -->
                    <div class="text-center mb-4">
                        <div id="settings-avatar-preview" style="width:80px;height:80px;border-radius:50%;margin:0 auto 10px;background:${u.avatar_color || '#3b82f6'};display:flex;align-items:center;justify-content:center;font-size:1.8rem;font-weight:800;cursor:pointer;box-shadow:0 0 20px ${u.avatar_color || '#3b82f6'}55;overflow:hidden;" onclick="document.getElementById('settings-photo-input').click();">
                            ${u.profile_pic ? `<img src="${u.profile_pic}" style="width:100%;height:100%;object-fit:cover;">` : `<span>${(u.name || '?').charAt(0)}</span>`}
                        </div>
                        <input type="file" id="settings-photo-input" accept="image/*" style="display:none;" onchange="previewProfilePhoto(this)">
                        <small style="color:#a1a1aa;font-size:0.75rem;">Click avatar to upload photo</small>
                    </div>
                    <div class="mb-3">
                        <label style="color:#a1a1aa;font-size:0.72rem;text-transform:uppercase;letter-spacing:0.8px;" class="form-label">Full Name</label>
                        <input type="text" class="form-control" id="settings-name" value="${u.name || ''}" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);color:#fff;border-radius:12px;">
                    </div>
                    <div class="mb-3">
                        <label style="color:#a1a1aa;font-size:0.72rem;text-transform:uppercase;letter-spacing:0.8px;" class="form-label">Bio</label>
                        <textarea class="form-control" id="settings-bio" rows="2" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);color:#fff;border-radius:12px;resize:none;">${u.bio || ''}</textarea>
                    </div>
                    <div class="mb-3">
                        <label style="color:#a1a1aa;font-size:0.72rem;text-transform:uppercase;letter-spacing:0.8px;" class="form-label">Location</label>
                        <input type="text" class="form-control" id="settings-location" value="${u.location || ''}" placeholder="City, Country" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);color:#fff;border-radius:12px;">
                    </div>
                    <div class="mb-3">
                        <label style="color:#a1a1aa;font-size:0.72rem;text-transform:uppercase;letter-spacing:0.8px;" class="form-label">Interests <span style="color:#52525b;font-size:0.65rem;">(comma-separated)</span></label>
                        <input type="text" class="form-control" id="settings-interests" value="${u.interests || ''}" placeholder="Coding, Music, Art" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);color:#fff;border-radius:12px;">
                    </div>
                    <div class="mb-3">
                        <label style="color:#a1a1aa;font-size:0.72rem;text-transform:uppercase;letter-spacing:0.8px;" class="form-label">Skills <span style="color:#52525b;font-size:0.65rem;">(comma-separated)</span></label>
                        <input type="text" class="form-control" id="settings-skills" value="${u.skills || ''}" placeholder="Python, React, Design" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);color:#fff;border-radius:12px;">
                    </div>
                </div>
                <div class="modal-footer border-0 pt-0">
                    <button type="button" class="btn btn-glass rounded-pill px-4" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary rounded-pill px-4" onclick="saveSettings()">
                        <i class="fas fa-save me-2"></i>Save Changes
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    new bootstrap.Modal(modal).show();
    modal.addEventListener('hidden.bs.modal', () => modal.remove());
}

let pendingProfilePic = null;

function previewProfilePhoto(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        pendingProfilePic = e.target.result;
        const preview = document.getElementById('settings-avatar-preview');
        if (preview) preview.innerHTML = `<img src="${pendingProfilePic}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
    };
    reader.readAsDataURL(file);
}

function saveSettings() {
    const name = (document.getElementById('settings-name').value || '').trim();
    if (!name) { showToast('Name is required', 'warning'); return; }

    const updates = {
        name,
        bio: (document.getElementById('settings-bio').value || '').trim(),
        location: (document.getElementById('settings-location').value || '').trim(),
        interests: (document.getElementById('settings-interests').value || '').trim(),
        skills: (document.getElementById('settings-skills').value || '').trim()
    };
    if (pendingProfilePic) updates.profile_pic = pendingProfilePic;

    // Save to localStorage
    const stored = JSON.parse(localStorage.getItem('sfn_currentUser') || '{}');
    const updated = { ...stored, ...updates };
    localStorage.setItem('sfn_currentUser', JSON.stringify(updated));

    // Also update in sfn_users array
    const users = JSON.parse(localStorage.getItem('sfn_users') || '[]');
    const idx = users.findIndex(u => u.id === updated.id || u.email === updated.email);
    if (idx !== -1) users[idx] = { ...users[idx], ...updates };
    localStorage.setItem('sfn_users', JSON.stringify(users));

    pendingProfilePic = null;
    showToast('Profile updated! ✅', 'success');

    // Close modal
    const modalEl = document.getElementById('settingsModalDyn');
    if (modalEl) { const bm = bootstrap.Modal.getInstance(modalEl); if (bm) bm.hide(); }

    // Re-render
    currentUser = null;
    fetchDashboardData();
}

// Update settings function alias for legacy modal
async function updateSettings() { saveSettings(); }

/* ═══════════════════════════════════════════════════════════════
   Canvas 2D Network Graph Animation (Always-On Fallback)
   ═══════════════════════════════════════════════════════════════ */
function initCanvasGraph() {
    const container = document.getElementById('dash-network-container');
    if (!container) return;

    // Wait a bit to see if 3D graph loads; if container gets populated, skip
    setTimeout(() => {
        if (container.children.length > 0) return; // 3D graph loaded
        startCanvasAnimation(container);
    }, 2000);

    // Also start canvas immediately as background
    startCanvasAnimation(container);
}

function startCanvasAnimation(container) {
    // Remove any existing canvas
    const existing = container.querySelector('canvas.fn-canvas');
    if (existing) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'fn-canvas';
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border-radius:0 0 20px 20px;';
    container.style.position = 'relative';
    container.insertBefore(canvas, container.firstChild);

    const W = () => container.offsetWidth;
    const H = () => container.offsetHeight;
    canvas.width = W();
    canvas.height = H();

    const ctx = canvas.getContext('2d');

    // Build network nodes
    const NODE_COUNT = 18;
    const CENTER_X = () => canvas.width / 2;
    const CENTER_Y = () => canvas.height / 2;

    const PALETTE = ['#06b6d4', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#3b82f6', '#14b8a6', '#f97316'];
    const NAMES = ['You', 'Karthick', 'Grace', 'Alice', 'Jake', 'Luna', 'Marco', 'Sarah', 'Dev', 'Omar', 'Mei', 'Ethan', 'Zara', 'Liam', 'Priya', 'Arun', 'Vasagan', 'Ravi'];

    const nodes = [];
    // Center node = current user
    nodes.push({ x: 0, y: 0, vx: 0, vy: 0, r: 18, color: '#3b82f6', label: 'You', group: 'main', angle: 0, pulsePhase: 0 });

    // Direct friends ring
    for (let i = 0; i < 7; i++) {
        const angle = (i / 7) * Math.PI * 2;
        const dist = 120 + Math.random() * 20;
        nodes.push({
            x: Math.cos(angle) * dist, y: Math.sin(angle) * dist,
            vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
            r: 11, color: PALETTE[i % PALETTE.length],
            label: NAMES[i + 1], group: 'direct',
            angle, dist, pulsePhase: Math.random() * Math.PI * 2
        });
    }

    // 2nd degree nodes
    for (let i = 0; i < NODE_COUNT - 8; i++) {
        const angle = (i / (NODE_COUNT - 8)) * Math.PI * 2 + 0.2;
        const dist = 210 + Math.random() * 40;
        nodes.push({
            x: Math.cos(angle) * dist, y: Math.sin(angle) * dist,
            vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
            r: 7, color: '#8b5cf6',
            label: NAMES[i + 8] || '?', group: 'indirect',
            angle, dist, pulsePhase: Math.random() * Math.PI * 2
        });
    }

    // Build edges
    const edges = [];
    // Star: center to all direct friends
    for (let i = 1; i <= 7; i++) edges.push({ a: 0, b: i });
    // Some cross edges
    edges.push({ a: 1, b: 2 }, { a: 2, b: 3 }, { a: 3, b: 5 }, { a: 1, b: 4 }, { a: 4, b: 6 }, { a: 5, b: 7 });
    // 2nd degree to direct
    for (let i = 8; i < nodes.length; i++) {
        const parent = 1 + Math.floor(Math.random() * 7);
        edges.push({ a: parent, b: i });
    }

    // Particles on edges
    const particles = edges.map((e) => ({
        edge: e,
        t: Math.random(),
        speed: 0.002 + Math.random() * 0.003
    }));

    let frame = 0;
    let camAngle = 0;

    function draw() {
        const W2 = canvas.width;
        const H2 = canvas.height;
        const cx = W2 / 2;
        const cy = H2 / 2;

        ctx.clearRect(0, 0, W2, H2);

        // Background gradient
        const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W2, H2) * 0.7);
        bg.addColorStop(0, 'rgba(30,20,60,0.4)');
        bg.addColorStop(1, 'rgba(9,9,11,0.0)');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W2, H2);

        camAngle += 0.003;
        frame++;

        // Slowly rotate nodes
        const cosA = Math.cos(camAngle * 0.1);
        const sinA = Math.sin(camAngle * 0.1);

        // Pre-transform node positions
        const pos = nodes.map(n => {
            const rx = n.x * cosA - n.y * sinA;
            const ry = n.x * sinA + n.y * cosA;
            return { x: cx + rx, y: cy + ry * 0.85 };
        });

        // Draw edges
        edges.forEach(e => {
            const pa = pos[e.a];
            const pb = pos[e.b];
            const grad = ctx.createLinearGradient(pa.x, pa.y, pb.x, pb.y);
            const colorA = nodes[e.a].color;
            const colorB = nodes[e.b].color;
            grad.addColorStop(0, colorA + '55');
            grad.addColorStop(1, colorB + '22');
            ctx.strokeStyle = grad;
            ctx.lineWidth = e.a === 0 ? 1.5 : 0.8;
            ctx.beginPath();
            ctx.moveTo(pa.x, pa.y);
            ctx.lineTo(pb.x, pb.y);
            ctx.stroke();
        });

        // Draw particles
        particles.forEach(p => {
            p.t += p.speed;
            if (p.t > 1) p.t = 0;
            const pa = pos[p.edge.a];
            const pb = pos[p.edge.b];
            const px = pa.x + (pb.x - pa.x) * p.t;
            const py = pa.y + (pb.y - pa.y) * p.t;
            const color = nodes[p.edge.a].color;
            ctx.beginPath();
            ctx.arc(px, py, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = color + 'cc';
            ctx.fill();
            // Glow
            const g2 = ctx.createRadialGradient(px, py, 0, px, py, 6);
            g2.addColorStop(0, color + '88');
            g2.addColorStop(1, color + '00');
            ctx.beginPath();
            ctx.arc(px, py, 6, 0, Math.PI * 2);
            ctx.fillStyle = g2;
            ctx.fill();
        });

        // Draw nodes
        nodes.forEach((n, i) => {
            const { x, y } = pos[i];
            const pulse = Math.sin(frame * 0.04 + n.pulsePhase) * 2;

            // Glow
            const glowR = n.r + 10 + pulse;
            const glow = ctx.createRadialGradient(x, y, n.r * 0.5, x, y, glowR);
            glow.addColorStop(0, n.color + '88');
            glow.addColorStop(1, n.color + '00');
            ctx.beginPath();
            ctx.arc(x, y, glowR, 0, Math.PI * 2);
            ctx.fillStyle = glow;
            ctx.fill();

            // Node circle
            ctx.beginPath();
            ctx.arc(x, y, n.r + (n.group === 'main' ? pulse * 0.5 : 0), 0, Math.PI * 2);
            const nodeGrad = ctx.createRadialGradient(x - n.r * 0.3, y - n.r * 0.3, 0, x, y, n.r);
            nodeGrad.addColorStop(0, lighten(n.color, 40));
            nodeGrad.addColorStop(1, n.color);
            ctx.fillStyle = nodeGrad;
            ctx.fill();

            // Ring for main node
            if (n.group === 'main') {
                ctx.beginPath();
                ctx.arc(x, y, n.r + 5 + pulse, 0, Math.PI * 2);
                ctx.strokeStyle = n.color + '88';
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            // Label
            if (n.group !== 'indirect' || i % 3 === 0) {
                ctx.font = `${n.group === 'main' ? 'bold 11px' : '10px'} Inter, sans-serif`;
                ctx.textAlign = 'center';
                ctx.fillStyle = '#ffffff';
                ctx.globalAlpha = 0.85;
                ctx.fillText(n.label.length > 8 ? n.label.split(' ')[0] : n.label, x, y + n.r + 14);
                ctx.globalAlpha = 1;
            }
        });

        // Legend overlay
        const legendItems = [
            { color: '#06b6d4', label: 'You' },
            { color: '#10b981', label: 'Friends' },
            { color: '#8b5cf6', label: '2nd Degree' }
        ];
        ctx.font = '11px Inter, sans-serif';
        legendItems.forEach((item, i) => {
            const lx = 16, ly = H2 - 20 - i * 20;
            ctx.beginPath();
            ctx.arc(lx + 5, ly, 5, 0, Math.PI * 2);
            ctx.fillStyle = item.color;
            ctx.fill();
            ctx.fillStyle = '#a1a1aa';
            ctx.textAlign = 'left';
            ctx.fillText(item.label, lx + 14, ly + 4);
        });

        requestAnimationFrame(draw);
    }

    draw();

    // Resize
    window.addEventListener('resize', () => {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
    });
}

function lighten(hex, amount = 30) {
    try {
        hex = hex.replace('#', '');
        const num = parseInt(hex, 16);
        const r = Math.min(255, (num >> 16) + amount);
        const g = Math.min(255, ((num >> 8) & 0x00FF) + amount);
        const b = Math.min(255, (num & 0x0000FF) + amount);
        return '#' + (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
    } catch (_) { return hex; }
}
