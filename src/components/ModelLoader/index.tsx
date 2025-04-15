import React, { useEffect, useRef } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

interface ModelLoaderProps {
  fileUrl: string;
  onModelLoad?: (center: THREE.Vector3, size: THREE.Vector3) => void;
}

const ModelLoader: React.FC<ModelLoaderProps> = React.memo(({ fileUrl, onModelLoad }) => {
  const modelRef = useRef<THREE.Group>(null);
  
  // 使用 useLoader 加载 GLTF 模型
  const gltf = useLoader(GLTFLoader, fileUrl);

  // 清理 URL
  useEffect(() => {
    return () => URL.revokeObjectURL(fileUrl);
  }, [fileUrl]);

  useEffect(() => {
    if (!gltf) return;
    
    // 计算模型的边界框，用于回调
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    modelRef.current = gltf.scene;
    
    // 调用回调函数
    if (onModelLoad) {
      onModelLoad(center, size);
    }
  }, [gltf, onModelLoad]);

  return <primitive object={gltf.scene} ref={modelRef} />;
});

export default ModelLoader;