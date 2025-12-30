"use client";

import React, { useState, useEffect } from 'react';
import floatChatAPI from '../../utils/floatChatAPI';

const APITestPanel = () => {
  const [apiStatus, setApiStatus] = useState('checking');
  const [testQuery, setTestQuery] = useState('What is the average temperature in the ocean?');
  const [testResponse, setTestResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkAPIHealth();
  }, []);

  const checkAPIHealth = async () => {
    setApiStatus('checking');
    const healthy = await floatChatAPI.checkHealth();
    setApiStatus(healthy ? 'healthy' : 'offline');
  };

  const runTestQuery = async () => {
    if (!testQuery.trim()) return;
    
    setIsLoading(true);
    setTestResponse(null);
    
    try {
      const response = await floatChatAPI.sendChatQuery(testQuery, true);
      setTestResponse(response);
    } catch (error) {
      setTestResponse({
        error: true,
        answer: `Test failed: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (apiStatus) {
      case 'healthy': return '#28a745';
      case 'offline': return '#dc3545';
      default: return '#ffc107';
    }
  };

  const getStatusText = () => {
    switch (apiStatus) {
      case 'healthy': return 'API Connected ✅';
      case 'offline': return 'API Offline ❌';
      default: return 'Checking... ⏳';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      width: '300px',
      backgroundColor: '#1a1a1a',
      border: '1px solid #333',
      borderRadius: '8px',
      padding: '16px',
      zIndex: 1000,
      color: '#fff',
      fontSize: '14px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <h3 style={{ margin: 0, fontSize: '16px' }}>API Test Panel</h3>
        <button
          onClick={checkAPIHealth}
          style={{
            background: 'none',
            border: '1px solid #555',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Refresh
        </button>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px'
      }}>
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: getStatusColor()
          }}
        />
        <span style={{ color: getStatusColor() }}>
          {getStatusText()}
        </span>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '4px', color: '#ccc' }}>
          Test Query:
        </label>
        <textarea
          value={testQuery}
          onChange={(e) => setTestQuery(e.target.value)}
          style={{
            width: '100%',
            minHeight: '60px',
            backgroundColor: '#2a2a2a',
            border: '1px solid #555',
            borderRadius: '4px',
            padding: '8px',
            color: '#fff',
            fontSize: '12px',
            resize: 'vertical'
          }}
          placeholder="Enter your test query..."
        />
      </div>

      <button
        onClick={runTestQuery}
        disabled={isLoading || apiStatus !== 'healthy'}
        style={{
          width: '100%',
          padding: '8px',
          backgroundColor: apiStatus === 'healthy' ? '#007bff' : '#555',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: apiStatus === 'healthy' ? 'pointer' : 'not-allowed',
          marginBottom: '12px'
        }}
      >
        {isLoading ? 'Testing...' : 'Run Test Query'}
      </button>

      {testResponse && (
        <div style={{
          backgroundColor: '#2a2a2a',
          border: '1px solid #555',
          borderRadius: '4px',
          padding: '12px',
          maxHeight: '200px',
          overflow: 'auto'
        }}>
          <div style={{ marginBottom: '8px', fontWeight: 'bold', color: '#00E0FF' }}>
            Response:
          </div>
          <div style={{ marginBottom: '8px', fontSize: '12px', lineHeight: '1.4' }}>
            {testResponse.answer}
          </div>
          
          {testResponse.sql && (
            <>
              <div style={{ marginBottom: '4px', fontWeight: 'bold', color: '#20C997' }}>
                SQL Query:
              </div>
              <pre style={{
                backgroundColor: '#1a1a1a',
                padding: '8px',
                borderRadius: '4px',
                fontSize: '11px',
                overflow: 'auto',
                color: '#e6e6e6'
              }}>
                {testResponse.sql}
              </pre>
            </>
          )}

          {testResponse.result && testResponse.result.rows && (
            <div style={{ marginTop: '8px' }}>
              <div style={{ marginBottom: '4px', fontWeight: 'bold', color: '#ffc107' }}>
                Results: {testResponse.result.row_count} rows
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default APITestPanel;
