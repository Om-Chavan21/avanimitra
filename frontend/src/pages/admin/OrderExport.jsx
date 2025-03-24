import { useState } from 'react';
import {
  Container, Typography, Box, Paper, Grid, TextField, Button,
  CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem,
  FormHelperText
} from '@mui/material';
import DatePicker from '@mui/lab/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import api from '../../utils/api';

const OrderExport = () => {
  const [exportData, setExportData] = useState({
    format: 'excel',
    start_date: null,
    end_date: null,
    email: '',
    include_all_fields: true,
    status_filter: 'all'
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setExportData({
      ...exportData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleDateChange = (name) => (date) => {
    setExportData({
      ...exportData,
      [name]: date
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      
      const token = localStorage.getItem('token');
      await api.post('/admin/export-orders', exportData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess(`Orders export has been initiated! An email will be sent to ${exportData.email} with the export file.`);
    } catch (err) {
      setError(`Failed to export orders: ${err.response?.data?.detail || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="md" className="py-8">
        <Typography variant="h4" component="h1" gutterBottom>
          Export Orders
        </Typography>
        
        <Typography variant="body1" paragraph>
          Generate and export order data to Excel or Google Sheets. The exported file will be sent to your email.
        </Typography>
        
        {error && (
          <Alert severity="error" className="mb-4" onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" className="mb-4" onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}
        
        <Paper className="p-6">
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Export Format</InputLabel>
                  <Select
                    name="format"
                    value={exportData.format}
                    onChange={handleChange}
                    label="Export Format"
                  >
                    <MenuItem value="excel">Excel (.xlsx)</MenuItem>
                    <MenuItem value="google_sheets">Google Sheets</MenuItem>
                    <MenuItem value="csv">CSV</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Filter by Status</InputLabel>
                  <Select
                    name="status_filter"
                    value={exportData.status_filter}
                    onChange={handleChange}
                    label="Filter by Status"
                  >
                    <MenuItem value="all">All Orders</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="processing">Processing</MenuItem>
                    <MenuItem value="shipped">Shipped</MenuItem>
                    <MenuItem value="delivered">Delivered</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Start Date"
                  value={exportData.start_date}
                  onChange={handleDateChange('start_date')}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="End Date"
                  value={exportData.end_date}
                  onChange={handleDateChange('end_date')}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  minDate={exportData.start_date}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Email Address"
                  name="email"
                  value={exportData.email}
                  onChange={handleChange}
                  fullWidth
                  required
                  type="email"
                  helperText="The export file will be sent to this email address"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={exportData.include_all_fields}
                        onChange={handleChange}
                        name="include_all_fields"
                      />
                    }
                    label="Include all order fields"
                  />
                  <FormHelperText>
                    If unchecked, only essential fields will be included in the export
                  </FormHelperText>
                </FormControl>
              </Grid>
            </Grid>
            
            <Box className="mt-6">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={submitting}
              >
                {submitting ? <CircularProgress size={24} /> : 'Export Orders'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
};

export default OrderExport;