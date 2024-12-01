import { Suspense, useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import Model from './components/Model'
import LoadingScreen from './components/LoadingScreen'
import ModelSelector from './components/ModelSelector'
import Toast from './components/Toast'
import './App.css'

function PointForm({ point, onSubmit, onClose, isEditing }) {
  const [formData, setFormData] = useState({
    name: point?.name || '',
    description: point?.description || ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      ...point,
      name: formData.name,
      description: formData.description
    })
  }

  return (
    <div className="point-form">
      <h3>Add Point</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <label>Description:</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            required
          />
        </div>
        <div className="form-buttons">
          <button type="submit">Save</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  )
}

function ExportButton({ points }) {
  const [showToast, setShowToast] = useState(false)

  const handleExport = () => {
    const json = JSON.stringify(points, null, 2)
    navigator.clipboard.writeText(json)
      .then(() => setShowToast(true))
      .catch(err => console.error('Failed to copy:', err))
  }

  return (
    <>
      <button className="export-button" onClick={handleExport}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        Export Points
      </button>
      {showToast && (
        <Toast
          message="Points data copied to clipboard!"
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  )
}

function Controls({ isPlacingPoint, setIsPlacingPoint }) {
  return (
    <div className="controls-panel">
      <button 
        className={`placement-toggle ${isPlacingPoint ? 'active' : ''}`}
        onClick={() => setIsPlacingPoint(!isPlacingPoint)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="16"/>
          <line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
        {isPlacingPoint ? 'Cancel Point' : 'Add Point'}
      </button>
      {isPlacingPoint && (
        <div className="placement-hint">
          Click anywhere on the model to place a point
        </div>
      )}
    </div>
  )
}

function App() {
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [points, setPoints] = useState([])
  const [tempPoint, setTempPoint] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [modelUrl, setModelUrl] = useState(null)
  const [isPlacingPoint, setIsPlacingPoint] = useState(false)
  const [editingPoint, setEditingPoint] = useState(null)

  const handleAddPoint = useCallback((position) => {
    const newPoint = {
      id: points.length + 1,
      position: [position.x, position.y, position.z],
      name: '',
      description: ''
    }
    setTempPoint(newPoint)
    setShowForm(true)
    setIsPlacingPoint(false)
  }, [points])

  const handleFormSubmit = (pointData) => {
    if (editingPoint) {
      setPoints(prev => prev.map(p => 
        p.id === editingPoint.id ? { ...pointData, id: p.id } : p
      ))
      setEditingPoint(null)
    } else {
      setPoints(prev => [...prev, pointData])
    }
    setTempPoint(null)
    setShowForm(false)
  }

  const handleEditPoint = (point) => {
    setEditingPoint(point)
    setTempPoint(point)
    setShowForm(true)
  }

  const handleDeletePoint = (point) => {
    setPoints(prev => {
      const filtered = prev.filter(p => p.id !== point.id)
      // Reorder IDs
      return filtered.map((p, index) => ({
        ...p,
        id: index + 1
      }))
    })
  }

  const handleModelSelect = (modelData) => {
    setModelUrl(modelData.data)
  }

  if (!modelUrl) {
    return <ModelSelector onModelSelect={handleModelSelect} />
  }

  return (
    <div className="app-container">
      <LoadingScreen progress={loadingProgress} />
      <ExportButton points={points} />
      <Controls 
        isPlacingPoint={isPlacingPoint}
        setIsPlacingPoint={setIsPlacingPoint}
      />
      {showForm && (
        <div className="form-overlay">
          <PointForm
            point={tempPoint}
            onSubmit={handleFormSubmit}
            onClose={() => {
              setTempPoint(null)
              setEditingPoint(null)
              setShowForm(false)
            }}
            isEditing={!!editingPoint}
          />
        </div>
      )}
      <Canvas
        camera={{ position: [0, 2, 10], fov: 75 }}
        style={{ width: '100vw', height: '100vh' }}
      >
        <Suspense fallback={null}>
          <Environment preset="city" />
          <Model 
            modelUrl={modelUrl}
            onProgress={setLoadingProgress}
            points={points}
            onAddPoint={handleAddPoint}
            onEditPoint={handleEditPoint}
            onDeletePoint={handleDeletePoint}
            isPlacingPoint={isPlacingPoint}
          />
          <OrbitControls 
            enableDamping
            dampingFactor={0.05}
            minDistance={5}
            maxDistance={20}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

export default App 