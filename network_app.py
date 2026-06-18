from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from collections import deque
import datetime
import os
import re
import random

# ═══════════════════════════════════════════════════════════════
#  APP SETUP
# ═══════════════════════════════════════════════════════════════

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INSTANCE_DIR = os.path.join(BASE_DIR, 'instance')
os.makedirs(INSTANCE_DIR, exist_ok=True)

app = Flask(__name__)
app.secret_key = 'smart_friendship_network_key_2026'

# Central registry DB — stores user accounts (email + password) only
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(INSTANCE_DIR, "registry.db")}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_BINDS'] = {}   # populated dynamically per user

db = SQLAlchemy(app)

# ── CORS ───────────────────────────────────────────────────────
@app.after_request
def add_cors(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    return response

@app.route('/api/auth/login', methods=['OPTIONS'])
@app.route('/api/auth/register', methods=['OPTIONS'])
def handle_options():
    from flask import Response
    r = Response()
    r.headers['Access-Control-Allow-Origin'] = '*'
    r.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    r.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    return r

@app.route('/ping')
def ping():
    return 'ok', 200

# ═══════════════════════════════════════════════════════════════
#  HELPER: per-user DB path & engine
# ═══════════════════════════════════════════════════════════════

def email_to_db_name(email: str) -> str:
    """Convert an email address to a safe filename for the user's personal DB."""
    safe = re.sub(r'[^a-z0-9]', '_', email.lower())
    return f'user_{safe}.db'

def get_user_db_path(email: str) -> str:
    return os.path.join(INSTANCE_DIR, email_to_db_name(email))

def get_user_engine(email: str):
    """Return (or create) a SQLAlchemy engine for a user's personal DB."""
    from sqlalchemy import create_engine
    db_path = get_user_db_path(email)
    engine = create_engine(f'sqlite:///{db_path}', connect_args={'check_same_thread': False})
    return engine

def get_user_session(email: str):
    """Return a scoped DB session for the user's personal DB."""
    from sqlalchemy.orm import sessionmaker
    engine = get_user_engine(email)
    # Ensure tables exist
    UserBase.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    return Session()

# ═══════════════════════════════════════════════════════════════
#  CENTRAL REGISTRY MODEL (registry.db)
# ═══════════════════════════════════════════════════════════════

class RegistryUser(db.Model):
    """Holds credentials only — used for login/register across all users."""
    __tablename__ = 'registry_users'
    id         = db.Column(db.Integer, primary_key=True)
    name       = db.Column(db.String(100), nullable=False)
    email      = db.Column(db.String(100), unique=True, nullable=False)
    password   = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

# ═══════════════════════════════════════════════════════════════
#  PER-USER DATABASE MODELS  (declarative base separate from db)
# ═══════════════════════════════════════════════════════════════

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base

UserBase = declarative_base()

class UserProfile(UserBase):
    """Full profile — lives in the user's personal DB."""
    __tablename__ = 'profile'
    id           = Column(Integer, primary_key=True)
    name         = Column(String(100), nullable=False)
    email        = Column(String(100), unique=True, nullable=False)
    bio          = Column(Text, default='')
    interests    = Column(String(500), default='')
    skills       = Column(String(500), default='')
    location     = Column(String(100), default='')
    avatar_color = Column(String(7),   default='#3b82f6')
    profile_pic  = Column(String(300), default='')
    created_at   = Column(DateTime,    default=datetime.datetime.utcnow)

class UserFriendship(UserBase):
    """Friendship edge — stored in BOTH users' DBs for consistency."""
    __tablename__ = 'friendships'
    id       = Column(Integer, primary_key=True)
    peer_id  = Column(Integer, nullable=False)   # registry ID of the friend
    peer_email = Column(String(100), nullable=False)
    peer_name  = Column(String(100), nullable=False)
    peer_color = Column(String(7),   default='#3b82f6')
    peer_pic   = Column(String(300), default='')
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class UserFriendRequest(UserBase):
    __tablename__ = 'friend_requests'
    id           = Column(Integer, primary_key=True)
    sender_id    = Column(Integer, nullable=False)
    sender_email = Column(String(100), nullable=False)
    sender_name  = Column(String(100), nullable=False)
    sender_color = Column(String(7),   default='#3b82f6')
    sender_pic   = Column(String(300), default='')
    direction    = Column(String(10),  default='incoming')  # 'incoming' or 'outgoing'
    status       = Column(String(20),  default='PENDING')
    created_at   = Column(DateTime, default=datetime.datetime.utcnow)

class UserActivity(UserBase):
    __tablename__ = 'activities'
    id          = Column(Integer, primary_key=True)
    action      = Column(String(200))
    target_name = Column(String(100))
    icon        = Column(String(50), default='fa-bolt')
    created_at  = Column(DateTime, default=datetime.datetime.utcnow)

# ═══════════════════════════════════════════════════════════════
#  HELPER: initialise a brand-new user DB
# ═══════════════════════════════════════════════════════════════

def init_user_db(email: str, name: str, bio='', interests='', skills='',
                 location='', avatar_color='#3b82f6', profile_pic=''):
    """Create tables and seed the profile row for a brand-new user."""
    us = get_user_session(email)
    # Seed profile
    profile = us.query(UserProfile).first()
    if not profile:
        reg = RegistryUser.query.filter_by(email=email).first()
        profile = UserProfile(
            id=reg.id if reg else 1,
            name=name, email=email,
            bio=bio, interests=interests, skills=skills,
            location=location, avatar_color=avatar_color,
            profile_pic=profile_pic
        )
        us.add(profile)
        # Welcome activity
        us.add(UserActivity(action='joined the network', target_name='System', icon='fa-rocket'))
        us.commit()
    us.close()

# ═══════════════════════════════════════════════════════════════
#  GRAPH helpers (work on in-memory data from SQLAlchemy session)
# ═══════════════════════════════════════════════════════════════

def build_adj_from_friendships(friendships):
    """Build adjacency set from a list of UserFriendship rows."""
    peers = set()
    for f in friendships:
        peers.add(f.peer_id)
    return peers

# ═══════════════════════════════════════════════════════════════
#  PAGE ROUTES
# ═══════════════════════════════════════════════════════════════

@app.route('/')
def landing():
    return render_template('landing.html')

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('auth'))
    return render_template('dashboard.html')

@app.route('/auth')
def auth():
    return render_template('auth.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('landing'))

# ═══════════════════════════════════════════════════════════════
#  AUTH API
# ═══════════════════════════════════════════════════════════════

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json or {}
    name     = (data.get('name', '') or '').strip()
    email    = (data.get('email', '') or '').strip().lower()
    password = data.get('password', '') or ''

    if not name or not email or not password:
        return jsonify({"error": "Name, email and password are required"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    if RegistryUser.query.filter_by(email=email).first():
        return jsonify({"error": "An account with this email already exists"}), 400

    colors = ['#3b82f6', '#ec4899', '#f59e0b', '#ef4444', '#6366f1',
              '#10b981', '#8b5cf6', '#06b6d4', '#f97316', '#14b8a6']
    chosen_color = random.choice(colors)

    # 1. Add to central registry
    reg_user = RegistryUser(
        name=name,
        email=email,
        password=generate_password_hash(password),
    )
    db.session.add(reg_user)
    db.session.commit()

    # 2. Create personal database
    init_user_db(
        email=email, name=name,
        bio=data.get('bio', ''),
        interests=data.get('interests', ''),
        skills=data.get('skills', ''),
        location=data.get('location', ''),
        avatar_color=chosen_color
    )

    # 3. Set session
    session['user_id']    = reg_user.id
    session['user_email'] = email
    session['user_name']  = name

    return jsonify({"success": True, "user_id": reg_user.id, "name": name})


@app.route('/api/auth/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    data     = request.get_json(silent=True) or {}
    email    = (data.get('email', '') or '').strip().lower()
    password = data.get('password', '') or ''

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    reg_user = RegistryUser.query.filter_by(email=email).first()
    if reg_user and check_password_hash(reg_user.password, password):
        session['user_id']    = reg_user.id
        session['user_email'] = email
        session['user_name']  = reg_user.name
        return jsonify({
            "success":  True,
            "user_id":  reg_user.id,
            "name":     reg_user.name,
            "email":    email
        })
    return jsonify({"error": "Invalid email or password"}), 401


@app.route('/api/auth/reset-password', methods=['POST'])
def reset_password():
    data         = request.get_json(silent=True) or {}
    email        = (data.get('email', '') or '').strip().lower()
    new_password = data.get('new_password', '') or ''
    if not email or not new_password:
        return jsonify({"error": "Email and new password are required"}), 400
    if len(new_password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    reg_user = RegistryUser.query.filter_by(email=email).first()
    if not reg_user:
        return jsonify({"error": "No account found with that email address"}), 404
    reg_user.password = generate_password_hash(new_password)
    db.session.commit()
    return jsonify({"success": True, "message": f"Password updated for {reg_user.name}. Please sign in."})

# ═══════════════════════════════════════════════════════════════
#  USER API  (uses personal DB)
# ═══════════════════════════════════════════════════════════════

def _require_user():
    """Return (registry_id, email) or raise 401."""
    uid   = session.get('user_id')
    email = session.get('user_email')
    if not uid or not email:
        return None, None
    return uid, email


@app.route('/api/user/me', methods=['GET', 'PUT'])
def get_current_user():
    uid, email = _require_user()
    if not uid:
        return jsonify({"error": "Not logged in"}), 401

    us = get_user_session(email)
    profile = us.query(UserProfile).first()
    if not profile:
        us.close()
        return jsonify({"error": "Profile not found"}), 404

    if request.method == 'PUT':
        data = request.json or {}
        profile.name      = data.get('name',      profile.name)
        profile.bio       = data.get('bio',       profile.bio)
        profile.location  = data.get('location',  profile.location)
        profile.interests = data.get('interests', profile.interests)
        profile.skills    = data.get('skills',    profile.skills)
        us.add(UserActivity(action='updated their profile', target_name='', icon='fa-user-edit'))
        us.commit()
        us.close()
        return jsonify({"success": True})

    friends  = us.query(UserFriendship).all()
    pending  = us.query(UserFriendRequest).filter_by(direction='incoming', status='PENDING').count()
    us.close()

    return jsonify({
        "id":           uid,
        "name":         profile.name,
        "email":        email,
        "bio":          profile.bio,
        "interests":    profile.interests,
        "skills":       profile.skills,
        "location":     profile.location,
        "avatar_color": profile.avatar_color,
        "profile_pic":  profile.profile_pic,
        "stats": {
            "total_friends":     len(friends),
            "mutual_friends":    0,
            "pending_requests":  pending,
            "suggested_count":   0
        }
    })


@app.route('/api/user/<int:target_id>')
def get_user_by_id(target_id):
    uid, viewer_email = _require_user()
    # Find target in registry
    target_reg = RegistryUser.query.get_or_404(target_id)
    target_email = target_reg.email

    # Get target's profile from their personal DB
    us_target = get_user_session(target_email)
    profile = us_target.query(UserProfile).first()
    target_friends = us_target.query(UserFriendship).all()
    acts = us_target.query(UserActivity).order_by(UserActivity.created_at.desc()).limit(5).all()
    activities = [{"action": a.action, "target_name": a.target_name,
                   "icon": a.icon or "fa-bolt", "time_ago": get_time_ago(a.created_at)} for a in acts]
    us_target.close()

    is_friend = False
    is_self   = (uid == target_id)
    mutual_with_viewer = 0

    if uid and viewer_email and not is_self:
        us_viewer = get_user_session(viewer_email)
        viewer_friends = {f.peer_id for f in us_viewer.query(UserFriendship).all()}
        is_friend = target_id in viewer_friends
        target_peer_ids = {f.peer_id for f in target_friends}
        mutual_with_viewer = len(viewer_friends & target_peer_ids)
        us_viewer.close()

    return jsonify({
        "id":                target_id,
        "name":              profile.name if profile else target_reg.name,
        "bio":               profile.bio if profile else '',
        "interests":         profile.interests if profile else '',
        "skills":            profile.skills if profile else '',
        "location":          profile.location if profile else '',
        "avatar_color":      profile.avatar_color if profile else '#3b82f6',
        "profile_pic":       profile.profile_pic if profile else '',
        "total_friends":     len(target_friends),
        "is_friend":         is_friend,
        "is_self":           is_self,
        "mutual_with_viewer": mutual_with_viewer,
        "activities":        activities
    })

# ═══════════════════════════════════════════════════════════════
#  NETWORK GRAPH API
# ═══════════════════════════════════════════════════════════════

@app.route('/api/network')
def get_network():
    uid, email = _require_user()
    if not uid:
        return jsonify({"nodes": [], "links": []})

    us = get_user_session(email)
    profile  = us.query(UserProfile).first()
    friends  = us.query(UserFriendship).all()
    us.close()

    nodes = []
    links = []

    # Self node
    nodes.append({
        "id":        uid,
        "label":     profile.name if profile else session.get('user_name', 'You'),
        "group":     "main",
        "interests": profile.interests if profile else '',
        "skills":    profile.skills if profile else '',
        "color":     profile.avatar_color if profile else '#3b82f6',
        "mutual_count": 0
    })

    friend_ids = set()
    for f in friends:
        friend_ids.add(f.peer_id)
        # Get their profile
        peer_reg = RegistryUser.query.get(f.peer_id)
        if not peer_reg:
            continue
        us_peer = get_user_session(peer_reg.email)
        peer_profile = us_peer.query(UserProfile).first()
        peer_friends = {pf.peer_id for pf in us_peer.query(UserFriendship).all()}
        us_peer.close()

        mutual = len({uid} & peer_friends)  # simplified mutual

        nodes.append({
            "id":        f.peer_id,
            "label":     f.peer_name,
            "group":     "direct",
            "interests": peer_profile.interests if peer_profile else '',
            "skills":    peer_profile.skills if peer_profile else '',
            "color":     f.peer_color,
            "mutual_count": mutual
        })
        links.append({"source": uid, "target": f.peer_id})

    return jsonify({"nodes": nodes, "links": links})

# ═══════════════════════════════════════════════════════════════
#  FRIEND SUGGESTIONS API
# ═══════════════════════════════════════════════════════════════

@app.route('/api/suggestions')
def get_suggestions():
    uid, email = _require_user()
    if not uid:
        return jsonify([])

    us = get_user_session(email)
    profile = us.query(UserProfile).first()
    my_friends = {f.peer_id for f in us.query(UserFriendship).all()}
    pending_ids = {r.sender_id for r in us.query(UserFriendRequest).filter_by(status='PENDING').all()}
    us.close()

    all_reg = RegistryUser.query.filter(RegistryUser.id != uid).all()
    suggestions = []

    u_interests = set(i.strip().lower() for i in (profile.interests if profile else '').split(',') if i.strip())
    u_skills    = set(s.strip().lower() for s in (profile.skills    if profile else '').split(',') if s.strip())

    for reg in all_reg:
        if reg.id in my_friends or reg.id in pending_ids:
            continue

        us_c = get_user_session(reg.email)
        cprofile = us_c.query(UserProfile).first()
        c_friends = {f.peer_id for f in us_c.query(UserFriendship).all()}
        us_c.close()

        if not cprofile:
            continue

        mutual_count = len(my_friends & c_friends)
        c_interests  = set(i.strip().lower() for i in (cprofile.interests or '').split(',') if i.strip())
        c_skills     = set(s.strip().lower() for s in (cprofile.skills    or '').split(',') if s.strip())

        score = 0
        if u_interests and c_interests:
            shared = len(u_interests & c_interests)
            total  = len(u_interests | c_interests)
            score += int((shared / total) * 50) if total else 0
        if u_skills and c_skills:
            shared = len(u_skills & c_skills)
            total  = len(u_skills | c_skills)
            score += int((shared / total) * 30) if total else 0
        score += min(mutual_count * 10, 20)

        suggestions.append({
            "id":           reg.id,
            "name":         cprofile.name,
            "bio":          cprofile.bio,
            "interests":    cprofile.interests,
            "skills":       cprofile.skills,
            "location":     cprofile.location,
            "avatar_color": cprofile.avatar_color,
            "profile_pic":  cprofile.profile_pic,
            "match_score":  score,
            "mutual_count": mutual_count,
            "mutual_names": [],
            "is_fof":       mutual_count > 0
        })

    suggestions.sort(key=lambda x: x['match_score'], reverse=True)
    return jsonify(suggestions[:10])

# ═══════════════════════════════════════════════════════════════
#  FRIEND REQUEST API
# ═══════════════════════════════════════════════════════════════

@app.route('/api/friend-request/send', methods=['POST'])
def send_friend_request():
    uid, email = _require_user()
    if not uid:
        return jsonify({"error": "Not logged in"}), 401

    data      = request.json or {}
    target_id = data.get('target_id')
    if not target_id:
        return jsonify({"error": "Target user ID required"}), 400

    target_reg = RegistryUser.query.get(target_id)
    if not target_reg:
        return jsonify({"error": "User not found"}), 404

    # Prevent duplicate
    us = get_user_session(email)
    existing = us.query(UserFriendRequest).filter_by(sender_id=target_id).first()
    already_friend = us.query(UserFriendship).filter_by(peer_id=target_id).first()
    us.close()

    if existing or already_friend:
        return jsonify({"error": "Request already exists or already friends"}), 400

    reg_user = RegistryUser.query.get(uid)

    # Store outgoing request in sender's DB
    us_sender = get_user_session(email)
    profile   = us_sender.query(UserProfile).first()
    us_sender.add(UserFriendRequest(
        sender_id=target_id, sender_email=target_reg.email,
        sender_name=target_reg.name, sender_color='#3b82f6',
        direction='outgoing', status='PENDING'
    ))
    us_sender.add(UserActivity(action='sent a friend request to', target_name=target_reg.name, icon='fa-user-plus'))
    us_sender.commit()
    us_sender.close()

    # Store incoming request in receiver's DB
    us_receiver = get_user_session(target_reg.email)
    sender_profile_session = get_user_session(email)
    sp = sender_profile_session.query(UserProfile).first()
    sender_profile_session.close()

    us_receiver.add(UserFriendRequest(
        sender_id=uid, sender_email=email,
        sender_name=reg_user.name,
        sender_color=sp.avatar_color if sp else '#3b82f6',
        sender_pic=sp.profile_pic if sp else '',
        direction='incoming', status='PENDING'
    ))
    us_receiver.commit()
    us_receiver.close()

    return jsonify({"success": True})


@app.route('/api/friend-request/accept', methods=['POST'])
def accept_friend_request():
    uid, email = _require_user()
    if not uid:
        return jsonify({"error": "Not logged in"}), 401

    data       = request.json or {}
    request_id = data.get('request_id')

    us = get_user_session(email)
    fr = us.query(UserFriendRequest).get(request_id)
    if not fr or fr.direction != 'incoming' or fr.status != 'PENDING':
        us.close()
        return jsonify({"error": "Invalid request"}), 400

    fr.status = 'ACCEPTED'

    # My profile
    my_profile = us.query(UserProfile).first()

    # Add friendship entries
    us.add(UserFriendship(
        peer_id=fr.sender_id, peer_email=fr.sender_email,
        peer_name=fr.sender_name, peer_color=fr.sender_color,
        peer_pic=fr.sender_pic
    ))
    us.add(UserActivity(action='became friends with', target_name=fr.sender_name, icon='fa-handshake'))
    us.commit()
    us.close()

    # Add reverse friendship in sender's DB
    us_sender = get_user_session(fr.sender_email)
    us_sender.add(UserFriendship(
        peer_id=uid, peer_email=email,
        peer_name=my_profile.name if my_profile else session.get('user_name', ''),
        peer_color=my_profile.avatar_color if my_profile else '#3b82f6',
        peer_pic=my_profile.profile_pic if my_profile else ''
    ))
    # Mark outgoing request as accepted
    outgoing = us_sender.query(UserFriendRequest).filter_by(sender_id=uid, direction='outgoing').first()
    if outgoing:
        outgoing.status = 'ACCEPTED'
    us_sender.add(UserActivity(action='became friends with',
                               target_name=my_profile.name if my_profile else '',
                               icon='fa-handshake'))
    us_sender.commit()
    us_sender.close()

    return jsonify({"success": True})


@app.route('/api/friend-request/reject', methods=['POST'])
def reject_friend_request():
    uid, email = _require_user()
    if not uid:
        return jsonify({"error": "Not logged in"}), 401

    data       = request.json or {}
    request_id = data.get('request_id')

    us = get_user_session(email)
    fr = us.query(UserFriendRequest).get(request_id)
    if not fr:
        us.close()
        return jsonify({"error": "Invalid request"}), 400
    fr.status = 'REJECTED'
    us.commit()
    us.close()
    return jsonify({"success": True})


@app.route('/api/friend-requests/pending')
def get_pending_requests():
    uid, email = _require_user()
    if not uid:
        return jsonify([])

    us = get_user_session(email)
    reqs = us.query(UserFriendRequest).filter_by(direction='incoming', status='PENDING').all()
    result = [{
        "id":            r.id,
        "sender_id":     r.sender_id,
        "sender_name":   r.sender_name,
        "sender_bio":    '',
        "sender_interests": '',
        "sender_color":  r.sender_color,
        "sender_pic":    r.sender_pic,
        "created_at":    r.created_at.strftime('%Y-%m-%d %H:%M')
    } for r in reqs]
    us.close()
    return jsonify(result)

# ═══════════════════════════════════════════════════════════════
#  ACTIVITY FEED API
# ═══════════════════════════════════════════════════════════════

@app.route('/api/activities')
def get_activities():
    uid, email = _require_user()
    if not uid:
        return jsonify([])

    us = get_user_session(email)
    profile    = us.query(UserProfile).first()
    activities = us.query(UserActivity).order_by(UserActivity.created_at.desc()).limit(20).all()
    result = [{
        "id":         a.id,
        "user_name":  profile.name if profile else 'You',
        "user_color": profile.avatar_color if profile else '#3b82f6',
        "user_pic":   profile.profile_pic if profile else '',
        "action":     a.action,
        "target_name": a.target_name,
        "icon":       a.icon or "fa-bolt",
        "time_ago":   get_time_ago(a.created_at)
    } for a in activities]
    us.close()
    return jsonify(result)

def get_time_ago(dt):
    now     = datetime.datetime.utcnow()
    diff    = now - dt
    seconds = diff.total_seconds()
    if seconds < 60:
        return "Just now"
    elif seconds < 3600:
        return f"{int(seconds // 60)} min ago"
    elif seconds < 86400:
        return f"{int(seconds // 3600)} hours ago"
    else:
        return f"{int(seconds // 86400)} days ago"

# ═══════════════════════════════════════════════════════════════
#  SEARCH API
# ═══════════════════════════════════════════════════════════════

@app.route('/api/search')
def search_users():
    uid, email = _require_user()
    if not uid:
        return jsonify([])

    q           = request.args.get('q', '').strip().lower()
    search_type = request.args.get('type', 'all')
    if not q:
        return jsonify([])

    us          = get_user_session(email)
    my_friends  = {f.peer_id for f in us.query(UserFriendship).all()}
    us.close()

    all_reg = RegistryUser.query.filter(RegistryUser.id != uid).all()
    results = []

    for reg in all_reg:
        us_c     = get_user_session(reg.email)
        cprofile = us_c.query(UserProfile).first()
        us_c.close()
        if not cprofile:
            continue

        match = False
        if search_type in ('all', 'name')     and q in cprofile.name.lower():      match = True
        if search_type in ('all', 'interest') and q in (cprofile.interests or '').lower(): match = True
        if search_type in ('all', 'skill')    and q in (cprofile.skills    or '').lower(): match = True
        if search_type in ('all', 'location') and q in (cprofile.location  or '').lower(): match = True

        if match:
            results.append({
                "id":          reg.id,
                "name":        cprofile.name,
                "bio":         cprofile.bio,
                "interests":   cprofile.interests,
                "skills":      cprofile.skills,
                "location":    cprofile.location,
                "avatar_color": cprofile.avatar_color,
                "profile_pic": cprofile.profile_pic,
                "is_friend":   reg.id in my_friends,
                "mutual_count": 0
            })

    return jsonify(results[:20])

# ═══════════════════════════════════════════════════════════════
#  BFS PATH API
# ═══════════════════════════════════════════════════════════════

def bfs_path(graph, start, end):
    """BFS on adjacency dict {id: set(peer_ids)}."""
    if start == end:
        return [start]
    visited = {start}
    queue   = deque([(start, [start])])
    while queue:
        current, path = queue.popleft()
        for neighbor in graph.get(current, set()):
            if neighbor == end:
                return path + [neighbor]
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, path + [neighbor]))
    return []

def build_global_adj():
    """Build full adjacency graph by reading all users' friendship DBs."""
    adj = {}
    for reg in RegistryUser.query.all():
        us = get_user_session(reg.email)
        friends = {f.peer_id for f in us.query(UserFriendship).all()}
        us.close()
        adj[reg.id] = friends
    return adj


@app.route('/api/bfs-path')
def find_path():
    uid, email = _require_user()
    if not uid:
        return jsonify({"error": "Not logged in"}), 401

    from_id = request.args.get('from', type=int)
    to_id   = request.args.get('to',   type=int)
    if not from_id or not to_id:
        return jsonify({"error": "Both 'from' and 'to' user IDs required"}), 400

    adj      = build_global_adj()
    path_ids = bfs_path(adj, from_id, to_id)
    path_users = []
    for pid in path_ids:
        reg = RegistryUser.query.get(pid)
        if reg:
            us = get_user_session(reg.email)
            p  = us.query(UserProfile).first()
            us.close()
            path_users.append({
                "id":          pid,
                "name":        p.name if p else reg.name,
                "avatar_color": p.avatar_color if p else '#3b82f6',
                "profile_pic": p.profile_pic if p else ''
            })

    return jsonify({
        "found":  len(path_ids) > 0,
        "path":   path_users,
        "length": len(path_ids) - 1 if path_ids else -1
    })


@app.route('/api/users/all')
def get_all_users():
    uid, email = _require_user()
    if not uid:
        return jsonify([])

    result = []
    for reg in RegistryUser.query.all():
        us = get_user_session(reg.email)
        p  = us.query(UserProfile).first()
        us.close()
        result.append({
            "id":          reg.id,
            "name":        p.name if p else reg.name,
            "avatar_color": p.avatar_color if p else '#3b82f6',
            "profile_pic": p.profile_pic if p else '',
            "bio":         p.bio if p else '',
            "interests":   p.interests if p else ''
        })
    return jsonify(result)


@app.route('/api/friends/add-sample', methods=['POST'])
def add_sample_friends():
    """Add up to 4 existing users as friends for the current user."""
    uid, email = _require_user()
    if not uid:
        return jsonify({"error": "Not logged in"}), 401

    us         = get_user_session(email)
    my_profile = us.query(UserProfile).first()
    my_friends = {f.peer_id for f in us.query(UserFriendship).all()}
    us.close()

    candidates = RegistryUser.query.filter(RegistryUser.id != uid).limit(10).all()
    added = 0
    for c in candidates:
        if c.id in my_friends:
            continue
        if added >= 4:
            break

        c_us = get_user_session(c.email)
        c_profile = c_us.query(UserProfile).first()
        c_already = c_us.query(UserFriendship).filter_by(peer_id=uid).first()

        if not c_already:
            # Add for current user
            me_us = get_user_session(email)
            me_us.add(UserFriendship(
                peer_id=c.id, peer_email=c.email,
                peer_name=c.name,
                peer_color=c_profile.avatar_color if c_profile else '#3b82f6',
                peer_pic=c_profile.profile_pic if c_profile else ''
            ))
            me_us.add(UserActivity(action='connected with', target_name=c.name, icon='fa-link'))
            me_us.commit()
            me_us.close()

            # Add reverse
            c_us.add(UserFriendship(
                peer_id=uid, peer_email=email,
                peer_name=my_profile.name if my_profile else session.get('user_name', ''),
                peer_color=my_profile.avatar_color if my_profile else '#3b82f6',
                peer_pic=my_profile.profile_pic if my_profile else ''
            ))
            c_us.add(UserActivity(action='connected with',
                                  target_name=my_profile.name if my_profile else '',
                                  icon='fa-link'))
            c_us.commit()
            added += 1

        c_us.close()

    return jsonify({"success": True, "added": added})


# ═══════════════════════════════════════════════════════════════
#  RUN
# ═══════════════════════════════════════════════════════════════

if __name__ == '__main__':
    with app.app_context():
        db.create_all()   # creates registry.db + registry_users table
    app.run(debug=True, host='0.0.0.0', port=5000, use_reloader=False)
