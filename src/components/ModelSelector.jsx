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
              <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z"/>
            </svg>
          </div>
          <h1>3D Point Mapper</h1>
          <p>Upload your 3D model to start mapping points</p>
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
                <p className="drop-text">Drag & drop your GLB file here</p>
                <span className="or-divider">or</span>
                <label htmlFor="file-input" className="file-button">
                  Choose File
                </label>
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
        }

        .selector-container {
          background: rgba(30, 30, 30, 0.9);
          padding: 3rem;
          border-radius: 20px;
          width: 90%;
          max-width: 600px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .logo-section {
          text-align: center;
          margin-bottom: 2.5rem;
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
        }

        h1 {
          font-size: 2rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #ffffff 0%, #b3b3b3 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        p {
          color: #888;
          font-size: 1rem;
          margin-bottom: 2rem;
        }

        .tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          padding: 0.5rem;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 12px;
        }

        .tabs button {
          flex: 1;
          padding: 1rem;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: #888;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 1rem;
        }

        .tabs button:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.1);
        }

        .tabs button.active {
          background: #333;
          color: #fff;
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
          margin-bottom: 1.5rem;
          color: #666;
          transition: color 0.3s;
        }

        .file-drop-zone:hover .upload-icon {
          color: #888;
        }

        .drop-text {
          font-size: 1.1rem;
          color: #888;
          margin-bottom: 1rem;
        }

        .or-divider {
          display: block;
          color: #666;
          margin: 1rem 0;
          font-size: 0.9rem;
        }

        .file-button {
          display: inline-block;
          padding: 0.8rem 2rem;
          background: #333;
          color: white;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 1rem;
        }

        .file-button:hover {
          background: #444;
          transform: translateY(-2px);
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
      `}</style>
    </div>
  )
} 