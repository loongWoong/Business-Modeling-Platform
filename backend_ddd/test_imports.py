"""
测试导入是否正常
"""
import sys
import os

# 添加当前目录到Python路径
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

def test_imports():
    """测试所有导入"""
    errors = []
    
    try:
        from domain.model import Model, Property, Relation
        print("[OK] domain.model import successful")
    except Exception as e:
        errors.append(f"domain.model: {e}")
        print(f"[FAIL] domain.model import failed: {e}")
    
    try:
        from domain.datasource import Datasource, Mapping, ModelTableAssociation
        print("[OK] domain.datasource import successful")
    except Exception as e:
        errors.append(f"domain.datasource: {e}")
        print(f"[FAIL] domain.datasource import failed: {e}")
    
    try:
        from domain.etl import ETLTask, ETLLog
        print("[OK] domain.etl import successful")
    except Exception as e:
        errors.append(f"domain.etl: {e}")
        print(f"[FAIL] domain.etl import failed: {e}")
    
    try:
        from domain.shared import Domain
        print("[OK] domain.shared import successful")
    except Exception as e:
        errors.append(f"domain.shared: {e}")
        print(f"[FAIL] domain.shared import failed: {e}")
    
    try:
        from infrastructure.repository.model_repository import ModelRepository
        print("[OK] infrastructure.repository.model_repository import successful")
    except Exception as e:
        errors.append(f"infrastructure.repository.model_repository: {e}")
        print(f"[FAIL] infrastructure.repository.model_repository import failed: {e}")
    
    try:
        from application.model_service import ModelService
        print("[OK] application.model_service import successful")
    except Exception as e:
        errors.append(f"application.model_service: {e}")
        print(f"[FAIL] application.model_service import failed: {e}")
    
    try:
        from interfaces.api.model_routes import model_bp
        print("[OK] interfaces.api.model_routes import successful")
    except Exception as e:
        errors.append(f"interfaces.api.model_routes: {e}")
        print(f"[FAIL] interfaces.api.model_routes import failed: {e}")
    
    if errors:
        print("\n" + "=" * 50)
        print("Import test failed with errors:")
        for error in errors:
            print(f"  - {error}")
        return False
    else:
        print("\n" + "=" * 50)
        print("All import tests passed!")
        return True

if __name__ == '__main__':
    print("=" * 50)
    print("测试导入...")
    print("=" * 50)
    success = test_imports()
    sys.exit(0 if success else 1)

