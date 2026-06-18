"""
Reset passwords for user-registered accounts.
Run this script once to fix unknown passwords.
"""
import sys
sys.path.insert(0, '.')

from network_app import app, db, User
from werkzeug.security import generate_password_hash

# Map email -> new password to reset
# Add any user whose password is unknown/forgotten
RESET_PASSWORDS = {
    'prawin@gmail.com':  'prawin123',
    'suresh@gmail.com':  'suresh123',
    'vasan@gmail.com':   'vasan123',
}

with app.app_context():
    print("=" * 60)
    print("PASSWORD RESET UTILITY")
    print("=" * 60)
    for email, new_password in RESET_PASSWORDS.items():
        user = User.query.filter_by(email=email.strip().lower()).first()
        if user:
            user.password = generate_password_hash(new_password)
            db.session.commit()
            print("  [OK] Reset password for %s (ID=%d) -> '%s'" % (email, user.id, new_password))
        else:
            print("  [--] User not found: %s" % email)
    print("=" * 60)
    print("Done! All specified passwords have been updated.")
    print("You can now log in with the above credentials.")
