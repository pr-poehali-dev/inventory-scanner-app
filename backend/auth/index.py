"""Авторизация: login, logout, me, register (только для admin), users list."""
import json, os, hashlib, secrets
import psycopg2

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Token',
}

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'], sslmode='disable')

def sha256h(s: str) -> str:
    return hashlib.sha256(s.encode()).hexdigest()

def get_user_by_token(cur, token: str):
    if not token:
        return None
    cur.execute(
        "SELECT u.id, u.email, u.name, u.role FROM sessions s "
        "JOIN users u ON u.id = s.user_id "
        "WHERE s.token = %s AND s.expires_at > NOW()",
        (token,)
    )
    row = cur.fetchone()
    if not row:
        return None
    return {'id': row[0], 'email': row[1], 'name': row[2], 'role': row[3]}

def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    qs = event.get('queryStringParameters') or {}
    action = qs.get('action', '')
    token = (event.get('headers') or {}).get('X-Session-Token', '')

    body = {}
    if event.get('body'):
        try:
            body = json.loads(event['body'])
        except Exception:
            body = {}

    conn = get_conn()
    cur = conn.cursor()

    try:
        # login
        if action == 'login' and method == 'POST':
            email = body.get('email', '').strip().lower()
            password = body.get('password', '')
            cur.execute(
                "SELECT id, name, role FROM users WHERE email = %s AND password_hash = %s",
                (email, sha256h(password))
            )
            row = cur.fetchone()
            if not row:
                return {'statusCode': 401, 'headers': CORS,
                        'body': json.dumps({'error': 'Неверный логин или пароль'})}
            new_token = secrets.token_hex(32)
            cur.execute("INSERT INTO sessions (token, user_id) VALUES (%s, %s)", (new_token, row[0]))
            conn.commit()
            return {'statusCode': 200, 'headers': CORS,
                    'body': json.dumps({'token': new_token,
                                        'user': {'id': row[0], 'name': row[1], 'role': row[2], 'email': email}})}

        # me
        if action == 'me' and method == 'GET':
            user = get_user_by_token(cur, token)
            if not user:
                return {'statusCode': 401, 'headers': CORS, 'body': json.dumps({'error': 'Не авторизован'})}
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'user': user})}

        # logout
        if action == 'logout' and method == 'POST':
            if token:
                cur.execute("UPDATE sessions SET expires_at = NOW() WHERE token = %s", (token,))
                conn.commit()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

        # register — только admin
        if action == 'register' and method == 'POST':
            user = get_user_by_token(cur, token)
            if not user or user['role'] != 'admin':
                return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Нет прав'})}
            email = body.get('email', '').strip().lower()
            name = body.get('name', '').strip()
            password = body.get('password', '')
            role = body.get('role', 'employee')
            if not email or not name or not password:
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'Заполните все поля'})}
            cur.execute(
                "INSERT INTO users (email, name, password_hash, role) VALUES (%s, %s, %s, %s) RETURNING id",
                (email, name, sha256h(password), role)
            )
            new_id = cur.fetchone()[0]
            conn.commit()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True, 'id': new_id})}

        # users list — только admin
        if action == 'users' and method == 'GET':
            user = get_user_by_token(cur, token)
            if not user or user['role'] != 'admin':
                return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Нет прав'})}
            cur.execute("SELECT id, email, name, role, created_at FROM users ORDER BY created_at")
            rows = cur.fetchall()
            users = [{'id': r[0], 'email': r[1], 'name': r[2], 'role': r[3], 'created_at': str(r[4])} for r in rows]
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'users': users})}

        # delete_user — только admin
        if action == 'delete_user' and method == 'POST':
            user = get_user_by_token(cur, token)
            if not user or user['role'] != 'admin':
                return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Нет прав'})}
            target_id = body.get('id')
            if not target_id:
                return {'statusCode': 400, 'headers': CORS, 'body': json.dumps({'error': 'id обязателен'})}
            cur.execute("UPDATE sessions SET expires_at = NOW() WHERE user_id = %s", (target_id,))
            cur.execute(
                "UPDATE users SET email = 'deleted_' || id::text || '_' || email, name = '[удалён] ' || name "
                "WHERE id = %s AND role != 'admin'", (target_id,)
            )
            conn.commit()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

        return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Unknown action'})}

    finally:
        cur.close()
        conn.close()
