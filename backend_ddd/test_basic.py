"""
基础功能测试
不依赖HTTP服务器，直接测试领域模型和仓储
"""
import sys
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

def test_domain_models():
    """测试领域模型"""
    print("Testing domain models...")
    try:
        from meta.model import Model, Property
        from meta.shared import Relation
        from meta.datasource import Datasource, ModelTableAssociation
        from meta.shared import Mapping
        from meta.etl import ETLTask, ETLLog
        from meta.shared import Domain
        
        model = Model(
            id=1,
            name="测试模型",
            code="test_model",
            description="测试描述"
        )
        assert model.name == "测试模型"
        assert model.code == "test_model"
        print("[OK] Model creation")
        
        property = Property(
            id=1,
            name="测试属性",
            code="test_prop",
            type="string",
            modelId=1,
            required=True
        )
        model.add_property(property)
        assert len(model.properties) == 1
        print("[OK] Property added to Model")
        
        is_valid, error = model.validate_code()
        assert is_valid == True
        print("[OK] Model validation")
        
        is_valid, error = property.validate_value("test")
        assert is_valid == True
        print("[OK] Property validation")
        
        datasource = Datasource(
            id=1,
            name="测试数据源",
            type="mysql",
            url="mysql://localhost:3306/test"
        )
        is_valid, error = datasource.validate_connection()
        assert is_valid == True
        print("[OK] Datasource creation and validation")
        
        etl_task = ETLTask(
            id=1,
            name="测试ETL任务",
            sourceDatasourceId=1,
            targetModelId=1
        )
        is_valid, error = etl_task.is_valid()
        assert is_valid == True
        print("[OK] ETLTask creation and validation")
        
        print("\n[SUCCESS] All domain model tests passed!")
        return True
        
    except Exception as e:
        print(f"\n[FAIL] Domain model test error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_repositories():
    """测试仓储（需要数据库）"""
    print("\nTesting repositories...")
    try:
        from infrastructure.repository.model_repository import ModelRepository
        from infrastructure.repository.domain_repository import DomainRepository
        
        domain_repo = DomainRepository()
        domains = domain_repo.find_all()
        print(f"[OK] DomainRepository.find_all() returned {len(domains)} domains")
        
        model_repo = ModelRepository()
        models = model_repo.find_all()
        print(f"[OK] ModelRepository.find_all() returned {len(models)} models")
        
        print("\n[SUCCESS] All repository tests passed!")
        return True
        
    except Exception as e:
        print(f"\n[FAIL] Repository test error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_services():
    """测试应用服务"""
    print("\nTesting application services...")
    try:
        from application.model_service import ModelService
        from application.domain_service import DomainService
        
        domain_service = DomainService()
        domains = domain_service.get_all()
        print(f"[OK] DomainService.get_all() returned {len(domains)} domains")
        
        model_service = ModelService()
        result = model_service.get_all()
        assert "models" in result
        assert "edges" in result
        print(f"[OK] ModelService.get_all() returned {len(result['models'])} models")
        
        print("\n[SUCCESS] All service tests passed!")
        return True
        
    except Exception as e:
        print(f"\n[FAIL] Service test error: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """运行所有测试"""
    print("=" * 60)
    print("Basic Functionality Test Suite")
    print("=" * 60)
    
    results = []
    
    results.append(("Domain Models", test_domain_models()))
    results.append(("Repositories", test_repositories()))
    results.append(("Services", test_services()))
    
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
