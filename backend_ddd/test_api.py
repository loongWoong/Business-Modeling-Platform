"""
快速测试API是否正常工作
"""
import requests
import json

BASE_URL = 'http://localhost:5000'

def test_health():
    """测试健康检查"""
    try:
        response = requests.get(f'{BASE_URL}/health')
        print(f"Health Check: {response.status_code} - {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Health Check Failed: {e}")
        return False

def test_domain_api():
    """测试Domain API"""
    try:
        # 测试 GET /api/domain
        response = requests.get(f'{BASE_URL}/api/domain')
        print(f"GET /api/domain: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"  Response: {json.dumps(data, indent=2, ensure_ascii=False)}")
        else:
            print(f"  Error: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"Domain API Test Failed: {e}")
        return False

def test_model_api():
    """测试Model API"""
    try:
        response = requests.get(f'{BASE_URL}/api/model')
        print(f"GET /api/model: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"  Response keys: {list(data.keys()) if isinstance(data, dict) else 'array'}")
        else:
            print(f"  Error: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"Model API Test Failed: {e}")
        return False

def test_datasource_api():
    """测试Datasource API"""
    try:
        response = requests.get(f'{BASE_URL}/api/datasource')
        print(f"GET /api/datasource: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"  Response type: {type(data)}")
        else:
            print(f"  Error: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"Datasource API Test Failed: {e}")
        return False

def test_etl_api():
    """测试ETL API"""
    try:
        response = requests.get(f'{BASE_URL}/api/etl/tasks')
        print(f"GET /api/etl/tasks: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"  Response type: {type(data)}")
        else:
            print(f"  Error: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"ETL API Test Failed: {e}")
        return False

if __name__ == '__main__':
    print("=" * 50)
    print("Testing Backend API")
    print("=" * 50)
    
    health_ok = test_health()
    if not health_ok:
        print("\n❌ Backend server is not running or not accessible!")
        print("Please start the backend server first:")
        print("  cd backend_ddd")
        print("  python app.py")
        exit(1)
    
    print("\n" + "=" * 50)
    print("Testing API Endpoints")
    print("=" * 50)
    
    results = {
        'Domain API': test_domain_api(),
        'Model API': test_model_api(),
        'Datasource API': test_datasource_api(),
        'ETL API': test_etl_api(),
    }
    
    print("\n" + "=" * 50)
    print("Test Results")
    print("=" * 50)
    for api, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{api}: {status}")
