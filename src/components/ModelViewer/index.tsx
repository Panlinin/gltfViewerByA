import React, { useRef, useEffect, useState, useCallback, memo } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls, Stage, Stats } from '@react-three/drei';
import * as THREE from 'three';
import { CameraPositionTracker } from '../PositionInfo';
import OptimizedCanvas from '../OptimizedCanvas';
import './styles.css';

// 灯光配置接口
interface LightConfig {
  ambientIntensity: number;
  ambientColor: string;
  directIntensity: number;
  directColor: string;
}

// 灯光配置面板组件
const LightConfigPanel: React.FC<{
  config: LightConfig;
  onConfigChange: (config: LightConfig) => void;
}> = ({ config, onConfigChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`light-config-panel ${isExpanded ? 'expanded' : ''}`}>
      <div className="panel-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h3>灯光配置</h3>
        <span className="toggle-icon">{isExpanded ? '▼' : '▶'}</span>
      </div>
      {isExpanded && (
        <div className="panel-content">
          <div className="config-group">
            <label>环境光强度</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={config.ambientIntensity}
              onChange={(e) => onConfigChange({
                ...config,
                ambientIntensity: parseFloat(e.target.value)
              })}
            />
            <span>{config.ambientIntensity}</span>
          </div>
          <div className="config-group">
            <label>环境光颜色</label>
            <input
              type="color"
              value={config.ambientColor}
              onChange={(e) => onConfigChange({
                ...config,
                ambientColor: e.target.value
              })}
            />
          </div>
          <div className="config-group">
            <label>平行光强度</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={config.directIntensity}
              onChange={(e) => onConfigChange({
                ...config,
                directIntensity: parseFloat(e.target.value)
              })}
            />
            <span>{config.directIntensity}</span>
          </div>
          <div className="config-group">
            <label>平行光颜色</label>
            <input
              type="color"
              value={config.directColor}
              onChange={(e) => onConfigChange({
                ...config,
                directColor: e.target.value
              })}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// 创建一个Scene设置组件，用于设置场景
const SceneSetup: React.FC<{
  lightConfig?: LightConfig;
}> = ({ lightConfig = {
  ambientIntensity: 0.8,
  ambientColor: '#ffffff',
  directIntensity: 0.9,
  directColor: '#ffffff'
} }) => {
  const { scene } = useThree();
  const lightsRef = useRef<{
    directionalLight1?: THREE.DirectionalLight;
    directionalLight2?: THREE.DirectionalLight;
    ambientLight?: THREE.AmbientLight;
  }>({});
  
  useEffect(() => {
    // 创建灯光
    lightsRef.current.directionalLight1 = new THREE.DirectionalLight(
      new THREE.Color(lightConfig.directColor),
      lightConfig.directIntensity
    );
    lightsRef.current.directionalLight1.position.set(0, 57, 33);
    
    lightsRef.current.directionalLight2 = new THREE.DirectionalLight(
      new THREE.Color(lightConfig.directColor),
      lightConfig.directIntensity * 0.6
    );
    lightsRef.current.directionalLight2.position.set(-95, 28, -33);
    
    lightsRef.current.ambientLight = new THREE.AmbientLight(
      new THREE.Color(lightConfig.ambientColor),
      lightConfig.ambientIntensity
    );

    scene.add(lightsRef.current.directionalLight1);
    scene.add(lightsRef.current.directionalLight2);
    scene.add(lightsRef.current.ambientLight);

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
      if (lightsRef.current.directionalLight1) {
        scene.remove(lightsRef.current.directionalLight1);
      }
      if (lightsRef.current.directionalLight2) {
        scene.remove(lightsRef.current.directionalLight2);
      }
      if (lightsRef.current.ambientLight) {
        scene.remove(lightsRef.current.ambientLight);
      }
    };
  }, [scene, lightConfig]);

  return null;
};

// 高亮控制器组件 - 负责在Canvas内处理高亮逻辑
export const HighlightController: React.FC = () => {
  const { scene } = useThree();
  const outlineObjects = useRef<THREE.Mesh[]>([]);
  
  // 清除高亮和轮廓效果
  const clearHighlights = useCallback(() => {
    // 清除之前的轮廓对象
    outlineObjects.current.forEach(obj => {
      if (obj && obj.parent) {
        obj.parent.remove(obj);
      }
    });
    outlineObjects.current = [];
    
    // 恢复所有材质
    scene.traverse((object: THREE.Object3D) => {
      if ((object as THREE.Mesh).isMesh) {
        const mesh = object as THREE.Mesh;
        
        // 恢复原始材质
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat) => {
              if (mat.userData.originalEmissive) {
                (mat as THREE.MeshStandardMaterial).emissive.copy(mat.userData.originalEmissive);
              }
              if (mat.userData.originalColor) {
                (mat as THREE.MeshStandardMaterial).color.copy(mat.userData.originalColor);
              }
              mat.userData.highlighted = false;
            });
          } else {
            const mat = mesh.material as THREE.MeshStandardMaterial;
            if (mat.userData.originalEmissive) {
              mat.emissive.copy(mat.userData.originalEmissive);
            }
            if (mat.userData.originalColor) {
              mat.color.copy(mat.userData.originalColor);
            }
            mat.userData.highlighted = false;
          }
        }
      }
    });
  }, [scene]);
  
  // 高亮材质函数
  const highlightMaterial = useCallback((material: THREE.MeshStandardMaterial) => {
    // 保存原始发光色和颜色
    if (!material.userData.originalEmissive) {
      material.userData.originalEmissive = material.emissive.clone();
    }
    if (!material.userData.originalColor) {
      material.userData.originalColor = material.color.clone();
    }
    
    // 设置高亮效果
    material.emissive.set(0x222200); // 设置发光效果
    material.color.multiplyScalar(1.2); // 提亮颜色
    material.userData.highlighted = true;
  }, []);
  
  // 添加轮廓效果
  const addOutline = useCallback((mesh: THREE.Mesh) => {
    try {
      // 创建一个略大的几何体用于轮廓
      const outlineGeometry = mesh.geometry.clone();
      
      // 创建轮廓材质
      const outlineMaterial = new THREE.MeshBasicMaterial({
        color: 0xffff00, // 黄色轮廓
        side: THREE.BackSide, // 只渲染背面
        transparent: true,
        opacity: 0.7,
        depthTest: true,
        depthFunc: THREE.NotEqualDepth, // 不等深度测试
      });
      
      // 创建轮廓网格
      const outlineMesh = new THREE.Mesh(outlineGeometry, outlineMaterial);
      outlineMesh.position.copy(mesh.position);
      outlineMesh.rotation.copy(mesh.rotation);
      outlineMesh.scale.copy(mesh.scale).multiplyScalar(1.05); // 放大5%
      
      // 添加到场景
      mesh.parent?.add(outlineMesh);
      
      // 保存轮廓对象以便后续清除
      outlineObjects.current.push(outlineMesh);
    } catch (error) {
      console.error("创建轮廓效果时出错:", error);
    }
  }, []);
  
  // 处理高亮节点
  const handleHighlightNode = useCallback((event: CustomEvent) => {
    const { uuid, highlight } = event.detail;
    
    // 先清除所有高亮
    clearHighlights();
    
    // 如果需要高亮，找到对象并高亮
    if (highlight && uuid) {
      const selectedObject = scene.getObjectByProperty('uuid', uuid);
      
      if (selectedObject && (selectedObject as THREE.Mesh).isMesh) {
        const mesh = selectedObject as THREE.Mesh;
        
        // 高亮材质
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat) => {
              highlightMaterial(mat as THREE.MeshStandardMaterial);
            });
          } else {
            highlightMaterial(mesh.material as THREE.MeshStandardMaterial);
          }
        }
        
        // 添加轮廓效果
        addOutline(mesh);
      }
    }
  }, [scene, clearHighlights, highlightMaterial, addOutline]);
  
  // 监听自定义事件
  useEffect(() => {
    window.addEventListener('highlightNode', handleHighlightNode as EventListener);
    
    return () => {
      window.removeEventListener('highlightNode', handleHighlightNode as EventListener);
      clearHighlights();
    };
  }, [handleHighlightNode, clearHighlights]);
  
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
  modelPosition?: THREE.Vector3;
}> = memo(({ children, isFragment, onModelLoad, onCameraPositionChange, modelPosition }) => {
  return (
    <>
      <color attach="background" args={['#f0f0f0']} />
      {onCameraPositionChange && (
        <CameraPositionTracker onPositionChange={onCameraPositionChange} />
      )}
      <Stage 
        adjustCamera 
        intensity={0.5} 
        // environment="city" 
        shadows={false}
        preset="rembrandt"
      >
        {isFragment ? (
          <EmptyPlaceholder />
        ) : (
          React.cloneElement(children, { 
            ...children.props,
            onModelLoad: (center: THREE.Vector3, size: THREE.Vector3) => {
              onModelLoad(center, size);
              if (children.props.onModelLoad) {
                children.props.onModelLoad(center, size);
              }
            }
          })
        )}
      </Stage>
      <OptimizedOrbitControls />
      <HighlightController />
      <Stats 
        className="custom-stats"
        showPanel={0}
      />
    </>
  );
});

const ModelViewer: React.FC<ModelViewerProps> = ({ 
  children, 
  onCameraPositionChange
}) => {
  const [lightConfig, setLightConfig] = useState<LightConfig>({
    ambientIntensity: 0.8,
    ambientColor: '#ffffff',
    directIntensity: 0.9,
    directColor: '#ffffff'
  });

  return (
    <div className="model-viewer-container">
      <LightConfigPanel
        config={lightConfig}
        onConfigChange={setLightConfig}
      />
      <OptimizedCanvas>
        <SceneSetup lightConfig={lightConfig} />
        <ModelViewerContent
          isFragment={false}
          onModelLoad={() => {}}
          onCameraPositionChange={onCameraPositionChange}
        >
          {children}
        </ModelViewerContent>
        <OptimizedOrbitControls />
        <HighlightController />
      </OptimizedCanvas>
    </div>
  );
};

export default ModelViewer;
