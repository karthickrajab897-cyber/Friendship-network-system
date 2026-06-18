/* ═══════════════════════════════════════════════════════════════
   Friendship Network — Dashboard Data Logic
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    fetchDashboardData();
    setupSearch();
});

// ═══ Global State ═══
let currentUser = null;

// ═══════════════════════════════════════════════════════════════
//  FETCH & RENDER USER PROFILE
// ═══════════════════════════════════════════════════════════════

async function fetchDashboardData() {
    try {
        const res = await fetch('/api/user/me');
        if (!res.ok) {
            window.location.href = '/auth';
            return;
        }
        currentUser = await res.json();
        renderProfile(currentUser);
        fetchSuggestions();
        fetchActivities();
        fetchPendingRequests();
    } catch (err) {
        console.error('Dashboard fetch error:', err);
    }
}

function renderProfile(user) {
    // Header
    document.getElementById('header-name').textContent = user.name;
    const headerAvatar = document.getElementById('header-avatar');
    headerAvatar.textContent = user.name.charAt(0);
    headerAvatar.style.background = user.avatar_color;

    // Profile Card
    document.getElementById('profile-name').textContent = user.name;
    document.getElementById('profile-bio').textContent = user.bio || 'No bio provided.';

    const locationEl = document.getElementById('profile-location');
    if (user.location) {
        locationEl.innerHTML = `<i class="fas fa-map-marker-alt me-1"></i>${user.location}`;
    } else {
        locationEl.style.display = 'none';
    }

    const avatar = document.getElementById('profile-avatar');
    avatar.textContent = user.name.charAt(0);
    avatar.style.background = `linear-gradient(135deg, ${user.avatar_color}, ${adjustColor(user.avatar_color, -30)})`;

    // Interests
    const interestsEl = document.getElementById('profile-interests');
    interestsEl.innerHTML = '';
    if (user.interests) {
        user.interests.split(',').forEach(i => {
            const span = document.createElement('span');
            span.className = 'badge badge-interest';
            span.textContent = i.trim();
            interestsEl.appendChild(span);
        });
    }

    // Skills
    const skillsEl = document.getElementById('profile-skills');
    skillsEl.innerHTML = '';
    if (user.skills) {
        user.skills.split(',').forEach(s => {
            const span = document.createElement('span');
            span.className = 'badge badge-skill';
            span.textContent = s.trim();
            skillsEl.appendChild(span);
        });
    }

    // Stats
    const stats = user.stats;
    animateCounter('stat-total', stats.total_friends);
    animateCounter('stat-mutual', stats.mutual_friends);
    animateCounter('stat-pending', stats.pending_requests);
}

// ═══════════════════════════════════════════════════════════════
//  FRIEND SUGGESTIONS
// ═══════════════════════════════════════════════════════════════

async function fetchSuggestions() {
    try {
        const res = await fetch('/api/suggestions');
        const suggestions = await res.json();
        renderSuggestions(suggestions);
        animateCounter('stat-suggested', suggestions.length);
        document.getElementById('suggestion-badge').textContent = suggestions.length;
    } catch (err) {
        console.warn('Suggestions fetch failed:', err);
    }
}

function renderSuggestions(suggestions) {
    const list = document.getElementById('suggestions-list');
    list.innerHTML = '';

    if (suggestions.length === 0) {
        list.innerHTML = '<div class="text-center text-muted py-5"><i class="fas fa-users fa-2x mb-3 d-block"></i><p class="small">No suggestions available</p></div>';
        return;
    }

    suggestions.forEach(s => {
        const matchClass = s.match_score >= 70 ? 'match-high' : s.match_score >= 40 ? 'match-medium' : 'match-low';
        const mutualText = s.mutual_count > 0 ? `${s.mutual_count} mutual friend${s.mutual_count > 1 ? 's' : ''}` : 'No mutual friends';

        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.innerHTML = `
            <div class="d-flex align-items-center gap-3 mb-2">
                <div class="suggestion-avatar" style="background: ${s.avatar_color};">${s.name.charAt(0)}</div>
                <div class="flex-grow-1 min-width-0">
                    <h6 class="text-light mb-0 small fw-bold text-truncate">${s.name}</h6>
                    <small class="text-muted d-block text-truncate" style="font-size:0.72rem;">${s.interests || 'No interests listed'}</small>
                </div>
                <span class="match-badge ${matchClass}">
                    <i class="fas fa-fire" style="font-size:0.6rem;"></i>${s.match_score}%
                </span>
            </div>
            <div class="progress-thin mb-2">
                <div class="progress-bar" role="progressbar" style="width: 0%;" data-target="${s.match_score}"></div>
            </div>
            <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted" style="font-size:0.7rem;"><i class="fas fa-users me-1"></i>${mutualText}</small>
                <button class="btn btn-connect" onclick="sendFriendRequest(${s.id}, this)">
                    <i class="fas fa-user-plus me-1"></i>Connect
                </button>
            </div>
        `;
        list.appendChild(div);
    });

    // Animate progress bars
    setTimeout(() => {
        list.querySelectorAll('.progress-bar').forEach(bar => {
            bar.style.width = bar.dataset.target + '%';
        });
    }, 300);
}

// ═══════════════════════════════════════════════════════════════
//  ACTIVITY FEED
// ═══════════════════════════════════════════════════════════════

async function fetchActivities() {
    try {
        const res = await fetch('/api/activities');
        const activities = await res.json();
        renderActivities(activities);
    } catch (err) {
        console.warn('Activities fetch failed:', err);
    }
}

function renderActivities(activities) {
    const list = document.getElementById('activity-list');
    list.innerHTML = '';

    if (activities.length === 0) {
        list.innerHTML = '<li class="bg-transparent text-muted text-center py-4 small">No recent activity</li>';
        return;
    }

    const iconColors = {
        'fa-rocket': 'bg-success bg-opacity-10 text-success',
        'fa-link': 'bg-primary bg-opacity-10 text-primary',
        'fa-user-plus': 'bg-info bg-opacity-10 text-info',
        'fa-handshake': 'bg-warning bg-opacity-10 text-warning',
        'fa-code': 'bg-danger bg-opacity-10 text-danger',
        'fa-bolt': 'bg-warning bg-opacity-10 text-warning'
    };

    activities.forEach(a => {
        const colorClass = iconColors[a.icon] || 'bg-secondary bg-opacity-10 text-secondary';
        const item = document.createElement('div');
        item.className = 'activity-item d-flex align-items-center gap-3';
        item.innerHTML = `
            <div class="activity-icon ${colorClass}">
                <i class="fas ${a.icon}"></i>
            </div>
            <div class="flex-grow-1 min-width-0">
                <p class="mb-0 small text-light">
                    <span class="fw-semibold">${a.user_name}</span>
                    <span class="text-muted">${a.action}</span>
                    <span class="fw-semibold text-info">${a.target_name}</span>
                </p>
                <small class="text-muted" style="font-size:0.68rem;">${a.time_ago}</small>
            </div>
        `;
        list.appendChild(item);
    });
}

// ═══════════════════════════════════════════════════════════════
//  FRIEND REQUESTS
// ═══════════════════════════════════════════════════════════════

async function fetchPendingRequests() {
    try {
        const res = await fetch('/api/friend-requests/pending');
        const requests = await res.json();
        renderPendingRequests(requests);
        const badge = document.getElementById('notif-count');
        if (requests.length > 0) {
            badge.textContent = requests.length;
            badge.style.display = 'inline';
        } else {
            badge.style.display = 'none';
        }
    } catch (err) {
        console.warn('Pending requests fetch failed:', err);
    }
}

function renderPendingRequests(requests) {
    const list = document.getElementById('pending-requests-list');
    list.innerHTML = '';

    if (requests.length === 0) {
        list.innerHTML = '<p class="text-muted small text-center mb-0">No pending requests</p>';
        return;
    }

    requests.forEach(r => {
        const card = document.createElement('div');
        card.className = 'request-card';
        card.innerHTML = `
            <div class="d-flex align-items-center gap-3 mb-2">
                <div class="suggestion-avatar" style="background:${r.sender_color}; width:36px; height:36px; font-size:0.8rem;">${r.sender_name.charAt(0)}</div>
                <div>
                    <h6 class="text-light mb-0 small fw-bold">${r.sender_name}</h6>
                    <small class="text-muted" style="font-size:0.7rem;">${r.created_at}</small>
                </div>
            </div>
            <div class="d-flex gap-2">
                <button class="btn btn-sm btn-primary rounded-pill flex-grow-1" style="font-size:0.72rem;" onclick="acceptRequest(${r.id}, this)">
                    <i class="fas fa-check me-1"></i>Accept
                </button>
                <button class="btn btn-sm btn-glass rounded-pill flex-grow-1" style="font-size:0.72rem;" onclick="rejectRequest(${r.id}, this)">
                    <i class="fas fa-times me-1"></i>Decline
                </button>
            </div>
        `;
        list.appendChild(card);
    });
}

async function sendFriendRequest(targetId, btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Sending...';
    try {
        const res = await fetch('/api/friend-request/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ target_id: targetId })
        });
        if (res.ok) {
            btn.innerHTML = '<i class="fas fa-check me-1"></i>Sent';
            btn.classList.remove('btn-connect');
            btn.classList.add('btn-glass');
        } else {
            const data = await res.json();
            btn.innerHTML = data.error || 'Error';
            btn.disabled = false;
        }
    } catch (err) {
        btn.innerHTML = 'Error';
        btn.disabled = false;
    }
}

async function acceptRequest(requestId, btn) {
    btn.disabled = true;
    try {
        const res = await fetch('/api/friend-request/accept', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ request_id: requestId })
        });
        if (res.ok) {
            btn.closest('.request-card').remove();
            fetchDashboardData(); // Refresh stats
        }
    } catch (err) {
        console.error('Accept request failed:', err);
    }
}

async function rejectRequest(requestId, btn) {
    btn.disabled = true;
    try {
        const res = await fetch('/api/friend-request/reject', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ request_id: requestId })
        });
        if (res.ok) {
            btn.closest('.request-card').remove();
            fetchPendingRequests();
        }
    } catch (err) {
        console.error('Reject request failed:', err);
    }
}

// ═══════════════════════════════════════════════════════════════
//  SEARCH
// ═══════════════════════════════════════════════════════════════

function setupSearch() {
    const input = document.getElementById('search-input');
    const typeSelect = document.getElementById('search-type');
    const resultsDiv = document.getElementById('search-results');
    let debounceTimer = null;

    input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        const q = input.value.trim();
        if (q.length < 2) {
            resultsDiv.style.display = 'none';
            return;
        }
        debounceTimer = setTimeout(() => performSearch(q, typeSelect.value), 300);
    });

    typeSelect.addEventListener('change', () => {
        const q = input.value.trim();
        if (q.length >= 2) performSearch(q, typeSelect.value);
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-wrapper')) {
            resultsDiv.style.display = 'none';
        }
    });
}

async function performSearch(query, type) {
    const resultsDiv = document.getElementById('search-results');
    try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${type}`);
        const results = await res.json();
        renderSearchResults(results);
    } catch (err) {
        resultsDiv.innerHTML = '<div class="text-muted text-center py-3 small">Search failed</div>';
        resultsDiv.style.display = 'block';
    }
}

function renderSearchResults(results) {
    const div = document.getElementById('search-results');
    div.innerHTML = '';

    if (results.length === 0) {
        div.innerHTML = '<div class="text-muted text-center py-4 small"><i class="fas fa-search mb-2 d-block"></i>No users found</div>';
        div.style.display = 'block';
        return;
    }

    results.forEach(u => {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        const friendBadge = u.is_friend
            ? '<span class="badge badge-interest" style="font-size:0.65rem;">Friend</span>'
            : `<button class="btn btn-connect btn-sm" onclick="sendFriendRequest(${u.id}, this)" style="font-size:0.68rem;"><i class="fas fa-user-plus me-1"></i>Connect</button>`;

        item.innerHTML = `
            <div class="search-result-avatar" style="background:${u.avatar_color};">${u.name.charAt(0)}</div>
            <div class="flex-grow-1 min-width-0">
                <h6 class="text-light mb-0 small fw-bold text-truncate">${u.name}</h6>
                <small class="text-muted d-block text-truncate" style="font-size:0.72rem;">${u.location || u.interests || 'No details'}</small>
                ${u.mutual_count > 0 ? `<small class="text-info" style="font-size:0.68rem;"><i class="fas fa-users me-1"></i>${u.mutual_count} mutual</small>` : ''}
            </div>
            ${friendBadge}
        `;
        div.appendChild(item);
    });

    div.style.display = 'block';
}

// ═══════════════════════════════════════════════════════════════
//  BFS PATH FINDER
// ═══════════════════════════════════════════════════════════════

let pathFinderLoaded = false;

function togglePathFinder() {
    const panel = document.getElementById('path-finder');
    if (panel.style.display === 'none') {
        panel.style.display = 'block';
        if (!pathFinderLoaded) loadPathFinderUsers();
    } else {
        panel.style.display = 'none';
    }
}

async function loadPathFinderUsers() {
    try {
        const res = await fetch('/api/users/all');
        const users = await res.json();
        const fromSelect = document.getElementById('path-from');
        const toSelect = document.getElementById('path-to');

        fromSelect.innerHTML = '<option value="">Select user...</option>';
        toSelect.innerHTML = '<option value="">Select user...</option>';

        users.forEach(u => {
            fromSelect.innerHTML += `<option value="${u.id}">${u.name}</option>`;
            toSelect.innerHTML += `<option value="${u.id}">${u.name}</option>`;
        });

        // Pre-select current user as "from"
        if (currentUser) fromSelect.value = currentUser.id;
        pathFinderLoaded = true;
    } catch (err) {
        console.error('Failed to load users for path finder:', err);
    }
}

async function findPath() {
    const from = document.getElementById('path-from').value;
    const to = document.getElementById('path-to').value;
    const resultDiv = document.getElementById('path-result');

    if (!from || !to) {
        resultDiv.innerHTML = '<div class="text-warning small"><i class="fas fa-exclamation-triangle me-1"></i>Please select both users.</div>';
        resultDiv.style.display = 'block';
        return;
    }

    if (from === to) {
        resultDiv.innerHTML = '<div class="text-info small"><i class="fas fa-info-circle me-1"></i>Same user selected. Select different users.</div>';
        resultDiv.style.display = 'block';
        return;
    }

    resultDiv.innerHTML = '<div class="text-muted small"><i class="fas fa-spinner fa-spin me-1"></i>Finding shortest path using BFS...</div>';
    resultDiv.style.display = 'block';

    try {
        const res = await fetch(`/api/bfs-path?from=${from}&to=${to}`);
        const data = await res.json();

        if (data.found && data.path.length > 0) {
            const pathHtml = data.path.map((u, i) => {
                const arrow = i < data.path.length - 1 ? '<span class="path-arrow mx-2"><i class="fas fa-arrow-right"></i></span>' : '';
                return `<span class="path-node"><span style="width:24px;height:24px;border-radius:50%;background:${u.avatar_color};display:inline-flex;align-items:center;justify-content:center;font-size:0.65rem;font-weight:700;color:#fff;">${u.name.charAt(0)}</span>${u.name}</span>${arrow}`;
            }).join('');

            resultDiv.innerHTML = `
                <div class="p-3 rounded-3" style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.2);">
                    <div class="d-flex align-items-center gap-2 mb-2">
                        <i class="fas fa-check-circle text-success"></i>
                        <span class="text-light small fw-bold">Path found! ${data.length} connection${data.length !== 1 ? 's' : ''} apart</span>
                    </div>
                    <div class="d-flex flex-wrap align-items-center gap-2">${pathHtml}</div>
                </div>
            `;
        } else {
            resultDiv.innerHTML = `
                <div class="p-3 rounded-3" style="background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.2);">
                    <i class="fas fa-times-circle text-danger me-1"></i>
                    <span class="text-light small">No connection path found between these users.</span>
                </div>
            `;
        }
    } catch (err) {
        resultDiv.innerHTML = '<div class="text-danger small"><i class="fas fa-exclamation-circle me-1"></i>Error finding path.</div>';
    }
}

// ═══════════════════════════════════════════════════════════════
//  UTILITIES
// ═══════════════════════════════════════════════════════════════

function animateCounter(elementId, target) {
    const el = document.getElementById(elementId);
    if (!el) return;
    let current = 0;
    const increment = Math.max(1, target / 30);
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            el.textContent = target;
            clearInterval(timer);
        } else {
            el.textContent = Math.floor(current);
        }
    }, 40);
}

function adjustColor(hex, amount) {
    hex = hex.replace('#', '');
    const num = parseInt(hex, 16);
    let r = Math.min(255, Math.max(0, (num >> 16) + amount));
    let g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
    let b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
    return '#' + (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
}
