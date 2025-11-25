// File: /apps/web/src/components/DashboardGrid.tsx
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { Paper } from '@mui/material';

interface DashboardGridProps {
  data: any[];
}

export default function DashboardGrid({ data }: DashboardGridProps) {
  if (!data || data.length === 0) {
    return null;
  }

  // Generate columns from the first data row
  const columns: GridColDef[] = Object.keys(data[0]).map((key) => ({
    field: key,
    headerName: key.charAt(0).toUpperCase() + key.slice(1),
    flex: 1,
    minWidth: 150,
    sortable: true,
    filterable: true,
  }));

  // Add ID field for DataGrid (required)
  const rows = data.map((row, index) => ({
    id: index,
    ...row,
  }));

  return (
    <Paper sx={{ width: '100%', height: 600 }}>
      <DataGrid
        rows={rows}
        columns={columns}
        slots={{
          toolbar: GridToolbar,
        }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 500 },
          },
        }}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 25, page: 0 },
          },
        }}
        pageSizeOptions={[10, 25, 50, 100]}
        disableRowSelectionOnClick
        sx={{
          '& .MuiDataGrid-toolbarContainer': {
            padding: 2,
            gap: 2,
          },
          '& .MuiDataGrid-cell': {
            fontSize: '0.875rem',
          },
        }}
      />
    </Paper>
  );
}

