import sqlite3
conn = sqlite3.connect('db.sqlite3')
c = conn.cursor()
c.execute("SELECT id, username, role FROM accounts_customuser WHERE username LIKE '%Ramu%'")
print('Found Users:')
for row in c.fetchall():
    print(f'ID: {row[0]} | Username: {row[1]} | Role: {row[2]}')
