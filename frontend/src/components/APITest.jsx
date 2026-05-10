import React, { useState, useEffect } from 'react';
import { productAPI } from '../services/api';
import { debugAPI } from '../utils/debugAPI';

const APITest = () => {
  const [status, setStatus] = useState('Testing...');
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setStatus('Connecting to API...');
      console.log('Testing API connection to:', process.env.REACT_APP_API_BASE_URL || 'http://localhost:9092');
      
      // Run debug tests
      const debugResult = await debugAPI();
      setDebugInfo(debugResult);
      
      if (debugResult.success) {
        setProducts(debugResult.serviceData || []);
        setStatus(`Success! Found ${debugResult.serviceData?.length || 0} products`);
        setError(null);
      } else {
        setError(debugResult.error);
        setStatus('Failed to connect');
      }
    } catch (err) {
      console.error('API Test Error:', err);
      setError(err.message);
      setStatus('Failed to connect');
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-bold mb-2">API Connection Test</h3>
      <p className="mb-2">Status: {status}</p>
      
      {error && (
        <div className="text-red-600 mb-2">
          Error: {error}
        </div>
      )}
      
      <button 
        onClick={testConnection}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Test Again
      </button>
      
      {products.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold">First Product:</h4>
          <pre className="text-xs bg-white p-2 rounded mt-2 overflow-auto">
            {JSON.stringify(products[0], null, 2)}
          </pre>
        </div>
      )}
      
      {debugInfo && (
        <div className="mt-4">
          <h4 className="font-semibold">Debug Info:</h4>
          <pre className="text-xs bg-white p-2 rounded mt-2 overflow-auto max-h-40">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default APITest;