// Debug utility to test API connection
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:9092';

export const debugAPI = async () => {
  console.log('=== API Debug Information ===');
  console.log('API Base URL:', API_BASE_URL);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('React App API Base URL:', process.env.REACT_APP_API_BASE_URL);
  
  try {
    // Test 1: Direct fetch
    console.log('\n--- Test 1: Direct fetch ---');
    const fetchResponse = await fetch(`${API_BASE_URL}/api/products`);
    console.log('Fetch Status:', fetchResponse.status);
    console.log('Fetch Headers:', Object.fromEntries(fetchResponse.headers.entries()));
    const fetchData = await fetchResponse.json();
    console.log('Fetch Data Length:', fetchData.length);
    
    // Test 2: Axios without interceptors
    console.log('\n--- Test 2: Axios without interceptors ---');
    const axiosResponse = await axios.get(`${API_BASE_URL}/api/products`);
    console.log('Axios Status:', axiosResponse.status);
    console.log('Axios Data Length:', axiosResponse.data.length);
    
    // Test 3: Using our API service
    console.log('\n--- Test 3: Using API service ---');
    const { productAPI } = await import('../services/api');
    const serviceResponse = await productAPI.getAllProducts();
    console.log('Service Status:', serviceResponse.status);
    console.log('Service Data Length:', serviceResponse.data.length);
    
    return {
      success: true,
      fetchData,
      axiosData: axiosResponse.data,
      serviceData: serviceResponse.data
    };
    
  } catch (error) {
    console.error('=== API Debug Error ===');
    console.error('Error:', error);
    console.error('Error Message:', error.message);
    console.error('Error Response:', error.response?.data);
    console.error('Error Status:', error.response?.status);
    console.error('Error Headers:', error.response?.headers);
    
    return {
      success: false,
      error: error.message,
      details: error.response?.data
    };
  }
};

// Make it available globally for browser console testing
window.debugAPI = debugAPI;