import React, { useRef, useEffect, memo, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { RenderOptimizer, getOptimizedPerformanceSettings } from '../../utils/renderOptimizer';

// 渲染优化器初始化组件
const RendererOptimizer: React.FC = () => {
  const { gl } = useThree();
  
  useEffect(() => {
    // 当Three.js渲染器可用时，将其传递给渲染优化器
    const optimizer = RenderOptimizer.getInstance();
    optimizer.setRenderer(gl);
    optimizer.optimizeForDevice();
    
    return () => {
      // 清理逻辑（如果需要）
    };
  }, [gl]);
  
  return null;
};

interface OptimizedCanvasProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  cameraPosition?: [number, number, number];
  cameraFov?: number;
  onCreated?: (state: any) => void;
}

// 优化的Canvas组件，用于3D渲染，自动处理性能优化
const OptimizedCanvas: React.FC<OptimizedCanvasProps> = ({ 
  children, 
  className, 
  style,
  cameraPosition = [0, 0, 10],
  cameraFov = 50,
  onCreated
}) => {
  // 获取优化的性能设置
  const performanceSettings = useMemo(() => getOptimizedPerformanceSettings(), []);
  
  // 默认样式
  const defaultStyle = useMemo<React.CSSProperties>(() => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    outline: 'none',
    touchAction: 'none'
  }), []);
  
  // 合并样式
  const canvasStyle = useMemo<React.CSSProperties>(() => ({
    ...defaultStyle,
    ...style
  }), [defaultStyle, style]);
  
  // 自定义创建回调
  const handleCreated = (state: any) => {
    // 禁用右键菜单
    state.events.connect(state.gl.domElement);
    state.gl.domElement.addEventListener('contextmenu', (e: Event) => e.preventDefault());
    
    // 调用用户提供的创建回调
    if (onCreated) {
      onCreated(state);
    }
  };

  return (
    <Canvas
      className={className}
      style={canvasStyle}
      camera={{ 
        position: cameraPosition, 
        fov: cameraFov 
      }}
      onCreated={handleCreated}
      {...performanceSettings}
    >
      <RendererOptimizer />
      {children}
    </Canvas>
  );
};

export default memo(OptimizedCanvas); 