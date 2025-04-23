# GLTF 模型查看器

这是一个基于 React 和 Three.js 构建的 GLTF 模型查看器，支持查看和交互式操作 3D 模型。

## 功能特点

- 支持上传和预览 GLTF/GLB 格式的 3D 模型
- 实时显示模型和相机位置信息
- 流畅的 3D 模型渲染和交互体验
- 响应式设计，适配不同屏幕尺寸

## 技术栈

- React 18
- TypeScript
- Three.js
- Ant Design
- Vite

## 项目结构

```
src/
├── components/          # 组件目录
│   ├── ModelLoader/    # 模型加载器组件
│   ├── ModelViewer/    # 模型查看器组件
│   ├── OptimizedCanvas/# 优化后的画布组件
│   ├── PositionInfo/   # 位置信息显示组件
│   └── FileUploader/   # 文件上传组件
├── utils/              # 工具函数
├── types/              # 类型定义
└── styles/             # 样式文件
```

## 安装和运行

1. 安装依赖：
```bash
yarn install
```

2. 启动开发服务器：
```bash
yarn start
```

3. 构建生产版本：
```bash
yarn build
```

## 使用说明

1. 点击"选择文件"按钮上传 GLTF/GLB 格式的 3D 模型文件
2. 模型加载完成后，可以使用鼠标进行以下操作：
   - 左键拖动：旋转模型
   - 右键拖动：平移模型
   - 滚轮：缩放模型
3. 右侧面板会实时显示模型和相机的位置信息

## 开发计划

- [ ] 添加模型动画控制
- [ ] 支持更多 3D 模型格式
- [ ] 添加模型材质编辑功能
- [ ] 实现模型导出功能
- [ ] 添加性能优化选项

## 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进这个项目。

## 许可证

MIT License
