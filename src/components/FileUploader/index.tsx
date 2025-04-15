import React, { useState, useCallback } from 'react';
import { Html } from '@react-three/drei';
import './styles.css';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.gltf') || file.name.endsWith('.glb')) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.gltf') || file.name.endsWith('.glb')) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);

  return (
    <div className="file-uploader-container">
      <div 
        className={`file-drop-zone ${isDragging ? 'dragging' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="file-upload-content">
          <div className="upload-icon-container">
            <svg className="upload-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
            </svg>
          </div>
          <p className="upload-text">拖放 GLTF/GLB 文件至此处</p>
          <p className="upload-subtext">或点击下方按钮选择文件</p>
          {selectedFile && (
            <div className="selected-file-info">
              <p className="selected-file-name">{selectedFile.name}</p>
              <p className="selected-file-size">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}
          <input 
            type="file" 
            accept=".gltf,.glb" 
            onChange={handleFileChange} 
            className="file-input"
            id="fileInput"
          />
          <label htmlFor="fileInput" className="file-input-label">
            选择文件
          </label>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;