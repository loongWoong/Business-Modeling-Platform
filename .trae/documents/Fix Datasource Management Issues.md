## Issue Analysis

### 1. Datasource List Should Not Include Table Names
- **Problem**: The DomainWorkbench's datasource list displays a "表名" (table name) column, which is inappropriate for a datasource list that should only show connection-level information.
- **Location**: `frontend/src/pages/DomainWorkbench/modules/DatasourceManager.jsx`

### 2. Model Detail Related Tables Should Use Separate Table
- **Problem**: Currently, when associating a table with a model, it creates a new entry in the `datasources` table, mixing base datasource connections with model-table associations.
- **Location**: `frontend/src/pages/ModelDetail/modules/DatasourceManager.jsx`
- **Root Cause**: The code reuses the datasource API to store model-table associations, leading to structural confusion.

## Solution Plan

### 1. Remove Table Name Column from Datasource List
- **File**: `frontend/src/pages/DomainWorkbench/modules/DatasourceManager.jsx`
- **Changes**: 
  - Remove line 50 (table header for "表名")
  - Remove line 71 (table data for `datasource.tableName`)
  - Adjust column spans accordingly

### 2. Create Separate Table for Model-Table Associations
- **Backend Changes**:
  1. Create `model_table_associations` table with fields:
     - `id`: Primary key
     - `model_id`: Foreign key to models
     - `datasource_id`: Foreign key to datasources
     - `table_name`: Name of the associated table
     - `status`: Association status
     - `created_at`: Creation time
     - `updated_at`: Update time
  2. Add API routes in `backend/routes/model_table_association_routes.py`:
     - GET `/api/model-table-associations`: List associations
     - POST `/api/model-table-associations`: Create association
     - DELETE `/api/model-table-associations/:id`: Delete association
  3. Update `app.py` to register new blueprint

- **Frontend Changes**:
  1. Update `ModelDetail.jsx` to fetch and manage model-table associations
  2. Modify `DatasourceManager.jsx` in ModelDetail to use new API endpoints
  3. Change table association logic to create entries in the new table instead of the datasources table

## Implementation Steps

1. **Backend**: Create database table and API routes
2. **Frontend**: Update DomainWorkbench datasource list to remove table name column
3. **Frontend**: Update ModelDetail to use new model-table association API
4. **Testing**: Verify both features work correctly