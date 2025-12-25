import subprocess
import sys
import os
import time


def start_backend():
    """启动后端Flask服务"""
    backend_dir = os.path.join(os.getcwd(), 'backend')
    print("正在启动应用服务...")
    return subprocess.Popen(
        [sys.executable, 'app.py'],
        cwd=backend_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True
    )


def print_process_output(process, name):
    """打印进程输出"""
    if process.stdout:
        line = process.stdout.readline()
        if line:
            print(f"[{name}] {line.strip()}")


def main():
    """主函数，启动应用服务"""
    print("=== 启动应用 ===")
    
    # 启动后端服务
    backend_process = start_backend()
    
    # 等待服务启动
    time.sleep(3)
    
    print("\n=== 服务已启动 ===")
    print("应用访问地址: http://localhost:5000")
    print("\n按 Ctrl+C 停止服务")
    
    try:
        # 等待用户中断，同时打印输出
        while True:
            print_process_output(backend_process, "应用")
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n=== 正在停止服务 ===")
        
        # 停止后端服务
        backend_process.terminate()
        backend_process.wait(timeout=5)
        print("应用服务已停止")
        
        print("=== 所有服务已停止 ===")


if __name__ == '__main__':
    main()
