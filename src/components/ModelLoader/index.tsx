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
  onModelLoad?: (scenePosition: THREE.Vector3, size: THREE.Vector3) => void;
  onSceneLoad?: (sceneData: any) => void;
}

const ModelLoader: React.FC<ModelLoaderProps> = React.memo(({ fileUrl, onModelLoad, onSceneLoad }) => {
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
  
  // 提取材质处理逻辑
  const handleMaterial = (material: THREE.Material) => {
    if ((material as MeshStandardMaterial).map) {
      (material as MeshStandardMaterial).map!.anisotropy = gl.capabilities.getMaxAnisotropy();
    }
  };

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
            mesh.material.forEach(handleMaterial);
          } else {
            handleMaterial(mesh.material);
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
    const size = box.getSize(new THREE.Vector3());
    
    modelRef.current = optimizedScene;
    
    // 调用回调函数，使用scene的position
    if (onModelLoad) {
      onModelLoad(optimizedScene.position, size);
    }
    
    // 调用场景加载回调 - 传递场景的 JSON 结构
    if (onSceneLoad) {
      // 提取场景结构并转换为可序列化的对象
      const sceneData = {
        scene: extractSceneData(gltf.scene),
        animations: gltf.animations?.map(animation => ({
          name: animation.name,
          duration: animation.duration
        })) || [],
        asset: gltf.asset,
        parser: gltf.parser?.json || null
      };
      
      onSceneLoad(sceneData);
    }
  }, [gltf, onModelLoad, onSceneLoad, optimizeModel]);
  
  // 提取场景数据的辅助函数
  const extractSceneData = useCallback((object: THREE.Object3D) => {
    // 创建一个可序列化的场景对象描述
    const result: any = {
      name: object.name,
      type: object.type,
      uuid: object.uuid,
      children: []
    };
    
    // 添加特定类型的属性
    if ((object as THREE.Mesh).isMesh) {
      const mesh = object as THREE.Mesh;
      result.geometry = {
        type: mesh.geometry.type,
        vertexCount: mesh.geometry.attributes.position?.count || 0,
        faceCount: mesh.geometry.attributes.position ? 
          Math.floor(mesh.geometry.attributes.position.count / 3) : 0
      };
      
      // 处理材质
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          result.materials = mesh.material.map(mat => ({
            type: mat.type,
            name: mat.name,
            color: (mat as any).color?.getHex(),
            transparent: (mat as any).transparent,
            opacity: (mat as any).opacity,
            uuid: mat.uuid
          }));
        } else {
          result.material = {
            type: mesh.material.type,
            name: mesh.material.name,
            color: (mesh.material as any).color?.getHex(),
            transparent: (mesh.material as any).transparent,
            opacity: (mesh.material as any).opacity,
            uuid: mesh.material.uuid
          };
        }
      }
    }
    
    // 递归处理子对象
    if (object.children && object.children.length > 0) {
      object.children.forEach(child => {
        result.children.push(extractSceneData(child));
      });
    }
    
    return result;
  }, []);
  
  // 直接加载模型
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
        if (onSceneLoad) {
          onSceneLoad({
            error: error instanceof Error ? error.message : '未知错误',
            status: 'error'
          }); 
        }
      }
    );
    
    // 清理函数
    return () => {
      URL.revokeObjectURL(fileUrl);
    };
  }, [fileUrl]);

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