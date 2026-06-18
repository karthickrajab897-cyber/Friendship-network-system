"""Final login verification against all known accounts."""
import sys
sys.path.insert(0, '.')
from network_app import app, User
from werkzeug.security import check_password_hash

tests = [
    ('karthick@example.com', 'password123'),
    ('alice@example.com',    'pass123'),
    ('prawin@gmail.com',     'prawin123'),
    ('suresh@gmail.com',     'suresh123'),
    ('arjun@example.com',    'pass123'),
    ('priya.k@example.com',  'pass123'),
]

with app.app_context():
    print("=" * 65)
    print("FINAL LOGIN VERIFICATION")
    print("=" * 65)
    all_ok = True
    for email, pwd in tests:
        user = User.query.filter_by(email=email.lower()).first()
        if user:
            ok = check_password_hash(user.password, pwd)
            result = "[OK]" if ok else "[FAIL]"
            if not ok: all_ok = False
            print("  %s  %-35s  %s" % (result, email, "(ID=%d, Name=%s)" % (user.id, user.name)))
        else:
            all_ok = False
            print("  [MISS] %-35s  User not found" % email)
    print("=" * 65)
    print("RESULT:", "ALL PASSED" if all_ok else "SOME FAILED")
    total = User.query.count()
    print("Total users in database:", total)
