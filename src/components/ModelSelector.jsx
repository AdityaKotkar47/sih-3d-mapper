import { useState } from 'react'

export default function ModelSelector({ onModelSelect }) {
  const [selectedTab, setSelectedTab] = useState('file')
  const [url, setUrl] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  const handleUrlSubmit = (e) => {
    e.preventDefault()
    if (url.trim()) {
      onModelSelect({ type: 'url', data: url.trim() })
    }
  }

  const handleFileDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer?.files[0]
    if (file && file.name.toLowerCase().endsWith('.glb')) {
      const url = URL.createObjectURL(file)
      onModelSelect({ type: 'file', data: url, fileName: file.name })
    } else {
      alert('Please upload a GLB file')
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file && file.name.toLowerCase().endsWith('.glb')) {
      const url = URL.createObjectURL(file)
      onModelSelect({ type: 'file', data: url, fileName: file.name })
    } else {
      alert('Please upload a GLB file')
    }
  }

  return (
    <div className="model-selector">
      <div className="selector-container">
        <div className="logo-section">
          <div className="logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          </div>
          <div className="title-container">
            <h1>3D Point Mapper</h1>
            <p>Upload your 3D model to start mapping points</p>
          </div>
        </div>
        
        <div className="tabs">
          <button 
            className={selectedTab === 'file' ? 'active' : ''} 
            onClick={() => setSelectedTab('file')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
              <polyline points="13 2 13 9 20 9"/>
            </svg>
            Upload File
          </button>
          <button 
            className={selectedTab === 'url' ? 'active' : ''} 
            onClick={() => setSelectedTab('url')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
            URL
          </button>
        </div>

        <div className="tab-content">
          {selectedTab === 'file' ? (
            <div 
              className={`file-drop-zone ${isDragging ? 'dragging' : ''}`}
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
            >
              <input
                type="file"
                accept=".glb"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                id="file-input"
              />
              <div className="drop-content">
                <div className="upload-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <div className="drop-text-container">
                  <p className="drop-text">Drag & drop your GLB file here</p>
                  <span className="or-divider">or</span>
                  <label htmlFor="file-input" className="file-button">
                    Choose File
                  </label>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUrlSubmit} className="url-form">
              <div className="input-group">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter GLB file URL"
                  required
                />
              </div>
              <button type="submit">Load Model</button>
            </form>
          )}
        </div>
      </div>

      <style jsx>{`
        .model-selector {
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
          color: white;
          position: relative;
          overflow: hidden;
        }

        .model-selector::before {
          content: '';
          position: absolute;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle at center, rgba(100, 100, 100, 0.1) 0%, transparent 50%);
          animation: rotate 60s linear infinite;
        }

        .selector-container {
          background: rgba(30, 30, 30, 0.95);
          padding: 3rem;
          border-radius: 20px;
          width: 90%;
          max-width: 600px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          position: relative;
          transform: translateY(0);
          transition: all 0.3s ease;
        }

        .selector-container:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.15);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
        }

        .logo {
          width: 80px;
          height: 80px;
          margin: 0 auto 1rem;
          background: linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          color: #e0e0e0;
          position: relative;
          overflow: hidden;
        }

        .logo::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
          animation: rotate 10s linear infinite;
        }

        h1 {
          font-size: 2rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #ffffff 0%, #b3b3b3 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s infinite linear;
        }

        .tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          padding: 0.5rem;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 12px;
          position: relative;
          overflow: hidden;
        }

        .tabs::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent);
          transform: translateX(-100%);
          animation: shimmerEffect 3s infinite;
        }

        .tabs button {
          flex: 1;
          padding: 1rem;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: #888;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .tabs button:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-1px);
        }

        .tabs button.active {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        @keyframes shimmerEffect {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .file-drop-zone {
          border: 2px dashed rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          padding: 3rem 2rem;
          text-align: center;
          transition: all 0.3s;
          background: rgba(0, 0, 0, 0.2);
        }

        .file-drop-zone.dragging {
          border-color: #fff;
          background: rgba(255, 255, 255, 0.1);
        }

        .upload-icon {
          color: #666;
          transition: color 0.3s, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          margin-bottom: 0.5rem;
        }

        .file-drop-zone:hover .upload-icon {
          color: #888;
          transform: scale(1.05);
        }

        .drop-text-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          width: 100%;
        }

        .drop-text {
          font-size: 1.1rem;
          color: #888;
          margin: 0;
          text-align: center;
          width: 100%;
        }

        .or-divider {
          display: block;
          color: #666;
          font-size: 0.9rem;
          margin: 0.5rem 0;
        }

        .file-button {
          display: inline-block;
          padding: 0.8rem 2rem;
          background: #333;
          color: white;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          font-size: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .file-button:hover {
          background: #444;
          transform: translateY(-2px) scale(1.05);
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .url-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .input-group {
          position: relative;
        }

        .url-form input {
          width: 100%;
          padding: 1rem 1.5rem;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: white;
          font-size: 1rem;
          transition: all 0.3s;
        }

        .url-form input:focus {
          outline: none;
          border-color: rgba(255, 255, 255, 0.3);
          background: rgba(0, 0, 0, 0.3);
        }

        .url-form button {
          padding: 1rem;
          background: #333;
          border: none;
          border-radius: 8px;
          color: white;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 1rem;
        }

        .url-form button:hover {
          background: #444;
          transform: translateY(-2px);
        }

        .logo-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 2.5rem;
          text-align: center;
        }

        .title-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
        }

        h1 {
          font-size: 2rem;
          font-weight: 600;
          margin: 0;
          background: linear-gradient(135deg, #ffffff 0%, #b3b3b3 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s infinite linear;
          text-align: center;
          width: 100%;
        }

        p {
          color: #888;
          font-size: 1rem;
          margin: 0;
          text-align: center;
          max-width: 80%;
          line-height: 1.5;
        }
      `}</style>
    </div>
  )
} 