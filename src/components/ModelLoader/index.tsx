import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { MeshStandardMaterial } from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

interface ModelLoaderProps {
  fileUrl: string;
  onModelLoad?: (center: THREE.Vector3, size: THREE.Vector3) => void;
}

const ModelLoader: React.FC<ModelLoaderProps> = React.memo(({ fileUrl, onModelLoad }) => {
  const modelRef = useRef<THREE.Group>(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const { gl } = useThree();
  
  // 使用 useRef 确保我们在整个组件生命周期中使用相同的加载器实例
  const gltfLoaderRef = useRef<GLTFLoader | null>(null);
  const dracoLoaderRef = useRef<DRACOLoader | null>(null);
  
  // 初始化加载器
  useEffect(() => {
    // 创建 DRACO 加载器
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.5/');
    dracoLoader.setDecoderConfig({ type: 'js' });
    dracoLoaderRef.current = dracoLoader;
    
    // 创建加载管理器
    const manager = new THREE.LoadingManager();
    
    // 设置加载完成回调
    manager.onLoad = () => {
      console.log('加载完成');
      setLoadProgress(100);
    };
    
    // 设置加载进度回调
    manager.onProgress = (url, loaded, total) => {
      console.log(`加载进度: ${url}, ${loaded}/${total}`);
      const progress = Math.round((loaded / total) * 100);
      setLoadProgress(progress);
    };
    
    // 设置加载错误回调
    manager.onError = (url) => {
      console.error(`加载错误: ${url}`);
    };
    
    // 创建 GLTF 加载器
    const loader = new GLTFLoader(manager);
    loader.setDRACOLoader(dracoLoader);
    gltfLoaderRef.current = loader;
    
    return () => {
      // 清理资源
      if (dracoLoaderRef.current) {
        dracoLoaderRef.current.dispose();
      }
    };
  }, []);
  
  // 手动加载模型
  const [gltf, setGltf] = useState<GLTF | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // 当文件URL变化时加载模型
  useEffect(() => {
    if (!gltfLoaderRef.current || !fileUrl) return;
    
    // 重置状态
    setLoadProgress(0);
    setGltf(null);
    setError(null);
    
    // console.log('开始加载模型:', fileUrl);
    
    // 手动加载模型
    gltfLoaderRef.current.load(
      fileUrl,
      // 成功回调
      (loadedGltf) => {
        console.log('模型加载成功');
        setGltf(loadedGltf);
        setLoadProgress(100);
      },
      // 进度回调
      (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          console.log(`直接进度: ${progress}%`);
          setLoadProgress(progress);
        }
      },
      // 错误回调
      (error) => {
        console.error('模型加载失败:', error);
        setError(error instanceof Error ? error.message : '未知错误');
      }
    );
    
    // 清理函数
    return () => {
      URL.revokeObjectURL(fileUrl);
    };
  }, [fileUrl]);

  // 优化模型
  const optimizeModel = useCallback((scene: THREE.Group) => {
    // 遍历模型的所有对象
    scene.traverse((object) => {
      // 简化几何体
      if ((object as THREE.Mesh).isMesh) {
        const mesh = object as THREE.Mesh;
        
        // 降低材质的复杂度
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(material => {
              if ((material as MeshStandardMaterial).map) {
                (material as MeshStandardMaterial).map!.anisotropy = gl.capabilities.getMaxAnisotropy();
              }
            });
          } else if ((mesh.material as MeshStandardMaterial).map) {
            (mesh.material as MeshStandardMaterial).map!.anisotropy = gl.capabilities.getMaxAnisotropy();
          }
        }
        
        // 如果几何体有足够多的顶点，考虑简化
        if (mesh.geometry && mesh.geometry.attributes.position?.count > 10000) {
          // 简单的几何体优化
          mesh.frustumCulled = true;
        }
      }
    });
    
    return scene;
  }, [gl]);

  // 处理加载完成的模型
  useEffect(() => {
    if (!gltf) return;
    
    // 优化模型
    const optimizedScene = optimizeModel(gltf.scene);
    
    // 计算模型的边界框，用于回调
    const box = new THREE.Box3().setFromObject(optimizedScene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    modelRef.current = optimizedScene;
    
    // 调用回调函数
    if (onModelLoad) {
      onModelLoad(center, size);
    }
  }, [gltf, onModelLoad, optimizeModel]);

  return (
    <>
      {loadProgress < 100 && !error && (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="#666666" opacity={0.7} transparent />
          <Html center>
            <div style={{ 
              color: 'white', 
              background: 'rgba(0,0,0,0.7)', 
              padding: '10px', 
              borderRadius: '5px',
              fontWeight: 'bold'
            }}>
              加载中: {loadProgress}%
            </div>
          </Html>
        </mesh>
      )}
      {error && (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="red" opacity={0.7} transparent />
          <Html center>
            <div style={{ 
              color: 'white', 
              background: 'rgba(255,0,0,0.7)', 
              padding: '10px', 
              borderRadius: '5px'
            }}>
              加载失败: {error}
            </div>
          </Html>
        </mesh>
      )}
      {gltf && <primitive object={gltf.scene} ref={modelRef} />}
    </>
  );
});

export default ModelLoader;