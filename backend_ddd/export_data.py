"""
导出 DuckDB 数据库中的数据，用于生成 schema.sql 的演示数据
"""
import duckdb
import os
import json

# 获取当前脚本所在目录
script_dir = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(script_dir, 'app.data.db')

def export_data():
    """导出数据库中的所有数据"""
    conn = duckdb.connect(DB_PATH)
    
    try:
        # 检查表是否存在
        tables = conn.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'main'
        """).fetchall()
        
        print(f"Found tables: {[t[0] for t in tables]}")
        
        data = {}
        
        # 导出 domains
        try:
            domains = conn.execute("SELECT * FROM domains").fetchall()
            columns = [desc[0] for desc in conn.execute("SELECT * FROM domains LIMIT 0").description]
            data['domains'] = [dict(zip(columns, row)) for row in domains]
            print(f"\nDomains ({len(domains)}):")
            for d in data['domains']:
                print(f"  {d}")
        except Exception as e:
            print(f"Error reading domains: {e}")
            data['domains'] = []
        
        # 导出 models
        try:
            models = conn.execute("SELECT * FROM models").fetchall()
            columns = [desc[0] for desc in conn.execute("SELECT * FROM models LIMIT 0").description]
            data['models'] = [dict(zip(columns, row)) for row in models]
            print(f"\nModels ({len(models)}):")
            for m in data['models']:
                print(f"  {m}")
        except Exception as e:
            print(f"Error reading models: {e}")
            data['models'] = []
        
        # 导出 properties
        try:
            properties = conn.execute("SELECT * FROM properties").fetchall()
            columns = [desc[0] for desc in conn.execute("SELECT * FROM properties LIMIT 0").description]
            data['properties'] = [dict(zip(columns, row)) for row in properties]
            print(f"\nProperties ({len(properties)}):")
            for p in data['properties'][:10]:  # 只显示前10个
                print(f"  {p}")
        except Exception as e:
            print(f"Error reading properties: {e}")
            data['properties'] = []
        
        # 导出 relations
        try:
            relations = conn.execute("SELECT * FROM relations").fetchall()
            columns = [desc[0] for desc in conn.execute("SELECT * FROM relations LIMIT 0").description]
            data['relations'] = [dict(zip(columns, row)) for row in relations]
            print(f"\nRelations ({len(relations)}):")
            for r in data['relations']:
                print(f"  {r}")
        except Exception as e:
            print(f"Error reading relations: {e}")
            data['relations'] = []
        
        # 导出 datasources
        try:
            datasources = conn.execute("SELECT * FROM datasources").fetchall()
            columns = [desc[0] for desc in conn.execute("SELECT * FROM datasources LIMIT 0").description]
            data['datasources'] = [dict(zip(columns, row)) for row in datasources]
            print(f"\nDatasources ({len(datasources)}):")
            for ds in data['datasources']:
                print(f"  {ds}")
        except Exception as e:
            print(f"Error reading datasources: {e}")
            data['datasources'] = []
        
        # 导出 etl_tasks
        try:
            etl_tasks = conn.execute("SELECT * FROM etl_tasks").fetchall()
            columns = [desc[0] for desc in conn.execute("SELECT * FROM etl_tasks LIMIT 0").description]
            data['etl_tasks'] = [dict(zip(columns, row)) for row in etl_tasks]
            print(f"\nETL Tasks ({len(etl_tasks)}):")
            for etl in data['etl_tasks']:
                print(f"  {etl}")
        except Exception as e:
            print(f"Error reading etl_tasks: {e}")
            data['etl_tasks'] = []
        
        # 保存为 JSON
        output_file = os.path.join(script_dir, 'exported_data.json')
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2, default=str)
        print(f"\n数据已导出到: {output_file}")
        
        return data
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return None
    finally:
        conn.close()

if __name__ == '__main__':
    export_data()
