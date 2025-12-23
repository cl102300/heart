# Beating Heart — 跳动爱心动画

一个使用 Vite + React 构建的跳动爱心动画项目，带有背景音乐和温馨标签提示。

## ✨ 功能特性

- 💖 流畅的跳动爱心动画
- 🎵 背景音乐播放（支持 FLAC/MP3/OGG）
- 📱 完美适配手机端显示
- 🎨 多彩标签提示（每0.5秒出现一个）
- 🌈 24种颜色方案
- 📱 响应式设计，支持各种屏幕尺寸

## 🚀 本地运行

1. 安装依赖：
```bash
npm install
```

2. 启动开发服务器：
```bash
npm run dev
```

3. 在浏览器中打开显示的本地地址（通常是 `http://localhost:3000`）

4. 在手机上测试：确保手机和电脑在同一网络，使用电脑的 IP 地址访问（如 `http://192.168.1.100:3000`）

## 📦 构建生产版本

```bash
npm run build
```

构建完成后，文件会在 `dist` 目录中。

## 🌐 部署到公网

### 快速部署（推荐使用 Vercel）

**详细部署步骤请查看 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**

#### 方法一：Vercel 一键部署（最简单）

1. **创建 GitHub 仓库**
   - 访问 [GitHub](https://github.com) 并登录
   - 创建新仓库并上传代码

2. **部署到 Vercel**
   - 访问 [Vercel](https://vercel.com)
   - 使用 GitHub 账号登录
   - 点击 "Add New Project"
   - 选择你的仓库
   - 配置：
     - Framework Preset: `Vite`
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - 点击 "Deploy"

3. **获取公网地址**
   - 部署完成后会得到一个类似 `https://your-project.vercel.app` 的地址
   - 这个地址可以在任何设备（包括手机）上访问！

#### 方法二：Netlify 部署

类似 Vercel，访问 [Netlify](https://www.netlify.com) 并按照提示操作。

#### 方法三：GitHub Pages

详见 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

## 📝 注意事项

- **音乐文件**：确保 `public/your-song.flac` 文件存在
- **文件大小**：项目已优化为按需加载（`preload="metadata"`），即使文件较大（30MB+）也不会影响页面初始加载。如果手机端测试体验良好，无需额外优化
- **移动端**：某些移动浏览器需要用户点击才能播放音频，项目已包含"播放"按钮
- **字符编码**：项目已优化中文显示，支持移动端
- **音频优化**：如需进一步优化音频文件大小，可参考 `AUDIO_OPTIMIZATION.md`（可选）

## 🔧 技术栈

- React 18
- Vite 5
- Canvas API（用于动画）
- HTML5 Audio API（用于音乐播放）

## 📱 移动端优化

- ✅ 响应式布局
- ✅ 触摸事件支持
- ✅ 中文字体优化
- ✅ 移动端性能优化
- ✅ 安全区域适配

## 📄 许可证

MIT License

## 🙏 致谢

感谢使用这个项目！如有问题或建议，欢迎提交 Issue。
