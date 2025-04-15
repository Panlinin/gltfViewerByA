import React, { useState, useMemo, useCallback, useRef, memo } from 'react';
import FileUploader from './components/FileUploader';
import ModelViewer from './components/ModelViewer';
import ModelLoader from './components/ModelLoader';
import PositionInfo from './components/PositionInfo';
import * as THREE from 'three';
import './App.css';

// 创建一个空的模型占位符组件
const EmptyModel: React.FC<{onModelLoad?: (center: THREE.Vector3, size: THREE.Vector3) => void}> = () => {
  return null;
};

// 文件信息显示组件
const FileInfoDisplay = memo<{file: File}>(({ file }) => {
  return (
    <div className="file-info">
      <p>文件名: {file.name}</p>
      <p>文件大小: {(file.size / 1024).toFixed(2)} KB</p>
    </div>
  );
});

// 应用主组件
const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [cameraPosition, setCameraPosition] = useState<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const [modelCenter, setModelCenter] = useState<THREE.Vector3 | undefined>(undefined);
  
  // 使用 useMemo 缓存 fileUrl
  const fileUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  // 使用 useCallback 缓存 setFile 函数
  const handleFileSelect = useCallback((selectedFile: File) => {
    setFile(selectedFile);
    // 重置模型中心位置
    setModelCenter(undefined);
  }, []);

  // 直接处理相机位置变化 - 这是实时更新的
  const handleCameraPositionChange = useCallback((position: THREE.Vector3) => {
    setCameraPosition(position);
  }, []);

  // 处理模型中心位置变化
  const handleModelCenterChange = useCallback((center: THREE.Vector3) => {
    setModelCenter(center);
  }, []);

  // 确定要渲染的模型组件
  const modelComponent = useMemo(() => {
    if (file && fileUrl) {
      return <ModelLoader fileUrl={fileUrl} />;
    }
    return <EmptyModel />;
  }, [file, fileUrl]);

  // 决定是否显示位置信息面板
  const showPositionInfo = !!file;

  // 使用useMemo缓存UI部分，减少不必要的重渲染
  const fileUploadSection = useMemo(() => (
    <section className="file-upload-section">
      <FileUploader onFileSelect={handleFileSelect} />
      {file && <FileInfoDisplay file={file} />}
      {showPositionInfo && <PositionInfo modelCenter={modelCenter} cameraPosition={cameraPosition} />}
    </section>
  ), [file, modelCenter, cameraPosition, handleFileSelect, showPositionInfo]);

  const modelViewerSection = useMemo(() => (
    <section className="model-viewer-section">
      <ModelViewer 
        onCameraPositionChange={handleCameraPositionChange}
        onModelCenterChange={handleModelCenterChange}
      >
        {modelComponent}
      </ModelViewer>
    </section>
  ), [modelComponent, handleCameraPositionChange, handleModelCenterChange]);

  const footerSection = useMemo(() => (
    <footer className="app-footer">
      <p>GLTF查看器 &copy; {new Date().getFullYear()}</p>
    </footer>
  ), []);

  return (
    <div className="app-container">
      <main className="app-main">
        {fileUploadSection}
        {modelViewerSection}
      </main>
      {footerSection}
    </div>
  );
};

export default memo(App);