import React, { useRef, useCallback, useEffect, useState, useMemo, memo } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { debounce } from '../../utils/debounce';
import { Tree } from 'antd';
import type { TreeProps } from 'antd/es/tree';

interface PositionInfoProps {
  modelCenter?: THREE.Vector3;
  cameraPosition?: THREE.Vector3;
  scene?: string;
}

// 创建Three.js场景上下文使用的组件
export const CameraPositionTracker: React.FC<{ onPositionChange: (position: THREE.Vector3) => void }> = ({ onPositionChange }) => {
  const { camera } = useThree();
  
  // 使用 useRef 保存最后位置以便比较，避免不必要的更新
  const lastPositionRef = useRef(new THREE.Vector3());
  
  // 直接每帧传递相机位置用于实时操作，但会检查位置是否有明显变化
  useFrame(() => {
    if (camera) {
      const currentPosition = camera.position;
      
      // 计算当前位置与上次记录位置的距离
      const distance = lastPositionRef.current.distanceTo(currentPosition);
      
      // 只有当位置变化超过阈值时才更新
      if (distance > 0.01) {
        // 直接传递实时位置，确保操作响应无延迟
        onPositionChange(currentPosition.clone());
        // 更新最后记录的位置
        lastPositionRef.current.copy(currentPosition);
      }
    }
  });
  
  return null;
};

// 使用 memo 包装位置信息的显示组件，避免不必要的重渲染
const VectorDisplay = memo<{label: string, vector?: THREE.Vector3}>(({ label, vector }) => {
  // 格式化向量为字符串
  const formattedText = useMemo(() => {
    if (!vector) return '未知';
    return `X: ${vector.x.toFixed(2)}, Y: ${vector.y.toFixed(2)}, Z: ${vector.z.toFixed(2)}`;
  }, [vector?.x, vector?.y, vector?.z]);
  
  return (
    <p style={{ margin: '4px 0', fontSize: '13px' }}>
      {label}: {formattedText}
    </p>
  );
});

// 场景面板组件
const ScenePanel: React.FC<{ 
  scene?: any;
}> = memo(({ scene }) => {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  // 将场景数据转换为 Ant Design Tree 组件所需的格式
  const treeData = useMemo(() => {
    if (!scene) return [];
    
    const extractNameAndType = (node: any): any => {
      const result: any = {
        title: `${node.name || '无名'} (${node.type || '未知类型'})`,
        key: node.uuid || node.name || Math.random().toString(),
        children: [],
        uuid: node.uuid, // 保存uuid用于后续查找对象
      };
      
      if (node.children && node.children.length > 0) {
        result.children = node.children.map(extractNameAndType);
        // 收集所有expandedKeys
        result.children.forEach((child: any) => {
          if (child.key) {
            expandedKeys.push(child.key);
          }
        });
      }
      
      return result;
    };
    
    const data = [extractNameAndType(scene.scene)];
    
    // 设置初始展开的节点
    if (data[0]?.key) {
      expandedKeys.push(data[0].key);
    }
    
    return data;
  }, [scene]);

  useEffect(() => {
    if (treeData.length > 0) {
      setExpandedKeys(expandedKeys);
    }
  }, [treeData]);

  // 处理节点选中事件
  const handleSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
    setSelectedKeys(selectedKeys as string[]);
    
    // 添加highlightNode自定义事件，传递uuid到Canvas内部进行处理
    if (selectedKeys.length > 0 && info.node) {
      const uuid = (info.node as any).uuid;
      // 使用自定义事件在Canvas外部传递信息到Canvas内部
      const event = new CustomEvent('highlightNode', { 
        detail: { uuid, highlight: true } 
      });
      window.dispatchEvent(event);
    } else {
      // 如果没有选中节点，发送清除高亮的事件
      const event = new CustomEvent('highlightNode', { 
        detail: { uuid: null, highlight: false } 
      });
      window.dispatchEvent(event);
    }
  };

  return (
    <div style={{
      maxHeight: '180px', // 限制最大高度
      overflowY: 'auto', // 启用垂直滚动条
      margin: '8px 0',
      color: '#555',
      fontSize: '13px'
    }}>
      <Tree
        treeData={treeData}
        defaultExpandAll
        expandedKeys={expandedKeys}
        onExpand={(keys) => setExpandedKeys(keys as string[])}
        selectedKeys={selectedKeys}
        onSelect={handleSelect}
        virtual
      />
    </div>
  );
});

// 位置信息组件
const PositionInfo: React.FC<PositionInfoProps> = ({ modelCenter, cameraPosition, scene }) => {
  // 使用内部状态来防抖显示
  const [displayCameraPosition, setDisplayCameraPosition] = useState<THREE.Vector3 | undefined>(cameraPosition);
  const [displayModelCenter, setDisplayModelCenter] = useState<THREE.Vector3 | undefined>(modelCenter);
  
  // 创建防抖函数
  const debouncedSetDisplayPosition = useRef(
    debounce((newPosition: THREE.Vector3) => {
      setDisplayCameraPosition(new THREE.Vector3().copy(newPosition));
    }, 150) // 150ms 的防抖时间，调整为更加平滑的体验
  ).current;
  
  const debouncedSetDisplayCenter = useRef(
    debounce((newCenter: THREE.Vector3) => {
      setDisplayModelCenter(new THREE.Vector3().copy(newCenter));
    }, 150) // 150ms 的防抖时间
  ).current;
  
  // 当外部属性变化时，使用防抖更新显示
  useEffect(() => {
    if (cameraPosition) {
      debouncedSetDisplayPosition(cameraPosition);
    }
  }, [cameraPosition, debouncedSetDisplayPosition]);
  
  useEffect(() => {
    if (modelCenter) {
      debouncedSetDisplayCenter(modelCenter);
    }
  }, [modelCenter, debouncedSetDisplayCenter]);
  
  // 添加CSS类，可以通过CSS来平滑过渡
  const positionInfoStyle = useMemo<React.CSSProperties>(() => ({
    marginTop: '10px', 
    padding: '10px', 
    backgroundColor: '#f8f8f8', 
    borderRadius: '4px',
    transition: 'all 0.1s ease-out', // 添加过渡效果
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    maxWidth: '300px'
  }), []);

  const headerStyle = useMemo<React.CSSProperties>(() => ({
    margin: '0 0 8px', 
    fontSize: '14px', 
    fontWeight: 'bold',
    color: '#333'
  }), []);

  return (
    <div className="position-info" style={positionInfoStyle}>
      <h4 style={headerStyle}>位置信息</h4>
      <VectorDisplay label="相机位置" vector={displayCameraPosition} />
      <VectorDisplay label="模型中心" vector={displayModelCenter} />
      {scene && <ScenePanel scene={scene} />}
    </div>
  );
};

// 使用 memo 包装整个组件，避免父组件重新渲染时不必要的更新
export default memo(PositionInfo); 