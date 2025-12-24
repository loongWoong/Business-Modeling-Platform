# 生成车辆和通行介质数据
import sys
import os
sys.path.append(os.path.dirname(__file__))

from config import get_db_connection, DATA_VOLUME, create_tables
from utils import *

# 生成车辆数据
def generate_vehicle_data(count):
    vehicles = []
    for i in range(count):
        vehicle = {
            'id': random_string(prefix='VEH'),
            'plateNum': generate_plate_number(),
            'plateColor': random_int(0, 5),
            'type': random_int(1, 10),
            'userId': random_string(prefix='USR'),
            'ownerName': generate_name(),
            'ownerIdType': random.choice(['身份证', '护照', '军官证']),
            'ownerIdNum': generate_id_card(),
            'registeredType': random_int(1, 5),
            'channelId': random_string(prefix='CHL'),
            'registeredTime': random_time().strftime('%Y-%m-%d %H:%M:%S'),
            'ownerTel': generate_phone_number(),
            'address': f"{random.choice(['北京市', '上海市', '广州市', '深圳市', '杭州市'])}{random.choice(['朝阳区', '海淀区', '浦东新区', '天河区', '南山区'])}街道{random_int(1, 999)}号",
            'contact': generate_name(),
            'vehicleType': random.choice(['小型汽车', '大型汽车', '挂车', '摩托车', '新能源汽车']),
            'vehicleModel': random_string(prefix='MOD', length=8),
            'useCharacter': random.choice(['非营运', '营运', '租赁', '教练车', '警车']),
            'VIN': generate_vin(),
            'engineNum': generate_engine_num(),
            'registerDate': random_date().strftime('%Y-%m-%d'),
            'issueDate': random_date().strftime('%Y-%m-%d'),
            'fileNum': random_string(prefix='FIL', length=15),
            'approvedCount': random_int(0, 10),
            'totalMass': random_int(1000, 10000),
            'maintenanceMass': random_int(800, 9000),
            'permittedWeight': random_int(1000, 10000),
            'outsideDimensions': f"{random_int(300, 600)}*{random_int(150, 250)}*{random_int(150, 300)}",
            'permittedTowWeight': random_int(0, 5000),
            'testRecord': random.choice(['合格', '不合格', '待检测']),
            'wheelCount': random_int(2, 12),
            'axleCount': random_int(1, 6),
            'axleDistance': random_int(100, 500),
            'axlsType': random.choice(['单轴', '双轴', '三轴', '多轴']),
            'obuId': generate_obu_id(),
            'accountNumber': random_string(prefix='ACC', length=12),
            'vehicleSign': random_int(0, 1),
            'transportIdNum': generate_id_card(),
            'licenseIdNum': generate_id_card()
        }
        vehicles.append(vehicle)
    return vehicles

# 生成通行介质数据
def generate_medium_data(count, vehicle_plates):
    mediums = []
    for i in range(count):
        medium = {
            'id': random_string(prefix='MED'),
            'type': random.choice(['ETC卡', '通行券', '临时卡', '记账卡']),
            'channelId': random_string(prefix='CHL'),
            'plateNum': random.choice(vehicle_plates),
            'plateColor': random_int(0, 5),
            'status': random_int(0, 3),
            'enableTime': random_date().strftime('%Y-%m-%d'),
            'expireTime': (random_date() + timedelta(days=365)).strftime('%Y-%m-%d')
        }
        mediums.append(medium)
    return mediums

# 保存车辆数据到数据库
def save_vehicle_data(vehicles):
    conn = get_db_connection()
    columns = list(vehicles[0].keys())
    data_list = [tuple(vehicle.values()) for vehicle in vehicles]
    batch_insert(conn, 'Vehicle', columns, data_list)
    conn.close()

# 保存通行介质数据到数据库
def save_medium_data(mediums):
    conn = get_db_connection()
    columns = list(mediums[0].keys())
    data_list = [tuple(medium.values()) for medium in mediums]
    batch_insert(conn, 'Medium', columns, data_list)
    conn.close()

# 主函数
def main():
    print("开始生成车辆和通行介质数据...")
    
    # 创建表
    create_tables()
    
    # 生成车辆数据
    vehicle_count = DATA_VOLUME['vehicle']
    vehicles = generate_vehicle_data(vehicle_count)
    save_vehicle_data(vehicles)
    
    # 获取车辆车牌号列表
    vehicle_plates = [v['plateNum'] for v in vehicles]
    
    # 生成通行介质数据
    medium_count = DATA_VOLUME['medium']
    mediums = generate_medium_data(medium_count, vehicle_plates)
    save_medium_data(mediums)
    
    print("车辆和通行介质数据生成完成！")

if __name__ == "__main__":
    main()
