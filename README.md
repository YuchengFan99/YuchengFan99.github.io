# Yucheng Fan 个人学术主页

纯静态网站（HTML + CSS + JavaScript，无任何依赖），可直接部署到 GitHub Pages。

## 目录结构

```
index.html              页面内容（中英文文案都在这里，data-en / data-zh 属性）
assets/css/style.css    样式（深色 / 浅色主题）
assets/js/data.js       论文列表（增删论文只改这个文件）
assets/js/main.js       交互逻辑（筛选、搜索、动画、语言切换）
assets/img/pubs/        论文图片
assets/img/avatar.jpg   头像（放入后自动显示，不放则显示 YF 字母头像）
```

## 常见修改

- **换头像**：把照片命名为 `avatar.jpg` 放到 `assets/img/`。
- **加论文**：在 `assets/js/data.js` 中按现有格式加一条；若有配图，把图片放到 `assets/img/pubs/` 并在 `image` 字段填文件名。第一作者为 `Yucheng Fan` 的论文若带图片，会自动出现在“代表作”区域。
- **更新引用数**：修改 `index.html` 中 `data-count="774"` 等数字。
- **加邮箱按钮**：在 `index.html` 的 Contact 部分取消注释并填入邮箱。
- **补充教育经历 / 获奖**：在 `index.html` 的时间线部分（有 TODO 注释）按现有格式添加。

## 本地预览

```bash
npx http-server -p 8765 .
```

然后打开 http://localhost:8765 。也可以直接双击 `index.html`。

## 部署到 GitHub Pages

1. 在 GitHub 新建公开仓库，命名为 `Deepcomposite.github.io`。
2. 把本文件夹推送到该仓库的 `main` 分支。
3. 稍等一两分钟，访问 https://deepcomposite.github.io 。
