"""
데이터베이스 API 서버 (Flask)
브라우저에서 REST API를 통해 데이터베이스에 접근할 수 있도록 합니다.
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)  # CORS 허용

DB_DIR = "database"
DB_FILE = os.path.join(DB_DIR, "auction.db")

def get_db_connection():
    """데이터베이스 연결"""
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def row_to_dict(row):
    """Row 객체를 딕셔너리로 변환"""
    return dict(row)

# ==================== 회원 API ====================
@app.route('/api/members', methods=['GET'])
def get_members():
    """모든 회원 조회"""
    conn = get_db_connection()
    members = conn.execute('SELECT * FROM members ORDER BY created_at DESC').fetchall()
    conn.close()
    return jsonify([row_to_dict(m) for m in members])

@app.route('/api/members', methods=['POST'])
def add_member():
    """회원 추가"""
    data = request.json
    conn = get_db_connection()
    member_id = str(int(datetime.now().timestamp() * 1000))
    now = datetime.now().isoformat()
    
    conn.execute(
        'INSERT INTO members (id, name, email, password, company, phone, type, created_at) '
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        (member_id, data['name'], data['email'], data.get('password', ''),
         data.get('company', ''), data.get('phone', ''), data.get('type', 'buyer'), now)
    )
    conn.commit()
    conn.close()
    return jsonify({'id': member_id, 'message': '회원이 추가되었습니다.'}), 201

@app.route('/api/members/<email>', methods=['GET'])
def get_member_by_email(email):
    """이메일로 회원 조회"""
    conn = get_db_connection()
    member = conn.execute('SELECT * FROM members WHERE email = ?', (email,)).fetchone()
    conn.close()
    if member:
        return jsonify(row_to_dict(member))
    return jsonify({'error': '회원을 찾을 수 없습니다.'}), 404

# ==================== 상품 API ====================
@app.route('/api/products', methods=['GET'])
def get_products():
    """모든 상품 조회"""
    conn = get_db_connection()
    products = conn.execute('SELECT * FROM products ORDER BY created_at DESC').fetchall()
    conn.close()
    return jsonify([row_to_dict(p) for p in products])

@app.route('/api/products', methods=['POST'])
def add_product():
    """상품 추가"""
    data = request.json
    conn = get_db_connection()
    product_id = str(int(datetime.now().timestamp() * 1000))
    now = datetime.now().isoformat()
    
    conn.execute(
        'INSERT INTO products (id, name, description, quantity, unit, min_price, supplier_name, '
        'supplier_email, expiry_date, auction_start_date, auction_end_date, created_at) '
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        (product_id, data['name'], data.get('description', ''), data['quantity'],
         data.get('unit', '개'), data['minPrice'], data['supplierName'],
         data.get('supplierEmail', ''), data['expiryDate'],
         data.get('auctionStartDate', now), data['auctionEndDate'], now)
    )
    conn.commit()
    conn.close()
    return jsonify({'id': product_id, 'message': '상품이 추가되었습니다.'}), 201

@app.route('/api/products/<product_id>', methods=['GET'])
def get_product(product_id):
    """상품 조회"""
    conn = get_db_connection()
    product = conn.execute('SELECT * FROM products WHERE id = ?', (product_id,)).fetchone()
    conn.close()
    if product:
        return jsonify(row_to_dict(product))
    return jsonify({'error': '상품을 찾을 수 없습니다.'}), 404

@app.route('/api/products/<product_id>', methods=['DELETE'])
def delete_product(product_id):
    """상품 삭제"""
    conn = get_db_connection()
    conn.execute('DELETE FROM products WHERE id = ?', (product_id,))
    conn.execute('DELETE FROM bids WHERE product_id = ?', (product_id,))
    conn.commit()
    conn.close()
    return jsonify({'message': '상품이 삭제되었습니다.'})

# ==================== 입찰 API ====================
@app.route('/api/bids', methods=['POST'])
def add_bid():
    """입찰 추가"""
    data = request.json
    conn = get_db_connection()
    bid_id = str(int(datetime.now().timestamp() * 1000))
    now = datetime.now().isoformat()
    
    conn.execute(
        'INSERT INTO bids (id, product_id, bidder_name, bidder_email, amount, timestamp) '
        'VALUES (?, ?, ?, ?, ?, ?)',
        (bid_id, data['productId'], data['bidderName'], data.get('bidderEmail', ''),
         data['amount'], now)
    )
    conn.commit()
    conn.close()
    return jsonify({'id': bid_id, 'message': '입찰이 추가되었습니다.'}), 201

@app.route('/api/products/<product_id>/bids', methods=['GET'])
def get_product_bids(product_id):
    """상품의 입찰 목록 조회"""
    conn = get_db_connection()
    bids = conn.execute(
        'SELECT * FROM bids WHERE product_id = ? ORDER BY amount DESC',
        (product_id,)
    ).fetchall()
    conn.close()
    return jsonify([row_to_dict(b) for b in bids])

# ==================== 배너 API ====================
@app.route('/api/banners', methods=['GET'])
def get_banners():
    """모든 배너 조회"""
    conn = get_db_connection()
    banners = conn.execute('SELECT * FROM banners ORDER BY order_index ASC').fetchall()
    conn.close()
    return jsonify([row_to_dict(b) for b in banners])

@app.route('/api/banners', methods=['POST'])
def add_banner():
    """배너 추가"""
    data = request.json
    conn = get_db_connection()
    banner_id = str(int(datetime.now().timestamp() * 1000))
    now = datetime.now().isoformat()
    
    conn.execute(
        'INSERT INTO banners (id, title, description, image_url, link_url, order_index, active, created_at) '
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        (banner_id, data['title'], data.get('description', ''), data.get('imageUrl', ''),
         data.get('link', ''), data.get('order', 0), 1 if data.get('active', True) else 0, now)
    )
    conn.commit()
    conn.close()
    return jsonify({'id': banner_id, 'message': '배너가 추가되었습니다.'}), 201

# ==================== 관리자 API ====================
@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    """관리자 로그인"""
    data = request.json
    conn = get_db_connection()
    admin = conn.execute(
        'SELECT * FROM admins WHERE id = ? AND password = ?',
        (data['id'], data['password'])
    ).fetchone()
    conn.close()
    if admin:
        return jsonify(row_to_dict(admin))
    return jsonify({'error': '인증 실패'}), 401

if __name__ == '__main__':
    # 데이터베이스 초기화 확인
    if not os.path.exists(DB_FILE):
        print("데이터베이스를 먼저 초기화해주세요: python database/init_db.py")
    
    app.run(debug=True, port=5000)
