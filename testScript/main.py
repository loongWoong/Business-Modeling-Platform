# 主执行脚本，按顺序执行所有数据生成脚本
import os
import sys
import subprocess

# 获取当前脚本所在目录
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# 数据生成脚本执行顺序
SCRIPTS = [
    'generate_vehicle_medium.py',   # 生成车辆和通行介质数据
    'generate_toll_road_owner.py',  # 生成收费公路和路段业主数据
    'generate_section_station.py',  # 生成收费路段、收费单元、收费站数据
    'generate_plaza_lane_gantry.py',# 生成收费广场、收费车道、收费门架数据
    'generate_transaction_path.py'  # 生成交易流水、路径、拟合路径和拆分明细数据
]

def run_script(script_name):
    """运行指定的数据生成脚本"""
    script_path = os.path.join(SCRIPT_DIR, script_name)
    print(f"\n=== 开始执行 {script_name} ===")
    
    # 使用当前Python解释器执行脚本
    result = subprocess.run([sys.executable, script_path], 
                          cwd=SCRIPT_DIR,
                          capture_output=True,
                          text=True)
    
    print(f"=== {script_name} 执行结果 ===")
    print(f"退出码: {result.returncode}")
    print(f"标准输出:\n{result.stdout}")
    if result.stderr:
        print(f"标准错误:\n{result.stderr}")
    
    return result.returncode

def main():
    """主函数，按顺序执行所有数据生成脚本"""
    print("=== 开始生成模拟业务数据 ===")
    print(f"将生成数据到 {os.path.join(SCRIPT_DIR, 'business_data.db')}")
    
    for script in SCRIPTS:
        return_code = run_script(script)
        if return_code != 0:
            print(f"\n❌ 执行 {script} 失败，退出码: {return_code}")
            print("数据生成中断")
            return False
    
    print(f"\n✅ 所有数据生成脚本执行完成")
    print(f"生成的数据已保存到 {os.path.join(SCRIPT_DIR, 'business_data.db')}")
    return True

if __name__ == "__main__":
    main()
