import { useEffect, useState, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

const CACHE_KEY = 'modelCache_v1'

function useModelDownload(url) {
  const [progress, setProgress] = useState(0)
  const [model, setModel] = useState(null)

  useEffect(() => {
    if (!url) return

    const loader = new GLTFLoader()
    
    loader.load(
      url,
      (gltf) => {
        console.log('Model loaded successfully')
        setModel(gltf.scene)
        setProgress(100)
      },
      (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100)
          setProgress(percent)
        }
      },
      (error) => {
        console.error('Model loading error:', error)
      }
    )

    return () => {
      if (model) {
        model.traverse((child) => {
          if (child.geometry) child.geometry.dispose()
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(material => material.dispose())
            } else {
              child.material.dispose()
            }
          }
        })
      }
    }
  }, [url])

  return { progress, model }
}

function useModelBounds(model) {
  const { camera, scene } = useThree()
  
  useEffect(() => {
    if (model) {
      // Create bounding box
      const box = new THREE.Box3().setFromObject(model)
      const size = box.getSize(new THREE.Vector3())
      const center = box.getCenter(new THREE.Vector3())
      
      // Get the maximum dimension
      const maxDim = Math.max(size.x, size.y, size.z)
      
      // Set camera properties
      camera.near = maxDim * 0.001
      camera.far = maxDim * 100
      
      // Position camera based on model size
      const distance = maxDim * 2
      camera.position.set(distance, distance / 2, distance)
      camera.updateProjectionMatrix()
      
      // Center and scale model
      model.position.copy(new THREE.Vector3(0, 0, 0))
      model.position.sub(center)
      
      // Apply materials
      model.traverse((child) => {
        if (child.isMesh) {
          child.material.roughness = 0.5
          child.material.metalness = 0.5
        }
      })

      // Update matrices
      model.updateMatrix()
      model.updateMatrixWorld(true)
    }
  }, [model, camera, scene])
}

function Label({ position, name, description, isSelected, onClick, onEdit, onDelete }) {
  const [isHovered, setIsHovered] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  return (
    <group position={position}>
      <Html distanceFactor={10}>
        <div
          style={{
            padding: '8px 12px',
            background: isSelected 
              ? 'rgba(60, 60, 60, 0.95)' 
              : isHovered 
                ? 'rgba(50, 50, 50, 0.95)' 
                : 'rgba(30, 30, 30, 0.95)',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px',
            userSelect: 'none',
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            border: `1px solid ${
              isSelected 
                ? 'rgba(255, 255, 255, 0.3)' 
                : isHovered 
                  ? 'rgba(255, 255, 255, 0.2)' 
                  : 'rgba(255, 255, 255, 0.1)'
            }`,
            backdropFilter: 'blur(10px)',
            boxShadow: isSelected 
              ? '0 4px 20px rgba(0, 0, 0, 0.4)' 
              : '0 4px 12px rgba(0, 0, 0, 0.3)',
            transform: `translate(-50%, -50%) scale(${isSelected ? 1.1 : 1}) ${isDeleting ? 'rotate(10deg)' : ''}`,
            opacity: isDeleting ? 0 : (isSelected ? 1 : 0.9),
            animation: isDeleting ? 'wobbleOut 0.5s ease-in-out' : undefined,
          }}
          onPointerEnter={() => {
            setIsHovered(true)
            setShowOptions(true)
          }}
          onPointerLeave={() => {
            setIsHovered(false)
            setTimeout(() => setShowOptions(false), 300)
          }}
          onClick={onClick}
        >
          <div style={{ position: 'relative' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              transform: isSelected ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: isSelected ? '#fff' : 'rgba(255, 255, 255, 0.5)',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transform: isSelected ? 'scale(1.2)' : 'scale(1)',
              }} />
              {name || '•'}
            </div>
            {showOptions && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginTop: '8px',
                  background: 'rgba(40, 40, 40, 0.95)',
                  borderRadius: '12px',
                  padding: '6px',
                  display: 'flex',
                  gap: '4px',
                  animation: 'popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                  zIndex: 1000,
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit?.()
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                  onMouseEnter={e => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)'
                    e.target.style.transform = 'scale(1.05)'
                  }}
                  onMouseLeave={e => {
                    e.target.style.background = 'transparent'
                    e.target.style.transform = 'scale(1)'
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsDeleting(true)
                    setTimeout(() => onDelete?.(), 500)
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ff4444',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                  onMouseEnter={e => {
                    e.target.style.background = 'rgba(255, 68, 68, 0.1)'
                    e.target.style.transform = 'scale(1.05) rotate(-2deg)'
                  }}
                  onMouseLeave={e => {
                    e.target.style.background = 'transparent'
                    e.target.style.transform = 'scale(1) rotate(0deg)'
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </Html>
    </group>
  )
}

function PlacementIndicator({ position }) {
  const ref = useRef()
  
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.getElapsedTime()
      ref.current.scale.setScalar(1 + Math.sin(clock.getElapsedTime() * 2) * 0.1)
    }
  })

  if (!position) return null

  return (
    <group position={position} ref={ref}>
      <mesh>
        <ringGeometry args={[0.3, 0.4, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.4, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.5} />
      </mesh>
    </group>
  )
}

export default function Model({ modelUrl, onProgress, points = [], onAddPoint, isPlacingPoint, onEditPoint, onDeletePoint }) {
  const { camera, scene, raycaster, pointer } = useThree()
  const [hoverPoint, setHoverPoint] = useState(null)
  const [selectedPoint, setSelectedPoint] = useState(null)
  const modelRef = useRef()

  const { progress, model } = useModelDownload(modelUrl)
  
  useEffect(() => {
    onProgress(progress)
  }, [progress, onProgress])

  useModelBounds(model)

  useFrame(() => {
    if (isPlacingPoint && model) {
      raycaster.setFromCamera(pointer, camera)
      const intersects = raycaster.intersectObjects(scene.children, true)
      
      if (intersects.length > 0) {
        const modelBounds = new THREE.Box3().setFromObject(model)
        const modelCenter = modelBounds.getCenter(new THREE.Vector3())
        const modelSize = modelBounds.getSize(new THREE.Vector3())
        const maxDistance = Math.max(modelSize.x, modelSize.y, modelSize.z)

        for (const intersect of intersects) {
          const distance = intersect.point.distanceTo(modelCenter)
          if (distance < maxDistance * 1.5) {
            setHoverPoint(intersect.point)
            break
          }
        }
      } else {
        setHoverPoint(null)
      }
    } else if (hoverPoint) {
      setHoverPoint(null)
    }
  })

  const handleClick = (event) => {
    if (!isPlacingPoint || !hoverPoint) return

    event.stopPropagation()
    onAddPoint(hoverPoint)
  }

  return (
    <group ref={modelRef} onClick={handleClick}>
      {model && (
        <primitive 
          object={model} 
          dispose={null}
        />
      )}
      {points.map((point, index) => (
        <Label
          key={point.id || index}
          position={point.position}
          name={point.name}
          description={point.description}
          isSelected={selectedPoint?.id === point.id}
          onClick={() => {
            if (selectedPoint?.id === point.id) {
              setSelectedPoint(null)
            } else {
              setSelectedPoint(point)
            }
          }}
          onEdit={() => onEditPoint?.(point)}
          onDelete={() => {
            onDeletePoint?.(point)
            setSelectedPoint(null)
          }}
        />
      ))}
      {isPlacingPoint && <PlacementIndicator position={hoverPoint} />}
    </group>
  )
} 