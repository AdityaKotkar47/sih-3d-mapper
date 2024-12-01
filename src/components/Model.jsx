import { useEffect, useState, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

function Label({ position, name, description }) {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <group position={position}>
      <Html distanceFactor={10}>
        <div
          style={{
            padding: '8px 12px',
            background: isHovered ? 'rgba(50, 50, 50, 0.95)' : 'rgba(30, 30, 30, 0.95)',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            transform: 'translate3d(-50%, -50%, 0)',
            fontSize: '14px',
            userSelect: 'none',
            transition: 'all 0.3s',
            border: `1px solid ${isHovered ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'}`,
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
          }}
          onPointerEnter={() => setIsHovered(true)}
          onPointerLeave={() => setIsHovered(false)}
        >
          {name || '•'}
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

export default function Model({ modelUrl, onProgress, points = [], onAddPoint, isPlacingPoint }) {
  const { camera, scene, raycaster, pointer } = useThree()
  const [model, setModel] = useState(null)
  const [hoverPoint, setHoverPoint] = useState(null)
  const modelRef = useRef()

  useEffect(() => {
    if (!modelUrl) return

    const loader = new GLTFLoader()
    
    loader.load(
      modelUrl,
      (gltf) => {
        // Center the model
        const box = new THREE.Box3().setFromObject(gltf.scene)
        const center = box.getCenter(new THREE.Vector3())
        gltf.scene.position.sub(center)

        gltf.scene.traverse((child) => {
          if (child.isMesh) {
            child.material.roughness = 0.5
            child.material.metalness = 0.5
          }
        })

        setModel(gltf.scene)
        onProgress(100)
      },
      (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100)
          onProgress(percent)
        }
      },
      (error) => {
        console.error('Model loading error:', error)
        onProgress(0)
      }
    )
  }, [modelUrl, onProgress])

  useFrame(() => {
    if (isPlacingPoint && model) {
      raycaster.setFromCamera(pointer, camera)
      const intersects = raycaster.intersectObjects(scene.children, true)
      
      if (intersects.length > 0) {
        // Find the closest point that's not too far from the model
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
      {model && <primitive object={model} scale={1} />}
      {points.map((point, index) => (
        <Label
          key={point.id || index}
          position={point.position}
          name={point.name}
          description={point.description}
        />
      ))}
      {isPlacingPoint && <PlacementIndicator position={hoverPoint} />}
    </group>
  )
} 