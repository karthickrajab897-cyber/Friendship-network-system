import sqlite3
import os

db_path = 'instance/network.db'
if not os.path.exists(db_path):
    print('DATABASE NOT FOUND at:', db_path)
else:
    print('Database found:', db_path, '| Size:', os.path.getsize(db_path), 'bytes')
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [t[0] for t in c.fetchall()]
    print('Tables:', tables)

    if 'user' in tables:
        c.execute('SELECT id, name, email, substr(password,1,40) FROM user ORDER BY id')
        rows = c.fetchall()
        print(f'\nUsers ({len(rows)} total):')
        for r in rows:
            print(f'  ID={r[0]:3d} | {r[1]:<30s} | {r[2]:<35s} | hash={r[3]}...')
    else:
        print('No user table found!')
    conn.close()
