# Getting Started

- Hit run
- Edit [App.tsx](#src/App.tsx) and watch it live update!

## 项目结构

项目使用 Router + Layout 结构：

```
src/
├── layouts/          # 布局组件
│   ├── MainLayout.tsx     # 主布局（包含header和footer）
│   └── MainLayout.css
├── pages/            # 页面组件
│   ├── Home.tsx           # 首页
│   └── About.tsx          # 关于页面
├── router/           # 路由配置
│   └── index.tsx           # 路由定义
├── components/       # 通用组件
├── locales/          # 国际化
├── api/              # API接口
│   ├── index.ts           # API统一导出
│   └── example.ts         # API使用示例
├── utils/            # 工具函数
│   ├── request.ts         # Axios请求封装
│   └── README.md          # 使用说明
├── env.d.ts          # 环境变量类型定义
└── App.tsx           # 应用入口（Router Provider）
```

### 添加新页面

1. 在 `src/pages/` 创建新页面组件
2. 在 `src/router/index.tsx` 添加路由配置
3. 在 `src/layouts/MainLayout.tsx` 添加导航链接（可选）

## 环境变量配置

项目支持多环境配置，通过 `.env` 文件管理：

- `.env.example` - 环境变量示例模板
- `.env.development` - 开发环境配置
- `.env.production` - 生产环境配置
- `.env` - 本地开发配置（不提交到 git）

### 使用环境变量

在代码中使用：`import.meta.env.VITE_API_BASE_URL`

在 `.env` 文件中定义：`VITE_API_BASE_URL=http://localhost:3000`

⚠️ **注意**：所有环境变量必须以 `VITE_` 开头

## API 请求配置

项目已集成 Axios 并进行了封装，使用前请查看：

- [API 使用说明](src/utils/README.md)
- [示例代码](src/api/example.ts)

### 快速开始

```typescript
import { get, post } from "@/utils/request";

// GET 请求
const data = await get("/api/users");

// POST 请求
const result = await post("/api/login", { username, password });
```

# Learn More

You can learn more in the [Base Extension Development Guide](https://lark-technologies.larksuite.com/docx/HvCbdSzXNowzMmxWgXsuB2Ngs7d) or [多维表格扩展脚本开发指南](https://feishu.feishu.cn/docx/U3wodO5eqome3uxFAC3cl0qanIe).

## Install packages

Install packages in Shell pane or search and add in Packages pane.

## Publish

Please npm run build first, submit it together with the dist directory, and then fill in the form:
[Share form](https://feishu.feishu.cn/share/base/form/shrcnGFgOOsFGew3SDZHPhzkM0e)

## 发布

请先 npm run build，连同 dist 目录一起提交，然后再填写表单：
[共享表单](https://feishu.feishu.cn/share/base/form/shrcnGFgOOsFGew3SDZHPhzkM0e)
