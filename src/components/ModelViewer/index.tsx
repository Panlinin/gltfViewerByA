import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';
import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';

// 创建一个Scene设置组件，用于设置场景
const SceneSetup: React.FC = () => {
  const { scene } = useThree();
  
  useEffect(() => {
     //   平行光1
     const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.9);
     directionalLight1.position.set(0, 57, 33);
     //   平行光2
     const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.6);
     directionalLight2.position.set(-95, 28, -33);
     // 环境光
     const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);

     scene.add(directionalLight1);
     scene.add(directionalLight2);
     scene.add(ambientLight);

    // 加载环境贴图
    // const loader = new RGBELoader();
    // loader.setPath('/hdr/');
    // loader.load('unfinished_office_1k.hdr', (texture) => {
    //   texture.mapping = THREE.EquirectangularReflectionMapping;
    //   scene.environment = texture;
    //   scene.background = texture;
    // });

    return () => {
      // 清理资源
      scene.remove(directionalLight1);
      scene.remove(directionalLight2);
      scene.remove(ambientLight);
    };
  }, [scene]);

  return null;
};

const ModelViewer: React.FC<{ children: React.ReactElement<{ onModelLoad?: (center: THREE.Vector3, size: THREE.Vector3) => void }> }> = ({ children }) => {
  const [modelLoaded, setModelLoaded] = useState(false);

  const handleModelLoad = (center: THREE.Vector3, size: THREE.Vector3) => {
    setModelLoaded(true);
  };

  return (
    <Canvas 
      style={{ 
        height: '100%', 
        minHeight: '500px',
        width: '100%',
      }} 
      camera={{ position: [0, 0, 10], fov: 50 }}
    >
      <color attach="background" args={['#f0f0f0']} />
      <Stage 
        adjustCamera 
        intensity={0.5} 
        environment="city" 
        shadows={false}
        preset="rembrandt"
      >
        {React.cloneElement(children, { 
          onModelLoad: handleModelLoad
        })}
      </Stage>
      <OrbitControls enableDamping dampingFactor={0.25} />
    </Canvas>
  );
};

export default ModelViewer;
