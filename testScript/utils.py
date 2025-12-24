# 数据生成工具函数
import random
import string
from datetime import datetime, timedelta

# 生成随机字符串
def random_string(length=10, prefix=""):
    chars = string.ascii_uppercase + string.digits
    return prefix + ''.join(random.choice(chars) for _ in range(length))

# 生成随机整数
def random_int(min_val=0, max_val=100):
    return random.randint(min_val, max_val)

# 生成随机浮点数
def random_float(min_val=0.0, max_val=100.0, decimal_places=2):
    return round(random.uniform(min_val, max_val), decimal_places)

# 生成随机日期
def random_date(start_date=datetime(2023, 1, 1), end_date=datetime(2024, 12, 31)):
    delta = end_date - start_date
    random_days = random.randint(0, delta.days)
    return start_date + timedelta(days=random_days)

# 生成随机时间
def random_time(start_time=datetime(2023, 1, 1), end_time=datetime(2024, 12, 31)):
    delta = end_time - start_time
    random_seconds = random.randint(0, int(delta.total_seconds()))
    return start_time + timedelta(seconds=random_seconds)

# 生成随机车牌号
def generate_plate_number():
    provinces = ["京", "津", "沪", "渝", "冀", "豫", "云", "辽", "黑", "湘", "皖", "鲁", "新", "苏", "浙", "赣", "鄂", "桂", "甘", "晋", "蒙", "陕", "吉", "闽", "贵", "粤", "青", "藏", "川", "宁", "琼"]
    letters = string.ascii_uppercase
    digits = string.digits
    
    province = random.choice(provinces)
    letter = random.choice(letters)
    number = ''.join(random.choice(digits) for _ in range(5))
    
    return f"{province}{letter}{number}"

# 生成随机身份证号
def generate_id_card():
    area_codes = [110000, 120000, 130000, 140000, 150000, 210000, 220000, 230000, 310000, 320000, 330000, 340000, 350000, 360000, 370000, 410000, 420000, 430000, 440000, 450000, 460000, 500000, 510000, 520000, 530000, 540000, 610000, 620000, 630000, 640000, 650000]
    year = random.randint(1950, 2005)
    month = random.randint(1, 12)
    day = random.randint(1, 28)
    
    area_code = random.choice(area_codes)
    birth_date = f"{year:04d}{month:02d}{day:02d}"
    sequence = random.randint(100, 999)
    check_bit = random.choice(list(string.digits) + ["X"])
    
    return f"{area_code}{birth_date}{sequence}{check_bit}"

# 生成随机手机号
def generate_phone_number():
    prefixes = [130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 150, 151, 152, 153, 155, 156, 157, 158, 159, 170, 171, 172, 173, 175, 176, 177, 178, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189]
    prefix = random.choice(prefixes)
    suffix = ''.join(random.choice(string.digits) for _ in range(8))
    return f"{prefix}{suffix}"

# 生成随机VIN码
def generate_vin():
    chars = string.ascii_uppercase.replace('I', '').replace('O', '').replace('Q', '') + string.digits
    return ''.join(random.choice(chars) for _ in range(17))

# 生成随机发动机号
def generate_engine_num():
    chars = string.ascii_uppercase + string.digits
    return ''.join(random.choice(chars) for _ in range(10))

# 生成随机OBU号
def generate_obu_id():
    return f"OBU{random.randint(1000000000, 9999999999)}"

# 生成随机IP地址
def generate_ip():
    return f"{random.randint(1, 254)}.{random.randint(0, 254)}.{random.randint(0, 254)}.{random.randint(1, 254)}"

# 生成随机经纬度
def generate_lat_lng():
    lat = round(random.uniform(-90, 90), 6)
    lng = round(random.uniform(-180, 180), 6)
    return lat, lng

# 生成随机路段名称
def generate_road_name():
    road_types = ["高速", "国道", "省道", "县道", "乡道"]
    city_pairs = ["北京-上海", "广州-深圳", "成都-重庆", "杭州-宁波", "武汉-长沙", "西安-咸阳", "南京-苏州", "青岛-济南", "沈阳-大连", "福州-厦门"]
    
    road_type = random.choice(road_types)
    city_pair = random.choice(city_pairs)
    number = random.randint(1, 999)
    
    return f"{city_pair}{road_type}{number}号"

# 生成随机企业名称
def generate_company_name():
    prefixes = ["中国", "北京", "上海", "广东", "浙江", "江苏", "山东", "深圳", "广州", "杭州"]
    types = ["高速公路", "交通", "运输", "建设", "投资", "发展"]
    suffixes = ["有限公司", "股份有限公司", "集团有限公司", "有限责任公司"]
    
    prefix = random.choice(prefixes)
    type = random.choice(types)
    suffix = random.choice(suffixes)
    
    return f"{prefix}{type}{suffix}"

# 生成随机姓名
def generate_name():
    surnames = ["王", "李", "张", "刘", "陈", "杨", "赵", "黄", "周", "吴", "徐", "孙", "胡", "朱", "高", "林", "何", "郭", "马", "罗"]
    given_names = ["伟", "芳", "秀英", "娜", "敏", "静", "丽", "强", "磊", "军", "洋", "勇", "艳", "杰", "娟", "涛", "明", "超", "秀兰", "霞"]
    
    surname = random.choice(surnames)
    given_name = random.choice(given_names)
    
    return f"{surname}{given_name}"

# 批量插入数据
def batch_insert(conn, table_name, columns, data_list, batch_size=1000):
    if not data_list:
        return
    
    # 构建插入语句
    placeholders = ', '.join(['?' for _ in columns])
    columns_str = ', '.join(columns)
    insert_sql = f"INSERT INTO {table_name} ({columns_str}) VALUES ({placeholders})"
    
    # 批量执行
    for i in range(0, len(data_list), batch_size):
        batch_data = data_list[i:i+batch_size]
        conn.executemany(insert_sql, batch_data)
        conn.commit()
    
    print(f"成功插入 {len(data_list)} 条数据到 {table_name} 表")
