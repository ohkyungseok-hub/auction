"""
데이터베이스 초기화 스크립트
SQLite 데이터베이스를 생성하고 스키마를 적용합니다.
"""
import sqlite3
import os

DB_DIR = "database"
DB_FILE = os.path.join(DB_DIR, "auction.db")
SCHEMA_FILE = os.path.join(DB_DIR, "schema.sql")

def init_database():
    """데이터베이스 초기화"""
    # 디렉토리 생성
    os.makedirs(DB_DIR, exist_ok=True)
    
    # 데이터베이스 연결
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # 스키마 파일 읽기 및 실행
    if os.path.exists(SCHEMA_FILE):
        with open(SCHEMA_FILE, 'r', encoding='utf-8') as f:
            schema_sql = f.read()
        
        # 여러 SQL 문 실행
        cursor.executescript(schema_sql)
        conn.commit()
        print(f"✅ 데이터베이스가 성공적으로 초기화되었습니다: {DB_FILE}")
    else:
        print(f"❌ 스키마 파일을 찾을 수 없습니다: {SCHEMA_FILE}")
    
    conn.close()

if __name__ == "__main__":
    init_database()
