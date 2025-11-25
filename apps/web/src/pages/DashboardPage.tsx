// File: /apps/web/src/pages/DashboardPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import TableRowsIcon from '@mui/icons-material/TableRows';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CategoryIcon from '@mui/icons-material/Category';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import StatCard from '../components/StatCard';
import DashboardGrid from '../components/DashboardGrid';

interface ProcessedData {
  summary: {
    totalRows: number;
    numericFields: Record<string, {
      avg: number;
      min: number;
      max: number;
      sum: number;
    }>;
  };
  groupedData: Record<string, any[]>;
  originalData: any[];
  filename?: string;
  uploadedAt?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function DashboardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<ProcessedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Invalid dashboard ID');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/status/${id}`);
        if (response.data.success) {
          setData(response.data);
        } else {
          setError(response.data.error || 'Failed to load data');
        }
      } catch (err: any) {
        console.error('Fetch error:', err);
        setError(
          err.response?.data?.error || 
          err.message || 
          'Failed to load dashboard data'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleExport = async (format: 'csv' | 'json') => {
    if (!id) return;
    
    try {
      const response = await axios.get(`/api/export/${id}?format=${format}`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `data_export.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export data');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'No data available'}
        </Alert>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/')}>
          Back to Upload
        </Button>
      </Box>
    );
  }

  const { summary, groupedData, originalData } = data;
  const numericFieldNames = Object.keys(summary.numericFields);
  const firstNumericField = numericFieldNames[0];
  const stats = summary.numericFields[firstNumericField];

  // Prepare chart data
  const groupedChartData = Object.entries(groupedData).map(([key, items]) => {
    const numericValues = firstNumericField
      ? items.map((item: any) => item[firstNumericField]).filter((v: any) => typeof v === 'number')
      : [];
    
    return {
      name: key,
      value: numericValues.length > 0 
        ? numericValues.reduce((acc: number, val: number) => acc + val, 0) 
        : items.length,
      count: items.length,
    };
  });

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              Data Dashboard
            </Typography>
            {data.filename && (
              <Typography variant="body2" color="text.secondary">
                File: {data.filename}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => handleExport('csv')}
            >
              Export CSV
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => handleExport('json')}
            >
              Export JSON
            </Button>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/')}
            >
              New Upload
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Summary Statistics */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Summary Statistics
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Rows"
            value={summary.totalRows}
            color="#1976d2"
            icon={<TableRowsIcon />}
          />
        </Grid>
        {stats && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title={`Average ${firstNumericField}`}
                value={stats.avg.toFixed(2)}
                color="#2e7d32"
                icon={<TrendingUpIcon />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title={`Max ${firstNumericField}`}
                value={stats.max.toFixed(2)}
                color="#ed6c02"
                icon={<AttachMoneyIcon />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title={`Min ${firstNumericField}`}
                value={stats.min.toFixed(2)}
                color="#9c27b0"
                icon={<CategoryIcon />}
              />
            </Grid>
          </>
        )}
      </Grid>

      {/* Charts */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Data Visualizations
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Bar Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Distribution by Category
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={groupedChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#1976d2" name={firstNumericField || 'Value'} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Line Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Trend Analysis
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={groupedChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#2e7d32" 
                  strokeWidth={2}
                  name="Count"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Pie Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Proportional Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={groupedChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {groupedChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Additional Stats */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Numeric Field Statistics
            </Typography>
            <Box sx={{ mt: 2 }}>
              {Object.entries(summary.numericFields).map(([field, fieldStats]) => (
                <Box key={field} sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    {field}
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Sum:</Typography>
                      <Typography variant="body2">{fieldStats.sum.toFixed(2)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Avg:</Typography>
                      <Typography variant="body2">{fieldStats.avg.toFixed(2)}</Typography>
                    </Grid>
                  </Grid>
                  <Divider sx={{ mt: 1 }} />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Data Table */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Data Table
      </Typography>
      <DashboardGrid data={originalData} />
    </Box>
  );
}

