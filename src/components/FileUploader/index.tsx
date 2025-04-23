import React from 'react';
import { Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import './style.css';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect }) => {
  return (
    <div className="file-upload-header">
      <h2>上传模型</h2>
      <Upload
        accept=".gltf,.glb"
        showUploadList={false}
        beforeUpload={(file) => {
          onFileSelect(file);
          return false;
        }}
      >
        <Button icon={<UploadOutlined />}>选择文件</Button>
      </Upload>
    </div>
  );
};

export default FileUploader;