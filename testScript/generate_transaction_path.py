# 生成交易流水、路径、拟合路径和拆分明细数据
import sys
import os
sys.path.append(os.path.dirname(__file__))

from config import get_db_connection, DATA_VOLUME
from utils import *

# 生成交易流水数据
def generate_transaction_data(count, medium_ids, toll_gantry_ids, toll_lane_ids, vehicle_plates):
    transactions = []
    for i in range(count):
        plate_num = random.choice(vehicle_plates)
        
        # 随机生成费用
        fee = random_int(100, 10000)
        discount_fee = random_int(0, fee // 2)
        pay_fee = fee - discount_fee
        
        transaction = {
            'id': random_string(prefix='TRAN'),
            'passId': random_string(prefix='PASS', length=15),
            'mediumId': random.choice(medium_ids),
            'mediaType': random_int(1, 4),
            'exitFeeType': random_int(1, 3),
            'provinceId': random_int(110000, 650000),
            'transtime': random_time().strftime('%Y-%m-%d %H:%M:%S'),
            'plateNum': plate_num,
            'plateColor': random_int(0, 5),
            'identifyId': random_string(prefix='ID', length=20),
            'identifyHex': ''.join([random.choice('0123456789ABCDEF') for _ in range(16)]),
            'payFee': pay_fee,
            'fee': fee,
            'discountFee': discount_fee
        }
        transactions.append(transaction)
    return transactions

# 生成车辆通行路径数据
def generate_path_data(count, toll_lane_ids, vehicle_plates):
    paths = []
    for i in range(count):
        plate_num = random.choice(vehicle_plates)
        en_time = random_time()
        ex_time = en_time + timedelta(minutes=random_int(30, 360))
        
        path = {
            'id': random_string(prefix='PATH'),
            'passId': random_string(prefix='PASS', length=15),
            'plateNum': plate_num,
            'plateColor': random_int(0, 5),
            'enTime': en_time.strftime('%Y-%m-%d %H:%M:%S'),
            'exTime': ex_time.strftime('%Y-%m-%d %H:%M:%S'),
            'enTollLaneId': random.choice(toll_lane_ids),
            'exTollLaneId': random.choice(toll_lane_ids),
            'enTollStationId': random_string(prefix='STN'),
            'exTollStationId': random_string(prefix='STN')
        }
        paths.append(path)
    return paths

# 生成车辆通行拟合路径数据
def generate_restore_path_data(count, paths):
    restore_paths = []
    for path in paths[:count]:
        restore_path = {
            'passId': path['passId'],
            'plateNum': path['plateNum'],
            'plateColor': path['plateColor'],
            'enTime': path['enTime'],
            'exTime': path['exTime'],
            'enTollLaneId': path['enTollLaneId'],
            'exTollLaneId': path['exTollLaneId'],
            'enTollStationId': path['enTollStationId'],
            'exTollStationId': path['exTollStationId']
        }
        restore_paths.append(restore_path)
    return restore_paths

# 生成拆分明细数据
def generate_split_detail_data(count, restore_paths, toll_interval_ids, transaction_ids):
    split_details = []
    used_keys = set()  # 用于存储已使用的(passId, intervalId)组合
    
    # 为每个拟合路径生成随机数量的拆分明细
    for restore_path in restore_paths:
        detail_count = random_int(1, 5)  # 每个路径生成1-5条拆分明细
        used_intervals = set()  # 记录当前passId已使用的intervalId
        
        for _ in range(detail_count):
            # 确保每个passId使用不同的intervalId
            available_intervals = list(set(toll_interval_ids) - used_intervals)
            if not available_intervals:
                break
            
            interval_id = random.choice(available_intervals)
            used_intervals.add(interval_id)
            
            key = (restore_path['passId'], interval_id)
            if key in used_keys:
                continue  # 跳过已存在的组合
            
            # 随机生成费用
            toll_interval_fee = str(random_float(10.0, 1000.0))
            discount = random_float(0.0, float(toll_interval_fee) * 0.3)
            toll_interval_pay_fee = str(float(toll_interval_fee) - discount)
            toll_interval_discount_fee = str(discount)
            
            split_detail = {
                'passId': restore_path['passId'],
                'transactionId': random.choice(transaction_ids),
                'intervalId': interval_id,
                'tollIntervalFee': toll_interval_fee,
                'tollIntervalPayFee': toll_interval_pay_fee,
                'tollIntervalDiscountFee': toll_interval_discount_fee
            }
            
            split_details.append(split_detail)
            used_keys.add(key)
            
            # 如果达到目标数量，提前返回
            if len(split_details) >= count:
                return split_details
    
    return split_details

# 保存交易流水数据到数据库
def save_transaction_data(transactions):
    conn = get_db_connection()
    columns = list(transactions[0].keys())
    data_list = [tuple(transaction.values()) for transaction in transactions]
    batch_insert(conn, 'Transaction', columns, data_list)
    conn.close()

# 保存车辆通行路径数据到数据库
def save_path_data(paths):
    conn = get_db_connection()
    columns = list(paths[0].keys())
    data_list = [tuple(path.values()) for path in paths]
    batch_insert(conn, 'Path', columns, data_list)
    conn.close()

# 保存车辆通行拟合路径数据到数据库
def save_restore_path_data(restore_paths):
    conn = get_db_connection()
    columns = list(restore_paths[0].keys())
    data_list = [tuple(restore_path.values()) for restore_path in restore_paths]
    batch_insert(conn, 'RestorePath', columns, data_list)
    conn.close()

# 保存拆分明细数据到数据库
def save_split_detail_data(split_details):
    conn = get_db_connection()
    columns = list(split_details[0].keys())
    data_list = [tuple(split_detail.values()) for split_detail in split_details]
    batch_insert(conn, 'SplitDetail', columns, data_list)
    conn.close()

# 获取外部依赖ID列表
def get_external_ids():
    conn = get_db_connection()
    
    # 获取通行介质ID列表
    medium_result = conn.execute("SELECT id FROM Medium").fetchall()
    medium_ids = [row[0] for row in medium_result]
    
    # 获取收费门架ID列表
    toll_gantry_result = conn.execute("SELECT id FROM TollGantry").fetchall()
    toll_gantry_ids = [row[0] for row in toll_gantry_result]
    
    # 获取收费车道ID列表
    toll_lane_result = conn.execute("SELECT id FROM TollLane").fetchall()
    toll_lane_ids = [row[0] for row in toll_lane_result]
    
    # 获取车辆车牌号列表
    vehicle_result = conn.execute("SELECT plateNum FROM Vehicle").fetchall()
    vehicle_plates = [row[0] for row in vehicle_result]
    
    # 获取收费单元ID列表
    toll_interval_result = conn.execute("SELECT id FROM TollInterval").fetchall()
    toll_interval_ids = [row[0] for row in toll_interval_result]
    
    conn.close()
    
    return medium_ids, toll_gantry_ids, toll_lane_ids, vehicle_plates, toll_interval_ids

# 获取已生成的交易流水ID列表
def get_transaction_ids():
    conn = get_db_connection()
    result = conn.execute("SELECT id FROM Transaction").fetchall()
    conn.close()
    return [row[0] for row in result]

# 获取已生成的路径列表
def get_paths():
    conn = get_db_connection()
    columns = ['id', 'passId', 'plateNum', 'plateColor', 'enTime', 'exTime', 'enTollLaneId', 'exTollLaneId', 'enTollStationId', 'exTollStationId']
    result = conn.execute(f"SELECT {','.join(columns)} FROM Path").fetchall()
    conn.close()
    
    paths = []
    for row in result:
        path = dict(zip(columns, row))
        paths.append(path)
    
    return paths

# 主函数
def main():
    print("开始生成交易流水、路径、拟合路径和拆分明细数据...")
    
    # 获取外部依赖ID
    medium_ids, toll_gantry_ids, toll_lane_ids, vehicle_plates, toll_interval_ids = get_external_ids()
    
    if not medium_ids:
        print("错误：缺少通行介质数据，请先运行 generate_vehicle_medium.py")
        return
    
    if not toll_lane_ids:
        print("错误：缺少收费车道数据，请先运行 generate_plaza_lane_gantry.py")
        return
    
    if not vehicle_plates:
        print("错误：缺少车辆数据，请先运行 generate_vehicle_medium.py")
        return
    
    # 生成交易流水数据
    transaction_count = DATA_VOLUME['transaction']
    transactions = generate_transaction_data(transaction_count, medium_ids, toll_gantry_ids, toll_lane_ids, vehicle_plates)
    save_transaction_data(transactions)
    print(f"成功生成 {transaction_count} 条交易流水数据")
    
    # 获取生成的交易流水ID
    transaction_ids = get_transaction_ids()
    
    # 生成车辆通行路径数据
    path_count = DATA_VOLUME['path']
    paths = generate_path_data(path_count, toll_lane_ids, vehicle_plates)
    save_path_data(paths)
    print(f"成功生成 {path_count} 条车辆通行路径数据")
    
    # 获取生成的路径
    generated_paths = get_paths()
    
    # 生成车辆通行拟合路径数据
    restore_path_count = DATA_VOLUME['restore_path']
    restore_paths = generate_restore_path_data(restore_path_count, generated_paths)
    save_restore_path_data(restore_paths)
    print(f"成功生成 {restore_path_count} 条车辆通行拟合路径数据")
    
    # 生成拆分明细数据
    split_detail_count = DATA_VOLUME['split_detail']
    split_details = generate_split_detail_data(split_detail_count, restore_paths, toll_interval_ids, transaction_ids)
    save_split_detail_data(split_details)
    print(f"成功生成 {len(split_details)} 条拆分明细数据")
    
    print("交易流水、路径、拟合路径和拆分明细数据生成完成！")

if __name__ == "__main__":
    main()
