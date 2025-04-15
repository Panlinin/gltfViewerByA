import React, { useRef, useEffect, useState, useCallback, memo } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';
import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { CameraPositionTracker } from '../PositionInfo';
import OptimizedCanvas from '../OptimizedCanvas';

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
    // loader.load('potsdamer_platz_1k.hdr', (texture) => {
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

// 创建一个空的占位符组件，用于在没有模型时显示
const EmptyPlaceholder: React.FC = () => {
  return null;
};

// 定义模型加载器属性类型
interface ModelLoaderProps {
  onModelLoad?: (center: THREE.Vector3, size: THREE.Vector3) => void;
  fileUrl?: string;
}

interface ModelViewerProps {
  children: React.ReactElement<ModelLoaderProps>;
  onCameraPositionChange?: (position: THREE.Vector3) => void;
  onModelCenterChange?: (center: THREE.Vector3) => void;
}

// 优化后的OrbitControls组件，增强实时响应性
const OptimizedOrbitControls: React.FC = memo(() => {
  return <OrbitControls 
    makeDefault
    enableDamping 
    dampingFactor={0.2}
    // 提高响应性，降低阻尼
    enableZoom={true}
    zoomSpeed={0.7}
    rotateSpeed={0.7}
    panSpeed={0.7}
  />;
});

// 渲染主体内容组件
const ModelViewerContent: React.FC<{
  children: React.ReactElement<ModelLoaderProps>;
  isFragment: boolean;
  onModelLoad: (center: THREE.Vector3, size: THREE.Vector3) => void;
  onCameraPositionChange?: (position: THREE.Vector3) => void;
}> = memo(({ children, isFragment, onModelLoad, onCameraPositionChange }) => {
  return (
    <>
      <color attach="background" args={['#f0f0f0']} />
      {onCameraPositionChange && (
        <CameraPositionTracker onPositionChange={onCameraPositionChange} />
      )}
      <Stage 
        adjustCamera 
        intensity={0.5} 
        environment="city" 
        shadows={false}
        preset="rembrandt"
      >
        {isFragment ? (
          // 如果是 Fragment，则渲染一个空的占位符
          <EmptyPlaceholder />
        ) : (
          // 否则克隆子组件并传递 onModelLoad 属性
          React.cloneElement(children, { 
            onModelLoad
          } as Partial<ModelLoaderProps>)
        )}
      </Stage>
      <OptimizedOrbitControls />
    </>
  );
});

const ModelViewer: React.FC<ModelViewerProps> = ({ 
  children, 
  onCameraPositionChange,
  onModelCenterChange 
}) => {
  const [modelLoaded, setModelLoaded] = useState(false);

  const handleModelLoad = useCallback((center: THREE.Vector3, size: THREE.Vector3) => {
    setModelLoaded(true);
    if (onModelCenterChange) {
      onModelCenterChange(center);
    }
  }, [onModelCenterChange]);

  const handleCameraPositionChange = useCallback((position: THREE.Vector3) => {
    if (onCameraPositionChange) {
      onCameraPositionChange(position);
    }
  }, [onCameraPositionChange]);

  // 检查子组件是否是 React.Fragment
  const isFragment = children.type === React.Fragment;

  return (
    <OptimizedCanvas
      cameraPosition={[0, 0, 10]}
      cameraFov={50}
      style={{ 
        height: '100%', 
        minHeight: '500px',
        width: '100%',
      }}
    >
      <ModelViewerContent
        children={children}
        isFragment={isFragment}
        onModelLoad={handleModelLoad}
        onCameraPositionChange={handleCameraPositionChange}
      />
    </OptimizedCanvas>
  );
};

export default memo(ModelViewer);
