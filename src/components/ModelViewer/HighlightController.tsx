import React, { useRef, useCallback, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

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

export default HighlightController; 