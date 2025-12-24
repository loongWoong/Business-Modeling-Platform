# 生成收费公路和路段业主数据
import sys
import os
sys.path.append(os.path.dirname(__file__))

from config import get_db_connection, DATA_VOLUME
from utils import *

# 生成收费公路数据
def generate_toll_road_data(count):
    toll_roads = []
    for i in range(count):
        start_lat, start_lng = generate_lat_lng()
        end_lat, end_lng = generate_lat_lng()
        
        toll_road = {
            'id': random_string(prefix='ROAD'),
            'roadNum': f"G{random_int(1, 999)}",
            'provinceId': str(random_int(110000, 650000)),
            'name': generate_road_name(),
            'level': random_int(1, 5),
            'startSite': f"{random.choice(['起点', '入口', '起始点'])}站点{random_int(1, 999)}",
            'startStakeNum': f"K{random_int(0, 1000)}+{random_int(0, 999)}",
            'startLat': str(start_lat),
            'startLng': str(start_lng),
            'startStationId': random_string(prefix='STN'),
            'endSite': f"{random.choice(['终点', '出口', '终止点'])}站点{random_int(1, 999)}",
            'endStakeNum': f"K{random_int(100, 2000)}+{random_int(0, 999)}",
            'endLat': str(end_lat),
            'endLng': str(end_lng),
            'endStationId': random_string(prefix='STN')
        }
        toll_roads.append(toll_road)
    return toll_roads

# 生成路段业主数据
def generate_section_owner_data(count):
    section_owners = []
    for i in range(count):
        section_owner = {
            'id': random_string(prefix='OWN'),
            'provinceId': str(random_int(110000, 650000)),
            'type': random.choice(['国有企业', '民营企业', '合资企业', '外资企业', '政府机构']),
            'num': f"OWN{random_int(1000, 9999)}",
            'name': generate_company_name(),
            'contact': generate_name(),
            'tel': generate_phone_number(),
            'address': f"{random.choice(['北京市', '上海市', '广州市', '深圳市', '杭州市'])}{random.choice(['朝阳区', '海淀区', '浦东新区', '天河区', '南山区'])}商务中心{random_int(1, 99)}层",
            'bank': random.choice(['中国工商银行', '中国建设银行', '中国农业银行', '中国银行', '招商银行']),
            'bankAddr': f"{random.choice(['北京市', '上海市', '广州市', '深圳市', '杭州市'])}分行{random.choice(['朝阳支行', '海淀支行', '浦东支行', '天河支行', '南山支行'])}",
            'bankAccount': f"{random_int(1000, 9999)} {random_int(1000, 9999)} {random_int(1000, 9999)} {random_int(1000, 9999)}",
            'taxpayerCode': ''.join([str(random_int(0, 9)) for _ in range(15)]),
            'creditCode': ''.join([str(random_int(0, 9)) for _ in range(18)])
        }
        section_owners.append(section_owner)
    return section_owners

# 保存收费公路数据到数据库
def save_toll_road_data(toll_roads):
    conn = get_db_connection()
    columns = list(toll_roads[0].keys())
    data_list = [tuple(toll_road.values()) for toll_road in toll_roads]
    batch_insert(conn, 'TollRoad', columns, data_list)
    conn.close()

# 保存路段业主数据到数据库
def save_section_owner_data(section_owners):
    conn = get_db_connection()
    columns = list(section_owners[0].keys())
    data_list = [tuple(owner.values()) for owner in section_owners]
    batch_insert(conn, 'SectionOwner', columns, data_list)
    conn.close()

# 获取已生成的收费公路ID列表
def get_toll_road_ids():
    conn = get_db_connection()
    result = conn.execute("SELECT id FROM TollRoad").fetchall()
    conn.close()
    return [row[0] for row in result]

# 获取已生成的路段业主ID列表
def get_section_owner_ids():
    conn = get_db_connection()
    result = conn.execute("SELECT id FROM SectionOwner").fetchall()
    conn.close()
    return [row[0] for row in result]

# 主函数
def main():
    print("开始生成收费公路和路段业主数据...")
    
    # 生成收费公路数据
    toll_road_count = DATA_VOLUME['toll_road']
    toll_roads = generate_toll_road_data(toll_road_count)
    save_toll_road_data(toll_roads)
    print(f"成功生成 {toll_road_count} 条收费公路数据")
    
    # 生成路段业主数据
    section_owner_count = DATA_VOLUME['section_owner']
    section_owners = generate_section_owner_data(section_owner_count)
    save_section_owner_data(section_owners)
    print(f"成功生成 {section_owner_count} 条路段业主数据")
    
    print("收费公路和路段业主数据生成完成！")

if __name__ == "__main__":
    main()
