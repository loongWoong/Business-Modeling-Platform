# 生成收费路段、收费单元、收费站数据
import sys
import os
sys.path.append(os.path.dirname(__file__))

from config import get_db_connection, DATA_VOLUME
from utils import *

# 生成收费路段数据
def generate_section_data(count, toll_road_ids, section_owner_ids):
    sections = []
    for i in range(count):
        start_lat, start_lng = generate_lat_lng()
        end_lat, end_lng = generate_lat_lng()
        
        section = {
            'id': random_string(prefix='SEC'),
            'tollRoadId': random.choice(toll_road_ids),
            'num': f"SEC{random_int(1000, 9999)}",
            'reservedNum': f"RES{random_int(1000, 9999)}",
            'name': f"{random.choice(['主线', '支线', '连接线'])}路段{random_int(1, 999)}",
            'type': random_int(1, 5),
            'length': random_int(1000, 100000),
            'online': random_int(0, 1),
            'startLat': str(start_lat),
            'startLng': str(start_lng),
            'startStakeNum': f"K{random_int(0, 1000)}+{random_int(0, 999)}",
            'endStakeNum': f"K{random_int(100, 2000)}+{random_int(0, 999)}",
            'endLat': str(end_lat),
            'endLng': str(end_lng),
            'tax': random_int(0, 1),
            'taxRate': str(random_float(0.0, 0.2)),
            'sectionOwnerId': random.choice(section_owner_ids),
            'chargeType': random_int(1, 3),
            'tollRoads': random_string(prefix='ROADS', length=20),
            'builtTime': random_date().strftime('%Y-%m-%d'),
            'startTime': random_date().strftime('%Y-%m-%d'),
            'endTime': (random_date() + timedelta(days=3650)).strftime('%Y-%m-%d'),
            'nextTaxRate': str(random_float(0.0, 0.2)),
            'nextRateDate': (random_date() + timedelta(days=365)).strftime('%Y-%m-%d')
        }
        sections.append(section)
    return sections

# 生成收费单元数据
def generate_toll_interval_data(count, section_ids):
    toll_intervals = []
    for i in range(count):
        start_lat, start_lng = generate_lat_lng()
        end_lat, end_lng = generate_lat_lng()
        
        toll_interval = {
            'id': random_string(prefix='INT'),
            'sectionId': random.choice(section_ids),
            'num': f"INT{random_int(1000, 9999)}",
            'direction': random_int(0, 1),
            'reservedNum': f"RES{random_int(1000, 9999)}",
            'name': f"收费单元{random_int(1, 999)}",
            'type': random_int(1, 5),
            'length': random_int(500, 50000),
            'startLat': str(start_lat),
            'startLng': str(start_lng),
            'startStakeNum': f"K{random_int(0, 1000)}+{random_int(0, 999)}",
            'endStakeNum': f"K{random_int(100, 2000)}+{random_int(0, 999)}",
            'endLat': str(end_lat),
            'endLng': str(end_lng),
            'tollRoads': random_string(prefix='ROADS', length=20),
            'endTime': (random_date() + timedelta(days=3650)).strftime('%Y-%m-%d'),
            'provinceType': random_int(1, 3),
            'beginTime': random_date().strftime('%Y-%m-%d'),
            'verticalSectionType': random_int(1, 5)
        }
        toll_intervals.append(toll_interval)
    return toll_intervals

# 生成收费站数据
def generate_toll_station_data(count, section_ids):
    toll_stations = []
    for i in range(count):
        toll_station = {
            'id': random_string(prefix='STN'),
            'sectionId': random.choice(section_ids),
            'num': f"STN{random_int(1000, 9999)}",
            'reservedNum': f"RES{random_int(1000, 9999)}",
            'name': f"{random.choice(['主线', '匝道', '互通'])}收费站{random_int(1, 999)}",
            'tollPlazaCount': random_int(1, 10),
            'stationHex': ''.join([random.choice('0123456789ABCDEF') for _ in range(8)]),
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
            'serverManuID': random_string(prefix='MAN', length=10),
            'serversysName': f"ServerOS{random_int(1, 10)}",
            'serversysVer': f"{random_int(1, 10)}.{random_int(0, 9)}.{random_int(0, 99)}",
            'serverDateVer': random_date().strftime('%Y%m%d'),
            'type': random_int(1, 5),
            'status': random_int(0, 2),
            'realType': random_int(1, 5),
            'regionName': random.choice(['华北', '华东', '华南', '华中', '西南', '西北', '东北']),
            'countryName': '中国',
            'regionalismCode': str(random_int(100000, 999999)),
            'agencyGantryIds': ','.join([random_string(prefix='GAN', length=8) for _ in range(random_int(1, 5))])
        }
        toll_stations.append(toll_station)
    return toll_stations

# 保存收费路段数据到数据库
def save_section_data(sections):
    conn = get_db_connection()
    columns = list(sections[0].keys())
    data_list = [tuple(section.values()) for section in sections]
    batch_insert(conn, 'Section', columns, data_list)
    conn.close()

# 保存收费单元数据到数据库
def save_toll_interval_data(toll_intervals):
    conn = get_db_connection()
    columns = list(toll_intervals[0].keys())
    data_list = [tuple(interval.values()) for interval in toll_intervals]
    batch_insert(conn, 'TollInterval', columns, data_list)
    conn.close()

# 保存收费站数据到数据库
def save_toll_station_data(toll_stations):
    conn = get_db_connection()
    columns = list(toll_stations[0].keys())
    data_list = [tuple(station.values()) for station in toll_stations]
    batch_insert(conn, 'TollStation', columns, data_list)
    conn.close()

# 获取外部依赖ID列表
def get_external_ids():
    conn = get_db_connection()
    
    # 获取收费公路ID列表
    toll_road_result = conn.execute("SELECT id FROM TollRoad").fetchall()
    toll_road_ids = [row[0] for row in toll_road_result]
    
    # 获取路段业主ID列表
    section_owner_result = conn.execute("SELECT id FROM SectionOwner").fetchall()
    section_owner_ids = [row[0] for row in section_owner_result]
    
    conn.close()
    
    return toll_road_ids, section_owner_ids

# 获取已生成的收费路段ID列表
def get_section_ids():
    conn = get_db_connection()
    result = conn.execute("SELECT id FROM Section").fetchall()
    conn.close()
    return [row[0] for row in result]

# 获取已生成的收费站ID列表
def get_toll_station_ids():
    conn = get_db_connection()
    result = conn.execute("SELECT id FROM TollStation").fetchall()
    conn.close()
    return [row[0] for row in result]

# 主函数
def main():
    print("开始生成收费路段、收费单元、收费站数据...")
    
    # 获取外部依赖ID
    toll_road_ids, section_owner_ids = get_external_ids()
    
    if not toll_road_ids or not section_owner_ids:
        print("错误：缺少外部依赖数据，请先运行 generate_toll_road_owner.py")
        return
    
    # 生成收费路段数据
    section_count = DATA_VOLUME['section']
    sections = generate_section_data(section_count, toll_road_ids, section_owner_ids)
    save_section_data(sections)
    print(f"成功生成 {section_count} 条收费路段数据")
    
    # 获取生成的收费路段ID
    section_ids = get_section_ids()
    
    # 生成收费单元数据
    toll_interval_count = DATA_VOLUME['toll_interval']
    toll_intervals = generate_toll_interval_data(toll_interval_count, section_ids)
    save_toll_interval_data(toll_intervals)
    print(f"成功生成 {toll_interval_count} 条收费单元数据")
    
    # 生成收费站数据
    toll_station_count = DATA_VOLUME['toll_station']
    toll_stations = generate_toll_station_data(toll_station_count, section_ids)
    save_toll_station_data(toll_stations)
    print(f"成功生成 {toll_station_count} 条收费站数据")
    
    print("收费路段、收费单元、收费站数据生成完成！")

if __name__ == "__main__":
    main()
