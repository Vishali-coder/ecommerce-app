// Simple test to verify API connection
import { productAPI } from './services/api';

const testAPI = async () => {
  try {
    console.log('Testing API connection...');
    const response = await productAPI.getAllProducts();
    console.log('API Response:', response.data);
    console.log('Number of products:', response.data.length);
    
    if (response.data.length > 0) {
      console.log('First product:', response.data[0]);
    }
    
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    console.error('Error details:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error;
  }
};

// Export for testing
window.testAPI = testAPI;

export default testAPI;