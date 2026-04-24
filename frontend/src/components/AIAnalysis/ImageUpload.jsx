import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import AIResultDisplay from './AIResultDisplay';

function ImageUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [apiConfigured, setApiConfigured] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      const response = await axios.get('/api/ai/status');
      setApiConfigured(response.data.configured);
    } catch (err) {
      console.error('Error checking API status:', err);
    }
  };

  const handleFileSelect = (file) => {
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10MB.');
      return;
    }

    setSelectedFile(file);
    setError('');
    setResult(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setAnalyzing(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await axios.post('/api/ai/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze image. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <a href="/">Dashboard</a> / AI Analysis
          </div>
          <h2>AI-Powered Defect Detection</h2>
        </div>
      </div>

      {!apiConfigured && (
        <div className="error-message" style={{ marginBottom: '1.5rem' }}>
          <strong>OpenRouter API not configured.</strong> Please add your API key to the .env file.
        </div>
      )}

      <div className="detail-container">
        {!result ? (
          <>
            <div
              className={`ai-upload-zone ${dragOver ? 'dragover' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={(e) => handleFileSelect(e.target.files[0])}
              />
              <div className="ai-upload-icon">📷</div>
              <p className="ai-upload-text">
                <strong>Click to upload</strong> or drag and drop
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                JPEG, PNG, GIF, or WebP (max 10MB)
              </p>
            </div>

            {preview && (
              <div className="ai-preview">
                <img src={preview} alt="Preview" />
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
                  <button
                    className="btn btn-primary"
                    onClick={handleAnalyze}
                    disabled={analyzing || !apiConfigured}
                  >
                    {analyzing ? (
                      <>
                        <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></span>
                        Analyzing...
                      </>
                    ) : (
                      '🔍 Analyze Image'
                    )}
                  </button>
                  <button className="btn btn-outline" onClick={handleReset}>
                    Clear
                  </button>
                </div>
              </div>
            )}

            {error && <div className="error-message" style={{ marginTop: '1rem' }}>{error}</div>}
          </>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ marginBottom: '0.5rem' }}>Analysis Results</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Analyzed at {new Date(result.timestamp).toLocaleString()}
                </p>
              </div>
              <button className="btn btn-outline" onClick={handleReset}>
                Analyze Another Image
              </button>
            </div>

            {preview && (
              <div style={{ marginBottom: '1.5rem' }}>
                <img
                  src={preview}
                  alt="Analyzed"
                  style={{ maxWidth: '300px', borderRadius: '0.5rem', boxShadow: 'var(--shadow)' }}
                />
              </div>
            )}

            <AIResultDisplay result={result} />
          </>
        )}
      </div>
    </div>
  );
}

export default ImageUpload;
