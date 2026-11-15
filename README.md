# Yucheng Fan 个人学术主页

纯静态网站（HTML + CSS + JavaScript，无任何依赖），可直接部署到 GitHub Pages。

## 目录结构

```
index.html              页面内容（中英文文案都在这里，data-en / data-zh 属性）
assets/css/style.css    样式（米色简洁风格）
assets/js/data.js       论文列表（增删论文只改这个文件）
assets/js/main.js       交互逻辑（论文筛选、图片放大、中英文切换）
assets/img/pubs/        论文图片
assets/img/avatar.jpg   头像
```

## 常见修改

- **换头像**：把照片命名为 `avatar.jpg` 放到 `assets/img/`。
- **加论文**：在 `assets/js/data.js` 中按现有格式加一条；若有配图，把图片放到 `assets/img/pubs/` 并在 `image` 字段填文件名。
- **更新引用数**：修改 `index.html` 中 `class="metrics"` 里的数字。
- **代表性研究**：首页两张大图卡片写在 `index.html` 的 Selected research 部分。
- **补充教育经历 / 获奖**：在 `index.html` 的 Experience、Honours 部分按现有格式添加。

## 本地预览

```bash
npx http-server -p 8765 .
```

然后打开 http://localhost:8765 。也可以直接双击 `index.html`。

## 部署到 GitHub Pages

1. 在 GitHub 新建公开仓库，命名为 `YuchengFan99.github.io`。
2. 把本文件夹推送到该仓库的 `main` 分支。
3. 稍等一两分钟，访问 https://yuchengfan99.github.io 。
