import duckdb
import os

# 数据库路径
DB_PATH = 'c:\\Users\\leon\\Downloads\\trae-build-demo\\backend\\app.data.db'

# 字段名中文翻译映射
def get_field_translation():
    return {
        # 通用字段
        'id': 'ID',
        'name': '名称',
        'type': '类型',
        'code': '编码',
        'status': '状态',
        'required': '必填',
        'description': '描述',
        'modelId': '模型ID',
        'isPrimaryKey': '是否主键',
        'isForeignKey': '是否外键',
        'defaultValue': '默认值',
        'constraints': '约束',
        'sensitivityLevel': '敏感级别',
        'maskRule': '掩码规则',
        'physicalColumn': '物理列',
        'foreignKeyTable': '外键表',
        'foreignKeyColumn': '外键列',
        'creator': '创建者',
        'updatedAt': '更新时间',
        'domainId': '域ID',
        
        # Vehicle表字段
        'plateNum': '车牌号',
        'plateColor': '车牌颜色',
        'userId': '用户ID',
        'ownerName': '车主姓名',
        'ownerIdType': '车主证件类型',
        'ownerIdNum': '车主证件号码',
        'registeredType': '注册类型',
        'channelId': '渠道ID',
        'registeredTime': '注册时间',
        'ownerTel': '车主电话',
        'address': '地址',
        'contact': '联系人',
        'vehicleType': '车辆类型',
        'vehicleModel': '车辆型号',
        'useCharacter': '使用性质',
        'VIN': '车辆识别码',
        'engineNum': '发动机号',
        'registerDate': '注册日期',
        'issueDate': '发证日期',
        'fileNum': '档案编号',
        'approvedCount': '核定载人数',
        'totalMass': '总质量',
        'maintenanceMass': '整备质量',
        'permittedWeight': '核定载质量',
        'outsideDimensions': '外廓尺寸',
        'permittedTowWeight': '核定牵引质量',
        'testRecord': '检验记录',
        'wheelCount': '轮数',
        'axleCount': '轴数',
        'axleDistance': '轴距',
        'axlsType': '轴型',
        'obuId': 'OBU设备ID',
        'accountNumber': '账号',
        'vehicleSign': '车辆标志',
        'transportIdNum': '运输证号',
        'licenseIdNum': '行驶证号',
        'vehicle_id': '车辆ID',
        'license_plate': '车牌',
        'owner_name': '车主',
        'owner_id_card': '车主身份证',
        'vehicle_color': '车辆颜色',
        'register_date': '注册日期',
        'vehicle_status': '车辆状态',
        
        # Medium表字段
        'enableTime': '启用时间',
        'expireTime': '过期时间',
        
        # Transaction表字段
        'passId': '通行ID',
        'mediumId': '介质ID',
        'mediaType': '介质类型',
        'exitFeeType': '出口费类型',
        'provinceId': '省份ID',
        'transtime': '交易时间',
        'identifyId': '识别ID',
        'identifyHex': '识别十六进制',
        'payFee': '支付金额',
        'fee': '费用',
        'discountFee': '优惠金额',
        
        # TollRoad表字段
        'roadNum': '公路编号',
        'level': '等级',
        'startSite': '起点',
        'startStakeNum': '起点桩号',
        'startLat': '起点纬度',
        'startLng': '起点经度',
        'startStationId': '起点站ID',
        'endSite': '终点',
        'endStakeNum': '终点桩号',
        'endLat': '终点纬度',
        'endLng': '终点经度',
        'endStationId': '终点站ID',
        'road_id': '公路ID',
        'road_name': '公路名称',
        'owner_id': '所属业主',
        'road_level': '公路等级',
        'start_mileage': '起始里程',
        'end_mileage': '结束里程',
        
        # SectionOwner表字段
        'num': '编号',
        'tel': '电话',
        'bank': '银行',
        'bankAddr': '银行地址',
        'bankAccount': '银行账号',
        'taxpayerCode': '纳税人识别号',
        'creditCode': '统一社会信用代码',
        'contact_info': '联系方式',
        
        # Section表字段
        'sectionId': '路段ID',
        'reservedNum': '预留编号',
        'length': '长度',
        'online': '是否在线',
        'tax': '是否征税',
        'taxRate': '税率',
        'sectionOwnerId': '路段业主ID',
        'chargeType': '收费类型',
        'tollRoads': '收费公路',
        'builtTime': '建成时间',
        'startTime': '开始时间',
        'endTime': '结束时间',
        'nextTaxRate': '下一税率',
        'nextRateDate': '下一税率生效日期',
        
        # TollStation表字段
        'tollPlazaCount': '收费广场数量',
        'stationHex': '站编码',
        'lineType': '线路类型',
        'operators': '运营商',
        'dataMergePoint': '数据融合点',
        'imei': 'IMEI',
        'ip': 'IP地址',
        'snmpVersion': 'SNMP版本',
        'snmpPort': 'SNMP端口',
        'community': '社区',
        'securityName': '安全名称',
        'securityLevel': '安全级别',
        'authentication': '认证方式',
        'authKey': '认证密钥',
        'encryption': '加密方式',
        'secretKey': '密钥',
        'serverManuID': '服务器厂商ID',
        'serversysName': '服务器系统名称',
        'serversysVer': '服务器系统版本',
        'serverDateVer': '服务器数据版本',
        'realType': '实际类型',
        'regionName': '区域名称',
        'countryName': '国家名称',
        'regionalismCode': '行政区划代码',
        'agencyGantryIds': '代理门架ID',
        'station_id': '收费站ID',
        'station_name': '收费站名称',
        'road_id': '公路ID',
        'station_type': '收费站类型',
        
        # TollPlaza表字段
        'tollStationId': '收费站ID',
        'tidalTime': '潮汐时间',
        'laneHex': '车道编码',
        'rsuManUID': 'RSU厂商UID',
        'rsuModel': 'RSU型号',
        'rsuID': 'RSU ID',
        'entryExitType': '出入口类型',
        'railingPos': '栏杆位置',
        'ifContainLimitWeight': '是否含限重',
        'VPLRManUID': 'VPLR厂商UID',
        
        # TollGantry表字段
        'tollIntervalId': '收费单元ID',
        'gantrySign': '门架标志',
        'tollIntervals': '收费单元',
        'lat': '纬度',
        'lng': '经度',
        'pileNumber': '桩号',
        'etcGantryHex': 'ETC门架编码',
        'VPLRUID': 'VPLR UID',
        'VPLRModel': 'VPLR型号',
        'VPLRID': 'VPLR ID',
        'HDVUID': 'HDV UID',
        'HDVModel': 'HDV型号',
        'HDVID': 'HDV ID',
        'controllerUID': '控制器UID',
        'controllerModel': '控制器型号',
        'controllerID': '控制器ID',
        'controllerSysVer': '控制器系统版本',
        'serverUID': '服务器UID',
        'serverModel': '服务器型号',
        'serverID': '服务器ID',
        'serverSysVer': '服务器系统版本',
        'serverDBVer': '服务器数据库版本',
        'vehDetectorUID': '车辆检测器UID',
        'vehDetectorModel': '车辆检测器型号',
        'vehDetectorID': '车辆检测器ID',
        'weatherDetectorUID': '气象检测器UID',
        'weatherDetectorModel': '气象检测器型号',
        'weatherDetectorID': '气象检测器ID',
        'classDetectorUID': '分类检测器UID',
        'classDetectorModel': '分类检测器型号',
        'classDetectorID': '分类检测器ID',
        'loadDetectionUID': '负载检测UID',
        'loadDetectionModel': '负载检测型号',
        'loadDetectionID': '负载检测ID',
        'tempControllerUID': '温度控制器UID',
        'tempControllerModel': '温度控制器型号',
        'tempControllerID': '温度控制器ID',
        'powerControllerUID': '电源控制器UID',
        'powerControllerModel': '电源控制器型号',
        'powerControllerID': '电源控制器ID',
        'safeEquipUID': '安全设备UID',
        'safeEquipModel': '安全设备型号',
        'safeEquipID': '安全设备ID',
        'gantryType': '门架类型',
        'laneCount': '车道数量',
        'reEtcGantryHex': '反向ETC门架编码',
        'gantry_id': '门架ID',
        'gantry_name': '门架名称',
        'gantry_location': '门架位置',
        'gantry_status': '门架状态',
        'boundaryType': '边界类型',
        
        # TollInterval表字段
        'direction': '方向',
        'tollRoads': '收费公路',
        'provinceType': '省份类型',
        'beginTime': '开始时间',
        'verticalSectionType': '纵断面类型',
        'toll_unit_id': '收费单元ID',
        'toll_unit_name': '收费单元名称',
        'toll_type': '收费类型',
        
        # TollLane表字段
        'tollPlazaId': '收费广场ID',
        'tidalTime': '潮汐时间',
        'lane_id': '车道ID',
        'lane_number': '车道编号',
        'lane_type': '车道类型',
        'lane_status': '车道状态',
        
        # Path表字段
        'passId': '通行ID',
        'enTime': '进入时间',
        'exTime': '离开时间',
        'enTollLaneId': '进入车道ID',
        'exTollLaneId': '离开车道ID',
        'enTollStationId': '进入站ID',
        'exTollStationId': '离开站ID',
        
        # RestorePath表字段
        'passId': '通行ID',
        'enTime': '进入时间',
        'exTime': '离开时间',
        'enTollLaneId': '进入车道ID',
        'exTollLaneId': '离开车道ID',
        'enTollStationId': '进入站ID',
        'exTollStationId': '离开站ID',
        
        # SplitDetail表字段
        'transactionId': '交易ID',
        'intervalId': '区间ID',
        'tollIntervalFee': '区间费用',
        'tollIntervalPayFee': '区间支付费用',
        'tollIntervalDiscountFee': '区间优惠费用',
        
        # 其他
        'marker_point': '标记点',
        'transaction_record': '交易记录',
        'etc_gantry': 'ETC门架',
        'toll_unit': '收费单元',
        'fitted_path': '拟合路径',
        'lane': '车道',
        'vehicle_path': '车辆路径',
        'road_owner': '公路业主',
        'toll_station': '收费站',
        'split_detail': '拆分明细'
    }

# 获取字段的中文翻译
def translate_field(code):
    translations = get_field_translation()
    if code in translations:
        return translations[code]
    
    # 尝试将驼峰命名转换为中文
    # 例如: rsuManUID -> RSU厂商UID
    import re
    # 将驼峰命名转换为空格分隔的单词
    words = re.sub(r'([a-z])([A-Z])', r'\1 \2', code)
    # 首字母大写
    words = words.title()
    # 替换特殊缩写
    words = words.replace('Rsu', 'RSU')
    words = words.replace('Vplr', 'VPLR')
    words = words.replace('Hdv', 'HDV')
    words = words.replace('Etc', 'ETC')
    words = words.replace('Snmp', 'SNMP')
    
    return words

# 主函数
def main():
    print("=== 开始更新properties表的字段名称 ===")
    
    # 连接数据库
    conn = duckdb.connect(DB_PATH)
    
    # 开始事务
    conn.execute('BEGIN TRANSACTION')
    
    try:
        # 获取所有properties记录
        properties_df = conn.execute('SELECT id, code FROM properties').fetchdf()
        print(f"   共需更新 {len(properties_df)} 条记录")
        
        # 更新每条记录的name字段
        updated_count = 0
        for _, row in properties_df.iterrows():
            prop_id = row['id']
            code = row['code']
            
            # 获取中文翻译
            chinese_name = translate_field(code)
            
            # 更新name字段
            conn.execute('UPDATE properties SET name = ? WHERE id = ?', [chinese_name, prop_id])
            updated_count += 1
        
        # 提交事务
        conn.execute('COMMIT')
        print(f"   成功更新 {updated_count} 条记录")
        
        # 验证更新结果
        sample_df = conn.execute('SELECT id, code, name FROM properties LIMIT 10').fetchdf()
        print("\n   更新后示例数据:")
        print(sample_df)
        
    except Exception as e:
        # 回滚事务
        conn.execute('ROLLBACK')
        print(f"   ❌ 更新失败，已回滚事务: {e}")
    finally:
        conn.close()

if __name__ == '__main__':
    main()