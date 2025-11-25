// File: /apps/web/src/pages/UploadPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import FileUploader from '../components/FileUploader';

export default function UploadPage() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        // Navigate to dashboard with the received ID
        navigate(`/dashboard/${response.data.id}`);
      } else {
        setError(response.data.error || 'Upload failed');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(
        err.response?.data?.error || 
        err.message || 
        'Failed to upload file. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Paper sx={{ p: 4, mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          Upload Your Data
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Upload a CSV or JSON file to process and visualize your data. 
          The system will automatically analyze and generate insights from your data.
        </Typography>
      </Paper>

      <Box sx={{ mb: 3 }}>
        <FileUploader onFileSelect={handleFileSelect} disabled={uploading} />
      </Box>

      {selectedFile && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Selected File
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Chip label={selectedFile.name} color="primary" />
            <Chip label={formatFileSize(selectedFile.size)} variant="outlined" />
            <Chip 
              label={selectedFile.type || 'Unknown type'} 
              variant="outlined" 
            />
          </Box>
          
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleUpload}
              disabled={uploading}
              startIcon={uploading && <CircularProgress size={20} />}
            >
              {uploading ? 'Uploading...' : 'Process Data'}
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => {
                setSelectedFile(null);
                setError(null);
              }}
              disabled={uploading}
            >
              Clear
            </Button>
          </Box>
        </Paper>
      )}

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, backgroundColor: 'info.lighter' }}>
        <Typography variant="h6" gutterBottom>
          📋 Sample Data Format
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Your CSV/JSON file should contain structured data with headers. 
          Example fields: Date, Category, Product, Price, Quantity.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Download our sample dataset to see the expected format: 
          <Button size="small" sx={{ ml: 1 }}>
            sample-sales.csv
          </Button>
        </Typography>
      </Paper>
    </Box>
  );
}

