import React from 'react';

const DataTable = ({ data, downloadUrl, sql, tier }) => {
  const handleDownload = () => {
    if (downloadUrl) {
      if (downloadUrl.startsWith('file://')) {
        // For local file URLs, copy path to clipboard and show instructions
        const filePath = downloadUrl.replace('file:///', '').replace(/\//g, '\\');
        
        navigator.clipboard.writeText(filePath).then(() => {
          alert(`File path copied to clipboard!\n\nPath: ${filePath}\n\nPaste this path in your file explorer to access the CSV file.`);
        }).catch(() => {
          // Fallback if clipboard API fails
          prompt('Copy this file path and paste it in your file explorer:', filePath);
        });
      } else {
        // For HTTP URLs, open in new tab
        window.open(downloadUrl, '_blank');
      }
    }
  };

  // Check if we have any data to display (table or metadata)
  const hasTableData = data && data.columns && data.rows && data.rows.length > 0;
  const hasQueryInfo = sql || downloadUrl || tier;

  if (!hasTableData && !hasQueryInfo) {
    return (
      <div className="data-table-empty">
        <p>No data to display</p>
      </div>
    );
  }

  return (
    <div className="data-table-container">
      <div className="data-table-header">
        <div className="data-info">
          <h3>Query {hasTableData ? 'Results' : 'Information'}</h3>
          {hasTableData ? (
            <p>{data.rows.length} rows × {data.columns.length} columns</p>
          ) : (
            <p>Query executed {tier ? `(Tier ${tier})` : ''}</p>
          )}
        </div>
        {downloadUrl && (
          <button 
            className="download-btn"
            onClick={handleDownload}
            title={downloadUrl.startsWith('file://') ? 'Copy file path to clipboard' : 'Download full dataset as CSV'}
          >
            {downloadUrl.startsWith('file://') ? 'Copy File Path' : 'Download CSV'}
          </button>
        )}
      </div>
      
      {hasTableData ? (
        <>
          {/* ChatGPT-style Table */}
          <div className="chatgpt-table-wrapper">
            <table className="chatgpt-table">
              <thead>
                <tr>
                  {data.columns.map((column, index) => (
                    <th key={index}>
                      {column.charAt(0).toUpperCase() + column.slice(1).replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.rows.slice(0, 10).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex}>
                        {typeof cell === 'number' && cell % 1 !== 0 ? cell.toFixed(4) : String(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            
            {data.rows.length > 10 && (
              <div className="table-footer">
                <p>Showing first 10 rows of {data.rows.length} total rows</p>
                {downloadUrl && (
                  <p className="download-hint">Download CSV for complete dataset</p>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="query-info">
          <p>Query executed successfully. {downloadUrl ? 'Download the full results using the button above.' : 'No sample data available to preview.'}</p>
          {sql && (
            <details className="sql-details">
              <summary>View SQL Query</summary>
              <pre className="sql-code">{sql}</pre>
            </details>
          )}
        </div>
      )}

      <style jsx>{`
        .data-table-container {
          margin: 16px 0;
          background: rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 12px;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }

        .data-table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: rgba(0, 0, 0, 0.02);
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        .data-info h3 {
          margin: 0 0 4px 0;
          font-size: 14px;
          font-weight: 600;
          color: #1a1a1a;
        }

        .data-info p {
          margin: 0;
          font-size: 12px;
          color: #666;
        }

        .download-btn {
          background: #10a37f;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .download-btn:hover {
          background: #0d8a6b;
        }

        .chatgpt-table-wrapper {
          overflow-x: auto;
          max-height: 400px;
          overflow-y: auto;
        }

        .chatgpt-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
          line-height: 1.4;
        }

        .chatgpt-table th {
          background: rgba(0, 0, 0, 0.05);
          color: #1a1a1a;
          font-weight: 600;
          padding: 12px 16px;
          text-align: left;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 0;
          z-index: 1;
        }

        .chatgpt-table td {
          padding: 10px 16px;
          color: #1a1a1a;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          word-wrap: break-word;
          max-width: 200px;
        }

        .chatgpt-table tbody tr:hover {
          background: rgba(0, 0, 0, 0.02);
        }

        .chatgpt-table tbody tr:nth-child(even) {
          background: rgba(0, 0, 0, 0.01);
        }

        .table-footer {
          padding: 12px 20px;
          background: rgba(0, 0, 0, 0.02);
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          text-align: center;
        }

        .table-footer p {
          margin: 0;
          font-size: 12px;
          color: #666;
        }

        .download-hint {
          margin-top: 4px !important;
          color: #10a37f !important;
          font-weight: 500;
        }

        .query-info {
          padding: 20px;
          text-align: center;
          color: #666;
        }

        .query-info p {
          margin: 0 0 16px 0;
        }

        .sql-details {
          text-align: left;
          max-width: 100%;
        }

        .sql-details summary {
          cursor: pointer;
          font-weight: 500;
          margin-bottom: 8px;
          color: #007ACC;
        }

        .sql-details summary:hover {
          color: #005999;
        }

        .sql-code {
          background: #f8f9fa;
          border: 1px solid #e1e4e8;
          border-radius: 6px;
          padding: 12px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 12px;
          overflow-x: auto;
          margin: 0;
          white-space: pre-wrap;
          color: #24292e;
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .data-table-container {
            background: rgba(255, 255, 255, 0.05);
            border-color: rgba(255, 255, 255, 0.1);
          }

          .data-table-header,
          .table-footer {
            background: rgba(255, 255, 255, 0.02);
            border-color: rgba(255, 255, 255, 0.1);
          }

          .data-info h3,
          .chatgpt-table th,
          .chatgpt-table td {
            color: #e6e6e6;
          }

          .chatgpt-table th {
            background: rgba(255, 255, 255, 0.05);
            border-color: rgba(255, 255, 255, 0.1);
          }

          .chatgpt-table td {
            border-color: rgba(255, 255, 255, 0.05);
          }

          .chatgpt-table tbody tr:hover {
            background: rgba(255, 255, 255, 0.02);
          }

          .chatgpt-table tbody tr:nth-child(even) {
            background: rgba(255, 255, 255, 0.01);
          }

          .query-info {
            color: #aaa;
          }

          .sql-details summary {
            color: #58a6ff;
          }

          .sql-details summary:hover {
            color: #79c0ff;
          }

          .sql-code {
            background: #161b22;
            border-color: #30363d;
            color: #e6edf3;
          }
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .data-table-header {
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
          }

          .download-btn {
            align-self: center;
          }

          .chatgpt-table th,
          .chatgpt-table td {
            padding: 8px 12px;
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default DataTable;
