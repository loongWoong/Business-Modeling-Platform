import duckdb
import os

# 数据库路径
DB_PATH = 'c:\\Users\\leon\\Downloads\\trae-build-demo\\backend\\app.data.db'

# 需要删除的多余字段映射
EXTRA_FIELDS_TO_REMOVE = {
    'vehicle': ['vehicle_id', 'license_plate', 'vehicle_type', 'owner_name', 'owner_id_card', 'vehicle_color', 'register_date', 'vehicle_status'],
    'toll_road': ['road_id', 'road_name', 'owner_id', 'road_level', 'start_mileage', 'end_mileage'],
    'road_owner': ['owner_id', 'owner_name', 'contact_info'],
    'toll_station': ['station_id', 'station_name', 'road_id', 'station_type'],
    'etc_gantry': ['gantry_id', 'gantry_name', 'road_id', 'gantry_location', 'gantry_status'],
    'toll_unit': ['toll_unit_id', 'toll_unit_name', 'road_id', 'toll_type'],
    'lane': ['lane_id', 'lane_number', 'station_id', 'lane_type', 'lane_status']
}

# 主函数
def main():
    print("=== 开始删除多余的属性 ===")
    
    # 连接数据库
    conn = duckdb.connect(DB_PATH)
    
    # 开始事务
    conn.execute('BEGIN TRANSACTION')
    
    try:
        # 遍历每个模型，删除多余字段
        total_removed = 0
        
        for model_name, extra_fields in EXTRA_FIELDS_TO_REMOVE.items():
            # 获取模型ID
            model_result = conn.execute('SELECT id FROM models WHERE code = ?', [model_name]).fetchone()
            if not model_result:
                print(f"   ⚠️  模型 {model_name} 不存在，跳过")
                continue
            
            model_id = model_result[0]
            print(f"\n   处理模型 {model_name} (ID: {model_id})")
            
            # 删除每个多余字段
            for field_code in extra_fields:
                # 检查字段是否存在
                field_result = conn.execute('SELECT id FROM properties WHERE modelId = ? AND code = ?', [model_id, field_code]).fetchone()
                if field_result:
                    field_id = field_result[0]
                    conn.execute('DELETE FROM properties WHERE id = ?', [field_id])
                    print(f"   ✅ 已删除多余字段: {field_code}")
                    total_removed += 1
                else:
                    print(f"   ⚠️  字段 {field_code} 不存在，跳过")
        
        # 提交事务
        conn.execute('COMMIT')
        print(f"\n=== 删除完成 ===")
        print(f"共删除了 {total_removed} 个多余字段")
        
    except Exception as e:
        # 回滚事务
        conn.execute('ROLLBACK')
        print(f"\n❌ 删除失败，已回滚事务: {e}")
    finally:
        conn.close()

if __name__ == '__main__':
    main()