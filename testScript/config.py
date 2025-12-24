# 配置文件
import duckdb
import os

# 数据库连接配置
DB_PATH = os.path.join(os.path.dirname(__file__), 'business_data.db')

# 生成数据量配置
DATA_VOLUME = {
    'vehicle': 1000,
    'medium': 2000,
    'toll_road': 50,
    'section_owner': 30,
    'section': 100,
    'toll_station': 200,
    'toll_plaza': 300,
    'toll_lane': 500,
    'toll_interval': 400,
    'toll_gantry': 600,
    'transaction': 5000,
    'path': 3000,
    'restore_path': 3000,
    'split_detail': 10000
}

# 获取数据库连接
def get_db_connection():
    return duckdb.connect(DB_PATH)

# 创建所有表
def create_tables():
    conn = get_db_connection()
    
    # 创建车辆表
    conn.execute('''
    CREATE TABLE IF NOT EXISTS Vehicle (
        id STRING PRIMARY KEY,
        plateNum STRING,
        plateColor INTEGER,
        type INTEGER,
        userId STRING,
        ownerName STRING,
        ownerIdType STRING,
        ownerIdNum STRING,
        registeredType INTEGER,
        channelId STRING,
        registeredTime STRING,
        ownerTel STRING,
        address STRING,
        contact STRING,
        vehicleType STRING,
        vehicleModel STRING,
        useCharacter STRING,
        VIN STRING,
        engineNum STRING,
        registerDate STRING,
        issueDate STRING,
        fileNum STRING,
        approvedCount INTEGER,
        totalMass INTEGER,
        maintenanceMass INTEGER,
        permittedWeight INTEGER,
        outsideDimensions STRING,
        permittedTowWeight INTEGER,
        testRecord STRING,
        wheelCount INTEGER,
        axleCount INTEGER,
        axleDistance INTEGER,
        axlsType STRING,
        obuId STRING,
        accountNumber STRING,
        vehicleSign INTEGER,
        transportIdNum STRING,
        licenseIdNum STRING
    )
    ''')
    
    # 创建通行介质表
    conn.execute('''
    CREATE TABLE IF NOT EXISTS Medium (
        id STRING PRIMARY KEY,
        type STRING,
        channelId STRING,
        plateNum STRING,
        plateColor INTEGER,
        status INTEGER,
        enableTime DATE,
        expireTime DATE
    )
    ''')
    
    # 创建交易流水表
    conn.execute('''
    CREATE TABLE IF NOT EXISTS Transaction (
        id STRING PRIMARY KEY,
        passId STRING,
        mediumId STRING,
        mediaType INTEGER,
        exitFeeType INTEGER,
        provinceId INTEGER,
        transtime DATE,
        plateNum STRING,
        plateColor INTEGER,
        identifyId STRING,
        identifyHex STRING,
        payFee BIGINT,
        fee BIGINT,
        discountFee BIGINT
    )
    ''')
    
    # 创建收费公路表
    conn.execute('''
    CREATE TABLE IF NOT EXISTS TollRoad (
        id STRING PRIMARY KEY,
        roadNum STRING,
        provinceId STRING,
        name STRING,
        level INTEGER,
        startSite STRING,
        startStakeNum STRING,
        startLat STRING,
        startLng STRING,
        startStationId STRING,
        endSite STRING,
        endStakeNum STRING,
        endLat STRING,
        endLng STRING,
        endStationId STRING
    )
    ''')
    
    # 创建路段业主表
    conn.execute('''
    CREATE TABLE IF NOT EXISTS SectionOwner (
        id STRING PRIMARY KEY,
        provinceId STRING,
        type STRING,
        num STRING,
        name STRING,
        contact STRING,
        tel STRING,
        address STRING,
        bank STRING,
        bankAddr STRING,
        bankAccount STRING,
        taxpayerCode STRING,
        creditCode STRING
    )
    ''')
    
    # 创建收费路段表
    conn.execute('''
    CREATE TABLE IF NOT EXISTS Section (
        id STRING PRIMARY KEY,
        tollRoadId STRING,
        num STRING,
        reservedNum STRING,
        name STRING,
        type INTEGER,
        length INTEGER,
        online INTEGER,
        startLat STRING,
        startLng STRING,
        startStakeNum STRING,
        endStakeNum STRING,
        endLat STRING,
        endLng STRING,
        tax INTEGER,
        taxRate STRING,
        sectionOwnerId STRING,
        chargeType INTEGER,
        tollRoads STRING,
        builtTime STRING,
        startTime STRING,
        endTime STRING,
        nextTaxRate STRING,
        nextRateDate STRING
    )
    ''')
    
    # 创建收费站表
    conn.execute('''
    CREATE TABLE IF NOT EXISTS TollStation (
        id STRING PRIMARY KEY,
        sectionId STRING,
        num STRING,
        reservedNum STRING,
        name STRING,
        tollPlazaCount INTEGER,
        stationHex STRING,
        lineType STRING,
        operators STRING,
        dataMergePoint STRING,
        imei STRING,
        ip STRING,
        snmpVersion STRING,
        snmpPort INTEGER,
        community STRING,
        securityName STRING,
        securityLevel STRING,
        authentication STRING,
        authKey STRING,
        encryption STRING,
        secretKey STRING,
        serverManuID STRING,
        serversysName STRING,
        serversysVer STRING,
        serverDateVer STRING,
        type INTEGER,
        status INTEGER,
        realType INTEGER,
        regionName STRING,
        countryName STRING,
        regionalismCode STRING,
        agencyGantryIds STRING
    )
    ''')
    
    # 创建收费广场表
    conn.execute('''
    CREATE TABLE IF NOT EXISTS TollPlaza (
        id STRING PRIMARY KEY,
        tollStationId STRING,
        type INTEGER,
        num STRING,
        reservedNum STRING,
        tidalTime STRING,
        startTime STRING,
        endTime STRING,
        status INTEGER,
        laneHex STRING,
        rsuManUID STRING,
        rsuModel STRING,
        rsuID STRING,
        entryExitType INTEGER,
        railingPos INTEGER,
        ifContainLimitWeight INTEGER,
        VPLRManUID STRING
    )
    ''')
    
    # 创建收费门架表
    conn.execute('''
    CREATE TABLE IF NOT EXISTS TollGantry (
        id STRING PRIMARY KEY,
        tollIntervalId STRING,
        num STRING,
        reservedNum STRING,
        type INTEGER,
        boundaryType INTEGER,
        gantrySign STRING,
        tollIntervals STRING,
        lat STRING,
        lng STRING,
        pileNumber STRING,
        status INTEGER,
        startTime STRING,
        endTime STRING,
        etcGantryHex STRING,
        rsuManUID STRING,
        rsuModel STRING,
        rsuID STRING,
        VPLRUID STRING,
        VPLRModel STRING,
        VPLRID STRING,
        HDVUID STRING,
        HDVModel STRING,
        HDVID STRING,
        controllerUID STRING,
        controllerModel STRING,
        controllerID STRING,
        controllerSysVer STRING,
        serverUID STRING,
        serverModel STRING,
        serverID STRING,
        serverSysVer STRING,
        serverDBVer STRING,
        vehDetectorUID STRING,
        vehDetectorModel STRING,
        vehDetectorID STRING,
        weatherDetectorUID STRING,
        weatherDetectorModel STRING,
        weatherDetectorID STRING,
        classDetectorUID STRING,
        classDetectorModel STRING,
        classDetectorID STRING,
        loadDetectionUID STRING,
        loadDetectionModel STRING,
        loadDetectionID STRING,
        tempControllerUID STRING,
        tempControllerModel STRING,
        tempControllerID STRING,
        powerControllerUID STRING,
        powerControllerModel STRING,
        powerControllerID STRING,
        safeEquipUID STRING,
        safeEquipModel STRING,
        safeEquipID STRING,
        lineType STRING,
        operators STRING,
        dataMergePoint STRING,
        imei STRING,
        ip STRING,
        snmpVersion STRING,
        snmpPort INTEGER,
        community STRING,
        securityName STRING,
        securityLevel STRING,
        authentication STRING,
        authKey STRING,
        encryption STRING,
        secretKey STRING,
        gantryType INTEGER,
        laneCount STRING,
        reEtcGantryHex STRING,
        agencyGantryIds STRING
    )
    ''')
    
    # 创建收费单元表
    conn.execute('''
    CREATE TABLE IF NOT EXISTS TollInterval (
        id STRING PRIMARY KEY,
        sectionId STRING,
        num STRING,
        direction INTEGER,
        reservedNum STRING,
        name STRING,
        type INTEGER,
        length INTEGER,
        startLat STRING,
        startLng STRING,
        startStakeNum STRING,
        endStakeNum STRING,
        endLat STRING,
        endLng STRING,
        tollRoads STRING,
        endTime STRING,
        provinceType INTEGER,
        beginTime STRING,
        verticalSectionType INTEGER
    )
    ''')
    
    # 创建收费车道表
    conn.execute('''
    CREATE TABLE IF NOT EXISTS TollLane (
        id STRING PRIMARY KEY,
        tollPlazaId STRING,
        num STRING,
        reservedNum STRING,
        type INTEGER,
        tidalTime STRING,
        startTime STRING,
        endTime STRING,
        status INTEGER,
        laneHex STRING,
        rsuManUID STRING,
        rsuModel STRING,
        rsuID STRING,
        entryExitType INTEGER,
        railingPos INTEGER,
        ifContainLimitWeight INTEGER,
        VPLRManUID STRING
    )
    ''')
    
    # 创建车辆通行路径表
    conn.execute('''
    CREATE TABLE IF NOT EXISTS Path (
        id STRING PRIMARY KEY,
        passId STRING,
        plateNum STRING,
        plateColor INTEGER,
        enTime DATE,
        exTime DATE,
        enTollLaneId STRING,
        exTollLaneId STRING,
        enTollStationId STRING,
        exTollStationId STRING
    )
    ''')
    
    # 创建车辆通行拟合路径表
    conn.execute('''
    CREATE TABLE IF NOT EXISTS RestorePath (
        passId STRING PRIMARY KEY,
        plateNum STRING,
        plateColor INTEGER,
        enTime DATE,
        exTime DATE,
        enTollLaneId STRING,
        exTollLaneId STRING,
        enTollStationId STRING,
        exTollStationId STRING
    )
    ''')
    
    # 创建拆分明细表
    conn.execute('''
    CREATE TABLE IF NOT EXISTS SplitDetail (
        passId STRING,
        transactionId STRING,
        intervalId STRING,
        tollIntervalFee STRING,
        tollIntervalPayFee STRING,
        tollIntervalDiscountFee STRING,
        PRIMARY KEY (passId, intervalId)
    )
    ''')
    
    conn.close()
    print("所有表创建完成")
