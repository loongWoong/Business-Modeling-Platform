"""
API测试脚本
测试所有API端点是否正常工作
"""
import sys
import os
import requests
import time
import json

# 添加当前目录到Python路径
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

BASE_URL = "http://localhost:5000"

def test_health_check():
    """测试健康检查端点"""
    print("Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "healthy":
                print("[OK] Health check passed")
                return True
            else:
                print(f"[FAIL] Health check returned unexpected data: {data}")
                return False
        else:
            print(f"[FAIL] Health check returned status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("[FAIL] Cannot connect to server. Is the server running?")
        return False
    except Exception as e:
        print(f"[FAIL] Health check error: {e}")
        return False

def test_domain_api():
    """测试Domain API"""
    print("\nTesting Domain API...")
    try:
        # 创建Domain
        domain_data = {
            "name": "测试域",
            "description": "这是一个测试域"
        }
        response = requests.post(
            f"{BASE_URL}/api/domain",
            json=domain_data,
            timeout=5
        )
        if response.status_code == 201:
            domain = response.json()
            domain_id = domain.get("id")
            print(f"[OK] Domain created with id: {domain_id}")
            
            # 获取所有Domain
            response = requests.get(f"{BASE_URL}/api/domain", timeout=5)
            if response.status_code == 200:
                domains = response.json()
                print(f"[OK] Retrieved {len(domains)} domains")
                return True
            else:
                print(f"[FAIL] Failed to retrieve domains: {response.status_code}")
                return False
        else:
            print(f"[FAIL] Failed to create domain: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"[FAIL] Domain API error: {e}")
        return False

def test_model_api():
    """测试Model API"""
    print("\nTesting Model API...")
    try:
        # 创建Model
        model_data = {
            "name": "用户模型",
            "code": "user",
            "description": "用户业务模型"
        }
        response = requests.post(
            f"{BASE_URL}/api/model",
            json=model_data,
            timeout=5
        )
        if response.status_code == 201:
            model = response.json()
            model_id = model.get("id")
            print(f"[OK] Model created with id: {model_id}")
            
            # 获取Model详情
            response = requests.get(f"{BASE_URL}/api/model/{model_id}", timeout=5)
            if response.status_code == 200:
                data = response.json()
                if "model" in data and "properties" in data and "relations" in data:
                    print("[OK] Model detail retrieved with properties and relations")
                    
                    # 添加Property
                    property_data = {
                        "name": "用户名",
                        "code": "username",
                        "type": "string",
                        "required": True
                    }
                    response = requests.post(
                        f"{BASE_URL}/api/model/{model_id}/properties",
                        json=property_data,
                        timeout=5
                    )
                    if response.status_code == 201:
                        print("[OK] Property added to model")
                        return True
                    else:
                        print(f"[FAIL] Failed to add property: {response.status_code} - {response.text}")
                        return False
                else:
                    print(f"[FAIL] Model detail structure incorrect: {data}")
                    return False
            else:
                print(f"[FAIL] Failed to retrieve model: {response.status_code}")
                return False
        else:
            print(f"[FAIL] Failed to create model: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"[FAIL] Model API error: {e}")
        return False

def test_datasource_api():
    """测试Datasource API"""
    print("\nTesting Datasource API...")
    try:
        # 创建Datasource
        datasource_data = {
            "name": "MySQL数据源",
            "type": "mysql",
            "url": "mysql://localhost:3306/testdb",
            "username": "user",
            "password": "pass"
        }
        response = requests.post(
            f"{BASE_URL}/api/datasource",
            json=datasource_data,
            timeout=5
        )
        if response.status_code == 201:
            datasource = response.json()
            datasource_id = datasource.get("id")
            print(f"[OK] Datasource created with id: {datasource_id}")
            
            # 获取Datasource详情
            response = requests.get(f"{BASE_URL}/api/datasource/{datasource_id}", timeout=5)
            if response.status_code == 200:
                data = response.json()
                if "datasource" in data and "mappings" in data and "associations" in data:
                    print("[OK] Datasource detail retrieved with mappings and associations")
                    return True
                else:
                    print(f"[FAIL] Datasource detail structure incorrect: {data}")
                    return False
            else:
                print(f"[FAIL] Failed to retrieve datasource: {response.status_code}")
                return False
        else:
            print(f"[FAIL] Failed to create datasource: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"[FAIL] Datasource API error: {e}")
        return False

def test_etl_api():
    """测试ETL API"""
    print("\nTesting ETL API...")
    try:
        # 获取所有ETL Tasks
        response = requests.get(f"{BASE_URL}/api/etl/tasks", timeout=5)
        if response.status_code == 200:
            tasks = response.json()
            print(f"[OK] Retrieved {len(tasks)} ETL tasks")
            return True
        else:
            print(f"[FAIL] Failed to retrieve ETL tasks: {response.status_code}")
            return False
    except Exception as e:
        print(f"[FAIL] ETL API error: {e}")
        return False

def main():
    """运行所有测试"""
    print("=" * 60)
    print("API Test Suite")
    print("=" * 60)
    print(f"Testing server at: {BASE_URL}")
    print("=" * 60)
    
    # 等待服务器启动
    print("\nWaiting for server to be ready...")
    for i in range(10):
        try:
            response = requests.get(f"{BASE_URL}/health", timeout=2)
            if response.status_code == 200:
                print("Server is ready!")
                break
        except:
            if i < 9:
                print(f"Waiting... ({i+1}/10)")
                time.sleep(1)
            else:
                print("\n[ERROR] Server is not responding. Please start the server first:")
                print("  python run.py")
                return False
    
    results = []
    
    # 运行测试
    results.append(("Health Check", test_health_check()))
    results.append(("Domain API", test_domain_api()))
    results.append(("Model API", test_model_api()))
    results.append(("Datasource API", test_datasource_api()))
    results.append(("ETL API", test_etl_api()))
    
    # 汇总结果
    print("\n" + "=" * 60)
    print("Test Results Summary")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "[PASS]" if result else "[FAIL]"
        print(f"{status} {name}")
    
    print("=" * 60)
    print(f"Total: {passed}/{total} tests passed")
    print("=" * 60)
    
    return passed == total

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)

