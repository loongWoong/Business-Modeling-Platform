# 生成收费广场、收费车道、收费门架数据
import sys
import os
sys.path.append(os.path.dirname(__file__))

from config import get_db_connection, DATA_VOLUME
from utils import *

# 生成收费广场数据
def generate_toll_plaza_data(count, toll_station_ids):
    toll_plazas = []
    for i in range(count):
        toll_plaza = {
            'id': random_string(prefix='PLZ'),
            'tollStationId': random.choice(toll_station_ids),
            'type': random_int(1, 5),
            'num': f"PLZ{random_int(1000, 9999)}",
            'reservedNum': f"RES{random_int(1000, 9999)}",
            'tidalTime': f"{random_int(6, 9)}:{random_int(0, 59)}-{random_int(17, 20)}:{random_int(0, 59)}",
            'startTime': random_date().strftime('%Y-%m-%d'),
            'endTime': (random_date() + timedelta(days=3650)).strftime('%Y-%m-%d'),
            'status': random_int(0, 2),
            'laneHex': ''.join([random.choice('0123456789ABCDEF') for _ in range(8)]),
            'rsuManUID': random_string(prefix='RSU', length=15),
            'rsuModel': random_string(prefix='MOD', length=10),
            'rsuID': random_string(prefix='ID', length=15),
            'entryExitType': random_int(1, 2),
            'railingPos': random_int(1, 4),
            'ifContainLimitWeight': random_int(0, 1),
            'VPLRManUID': random_string(prefix='VPLR', length=15)
        }
        toll_plazas.append(toll_plaza)
    return toll_plazas

# 生成收费车道数据
def generate_toll_lane_data(count, toll_plaza_ids):
    toll_lanes = []
    for i in range(count):
        toll_lane = {
            'id': random_string(prefix='LANE'),
            'tollPlazaId': random.choice(toll_plaza_ids),
            'num': f"LANE{random_int(1000, 9999)}",
            'reservedNum': f"RES{random_int(1000, 9999)}",
            'type': random_int(1, 5),
            'tidalTime': f"{random_int(6, 9)}:{random_int(0, 59)}-{random_int(17, 20)}:{random_int(0, 59)}",
            'startTime': random_date().strftime('%Y-%m-%d'),
            'endTime': (random_date() + timedelta(days=3650)).strftime('%Y-%m-%d'),
            'status': random_int(0, 2),
            'laneHex': ''.join([random.choice('0123456789ABCDEF') for _ in range(8)]),
            'rsuManUID': random_string(prefix='RSU', length=15),
            'rsuModel': random_string(prefix='MOD', length=10),
            'rsuID': random_string(prefix='ID', length=15),
            'entryExitType': random_int(1, 2),
            'railingPos': random_int(1, 4),
            'ifContainLimitWeight': random_int(0, 1),
            'VPLRManUID': random_string(prefix='VPLR', length=15)
        }
        toll_lanes.append(toll_lane)
    return toll_lanes

# 生成收费门架数据
def generate_toll_gantry_data(count, toll_interval_ids):
    toll_gantries = []
    for i in range(count):
        lat, lng = generate_lat_lng()
        
        toll_gantry = {
            'id': random_string(prefix='GAN'),
            'tollIntervalId': random.choice(toll_interval_ids),
            'num': f"GAN{random_int(1000, 9999)}",
            'reservedNum': f"RES{random_int(1000, 9999)}",
            'type': random_int(1, 5),
            'boundaryType': random_int(1, 3),
            'gantrySign': random_string(prefix='SIGN', length=10),
            'tollIntervals': random_string(prefix='INTS', length=20),
            'lat': str(lat),
            'lng': str(lng),
            'pileNumber': f"K{random_int(0, 2000)}+{random_int(0, 999)}",
            'status': random_int(0, 2),
            'startTime': random_date().strftime('%Y-%m-%d'),
            'endTime': (random_date() + timedelta(days=3650)).strftime('%Y-%m-%d'),
            'etcGantryHex': ''.join([random.choice('0123456789ABCDEF') for _ in range(8)]),
            'rsuManUID': random_string(prefix='RSU', length=15),
            'rsuModel': random_string(prefix='MOD', length=10),
            'rsuID': random_string(prefix='ID', length=15),
            'VPLRUID': random_string(prefix='VPLR', length=15),
            'VPLRModel': random_string(prefix='MOD', length=10),
            'VPLRID': random_string(prefix='ID', length=15),
            'HDVUID': random_string(prefix='HDV', length=15),
            'HDVModel': random_string(prefix='MOD', length=10),
            'HDVID': random_string(prefix='ID', length=15),
            'controllerUID': random_string(prefix='CTRL', length=15),
            'controllerModel': random_string(prefix='MOD', length=10),
            'controllerID': random_string(prefix='ID', length=15),
            'controllerSysVer': f"{random_int(1, 10)}.{random_int(0, 9)}.{random_int(0, 99)}",
            'serverUID': random_string(prefix='SRV', length=15),
            'serverModel': random_string(prefix='MOD', length=10),
            'serverID': random_string(prefix='ID', length=15),
            'serverSysVer': f"{random_int(1, 10)}.{random_int(0, 9)}.{random_int(0, 99)}",
            'serverDBVer': random_date().strftime('%Y%m%d'),
            'vehDetectorUID': random_string(prefix='DET', length=15),
            'vehDetectorModel': random_string(prefix='MOD', length=10),
            'vehDetectorID': random_string(prefix='ID', length=15),
            'weatherDetectorUID': random_string(prefix='WTH', length=15),
            'weatherDetectorModel': random_string(prefix='MOD', length=10),
            'weatherDetectorID': random_string(prefix='ID', length=15),
            'classDetectorUID': random_string(prefix='CLS', length=15),
            'classDetectorModel': random_string(prefix='MOD', length=10),
            'classDetectorID': random_string(prefix='ID', length=15),
            'loadDetectionUID': random_string(prefix='LD', length=15),
            'loadDetectionModel': random_string(prefix='MOD', length=10),
            'loadDetectionID': random_string(prefix='ID', length=15),
            'tempControllerUID': random_string(prefix='TEMP', length=15),
            'tempControllerModel': random_string(prefix='MOD', length=10),
            'tempControllerID': random_string(prefix='ID', length=15),
            'powerControllerUID': random_string(prefix='PWR', length=15),
            'powerControllerModel': random_string(prefix='MOD', length=10),
            'powerControllerID': random_string(prefix='ID', length=15),
            'safeEquipUID': random_string(prefix='SAFE', length=15),
            'safeEquipModel': random_string(prefix='MOD', length=10),
            'safeEquipID': random_string(prefix='ID', length=15),
            'lineType': random.choice(['直线', '曲线', '斜坡']),
            'operators': generate_company_name(),
            'dataMergePoint': random_string(prefix='DMP', length=10),
            'imei': ''.join([random.choice('0123456789') for _ in range(15)]),
            'ip': generate_ip(),
            'snmpVersion': random.choice(['v1', 'v2c', 'v3']),
            'snmpPort': random_int(1024, 65535),
            'community': random_string(prefix='COM', length=10),
            'securityName': random_string(prefix='SEC', length=10),
            'securityLevel': random.choice(['noAuthNoPriv', 'authNoPriv', 'authPriv']),
            'authentication': random.choice(['MD5', 'SHA', 'SHA-256']),
            'authKey': random_string(prefix='AUTH', length=20),
            'encryption': random.choice(['DES', 'AES', '3DES']),
            'secretKey': random_string(prefix='SEC', length=20),
            'gantryType': random_int(1, 5),
            'laneCount': str(random_int(1, 12)),
            'reEtcGantryHex': ''.join([random.choice('0123456789ABCDEF') for _ in range(8)]),
            'agencyGantryIds': ','.join([random_string(prefix='GAN', length=8) for _ in range(random_int(1, 5))])
        }
        toll_gantries.append(toll_gantry)
    return toll_gantries

# 保存收费广场数据到数据库
def save_toll_plaza_data(toll_plazas):
    conn = get_db_connection()
    columns = list(toll_plazas[0].keys())
    data_list = [tuple(plaza.values()) for plaza in toll_plazas]
    batch_insert(conn, 'TollPlaza', columns, data_list)
    conn.close()

# 保存收费车道数据到数据库
def save_toll_lane_data(toll_lanes):
    conn = get_db_connection()
    columns = list(toll_lanes[0].keys())
    data_list = [tuple(lane.values()) for lane in toll_lanes]
    batch_insert(conn, 'TollLane', columns, data_list)
    conn.close()

# 保存收费门架数据到数据库
def save_toll_gantry_data(toll_gantries):
    conn = get_db_connection()
    columns = list(toll_gantries[0].keys())
    data_list = [tuple(gantry.values()) for gantry in toll_gantries]
    batch_insert(conn, 'TollGantry', columns, data_list)
    conn.close()

# 获取外部依赖ID列表
def get_external_ids():
    conn = get_db_connection()
    
    # 获取收费站ID列表
    toll_station_result = conn.execute("SELECT id FROM TollStation").fetchall()
    toll_station_ids = [row[0] for row in toll_station_result]
    
    # 获取收费单元ID列表
    toll_interval_result = conn.execute("SELECT id FROM TollInterval").fetchall()
    toll_interval_ids = [row[0] for row in toll_interval_result]
    
    conn.close()
    
    return toll_station_ids, toll_interval_ids

# 获取已生成的收费广场ID列表
def get_toll_plaza_ids():
    conn = get_db_connection()
    result = conn.execute("SELECT id FROM TollPlaza").fetchall()
    conn.close()
    return [row[0] for row in result]

# 主函数
def main():
    print("开始生成收费广场、收费车道、收费门架数据...")
    
    # 获取外部依赖ID
    toll_station_ids, toll_interval_ids = get_external_ids()
    
    if not toll_station_ids:
        print("错误：缺少收费站数据，请先运行 generate_section_station.py")
        return
    
    if not toll_interval_ids:
        print("错误：缺少收费单元数据，请先运行 generate_section_station.py")
        return
    
    # 生成收费广场数据
    toll_plaza_count = DATA_VOLUME['toll_plaza']
    toll_plazas = generate_toll_plaza_data(toll_plaza_count, toll_station_ids)
    save_toll_plaza_data(toll_plazas)
    print(f"成功生成 {toll_plaza_count} 条收费广场数据")
    
    # 获取生成的收费广场ID
    toll_plaza_ids = get_toll_plaza_ids()
    
    # 生成收费车道数据
    toll_lane_count = DATA_VOLUME['toll_lane']
    toll_lanes = generate_toll_lane_data(toll_lane_count, toll_plaza_ids)
    save_toll_lane_data(toll_lanes)
    print(f"成功生成 {toll_lane_count} 条收费车道数据")
    
    # 生成收费门架数据
    toll_gantry_count = DATA_VOLUME['toll_gantry']
    toll_gantries = generate_toll_gantry_data(toll_gantry_count, toll_interval_ids)
    save_toll_gantry_data(toll_gantries)
    print(f"成功生成 {toll_gantry_count} 条收费门架数据")
    
    print("收费广场、收费车道、收费门架数据生成完成！")

if __name__ == "__main__":
    main()
