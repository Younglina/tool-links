# 工具集 - 本地化网站管理平台

一个纯前端的网站集合管理工具，支持本地数据存储、完整的CRUD操作、json数据格式的导入导出，可打包作为 Chrome 扩展使用。

## 功能特性

### 核心功能
- ✅ **网站管理**：完整的增删改查功能
- ✅ **图片上传**：支持上传网站图标（存储到IndexedDB）
- ✅ **APIKeys管理**：支持多个APIKeys，脱敏显示，一键复制
- ✅ **分类系统**：支持自定义分类（带图标选择）
- ✅ **标签系统**：支持自定义标签，多维度筛选
- ✅ **搜索功能**：支持按网站名称、描述、URL搜索
- ✅ **本地存储**：所有数据存储在浏览器IndexedDB中，无需服务器
- ✅ **导入导出**：支持 JSON 格式的数据导入导出
- ✅ **远程同步**：支持通过 GitHub Gist 进行数据加密同步

## 技术栈

- **框架**：Vue 3 (Composition API + `<script setup>`)
- **语言**：TypeScript（宽松模式）
- **构建工具**：Vite
- **样式**：Tailwind CSS
- **数据库**：Dexie.js (IndexedDB封装)
- **图标**：Material Design Icons
- **状态管理**：Pinia

## 快速开始

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

访问 http://localhost:3000

### 构建 Chrome 扩展

注意修改 `vite.config.ts` 中的 `base` 为 `/` ,构建完成后，`dist` 目录包含完整的 Chrome 扩展文件。

## 安装 Chrome 扩展

1. 打开 Chrome，访问 `chrome://extensions/`
2. 开启右上角的 **开发者模式**
3. 点击 **加载已解压的扩展程序**
4. 选择项目的 `dist` 文件夹

点击扩展图标即可打开工具集。

## 项目结构

```
links/
├── src/
│   ├── components/          # 组件
│   │   ├── layouts/        # 布局组件
│   │   │   ├── Header.vue
│   │   │   ├── Sidebar.vue
│   │   │   └── MainContent.vue
│   │   ├── website/       # 网站相关组件
│   │   │   ├── WebsiteCard.vue
│   │   │   ├── WebsiteDetailDrawer.vue
│   │   │   ├── WebsiteForm.vue
│   │   │   ├── ImageUploader.vue
│   │   │   └── ApiKeyInput.vue
│   │   ├── filter/        # 筛选组件
│   │   │   ├── SearchBar.vue
│   │   │   ├── CategoryFilter.vue
│   │   │   └── TagFilter.vue
│   │   └── common/        # 通用组件
│   │       ├── ThemeSwitcher.vue
│   │       ├── CategoryDialog.vue
│   │       └── TagDialog.vue
│   ├── composables/        # 组合式函数
│   │   ├── useDexie.ts
│   │   ├── useWebsites.ts
│   │   ├── useCategories.ts
│   │   ├── useTags.ts
│   │   ├── useImageUpload.ts
│   │   ├── useApiKey.ts
│   │   └── useTheme.ts
│   ├── db/                 # 数据库
│   │   ├── index.ts        # Dexie实例
│   │   └── seed.ts         # 预置数据
│   ├── stores/             # Pinia状态管理
│   │   └── app.ts
│   ├── types/              # TypeScript类型定义
│   │   └── index.ts
│   ├── utils/              # 工具函数
│   │   ├── validators.ts
│   │   ├── formatters.ts
│   │   └── constants.ts
│   └── styles/             # 样式文件
│       ├── main.css
│       └── themes/
│           └── neumorphism.css
├── public/
│   ├── background.js       # Chrome 扩展 background script
│   └── tools.png           # 扩展图标
├── manifest.json           # Chrome 扩展配置
├── vite.config.js          # Vite 配置
├── pack.bat                # Windows 打包脚本
└── pack.sh                 # Linux/Mac 打包脚本
```

## 使用说明

### 添加网站
1. 点击右上角"添加"下拉菜单，选择"添加网站"
2. 填写网站信息：
   - 名称（必填）
   - URL（必填）
   - 图标（推荐128-256px，<500KB）
   - 描述
   - 分类（必填）
   - 标签（多选）
   - APIKeys（可选，可添加多个）
3. 点击"添加"保存

### 管理网站
- 点击网站卡片查看详情
- 详情中可以查看APIKeys（脱敏显示）
- 支持复制完整APIKey
- 支持编辑和删除网站

### 筛选网站
- 使用左侧分类导航筛选
- 使用标签复选框多选筛选
- 使用顶部搜索栏搜索

### 导入导出数据
点击右上角"添加"下拉菜单：
- **导出数据**：下载当前所有数据的 JSON 文件
- **导入数据**：选择 JSON 文件导入，支持合并或替换模式

### 远程同步
点击右上角"添加"下拉菜单，选择"远程同步"：
1. **配置 GitHub Token**：
   - 输入 GitHub Personal Access Token（需要 gist 权限）
   - 点击"验证 Token"按钮验证
   - Token 会保存在 localStorage 中

2. **设置加密密码**：
   - 输入加密密码（至少8位）
   - 确认密码需要与密码一致
   - 密码不会保存到本地，请务必记住！

3. **上传到 Gist**：
   - 首次上传会自动创建一个新的私有 Gist
   - 后续上传会更新已存在的 Gist
   - 所有数据（网站、分类、标签）都会被上传

4. **从 Gist 下载**：
   - 下载远程数据并与本地数据合并
   - 合并策略：按 ID 合并，保留更新时间较新的数据
   - 下载后会自动显示同步摘要

5. **无痕模式/手动指定**：
   - 如果在无痕模式下使用，可以手动输入 Gist ID
   - Gist ID 可从 Gist 页面 URL 中获取（例如：`https://gist.github.com/username/abc123def456` 中的 `abc123def456`）
   - 点击"使用此 Gist"按钮后即可下载

6. **安全说明**：
   - 所有数据使用 AES-256-GCM 加密后再上传到 Gist
   - 即使有人获取到 Gist 内容也无法解密（不知道密码）
   - 密码用于加密/解密，请妥善保管

## 数据存储

所有数据存储在浏览器的IndexedDB中：
- `SitesDB` 数据库名
- 包含3个表：websites, categories, tags
- 数据只在本地，不会上传到任何服务器

## 注意事项

1. **图片大小**：建议上传的图标小于500KB，推荐128-256px
2. **APIKey安全**：APIKeys存储在本地IndexedDB中，请妥善保管浏览器数据
3. **数据备份**：定期导出数据作为备份
4. **浏览器兼容性**：支持现代浏览器（Chrome, Firefox, Safari, Edge）
5. **远程同步**：
   - 密码请务必记住，丢失密码将无法解密数据
   - 建议在无痕模式下使用时，记录下 Gist ID 以便下次使用
   - 加密数据存储在私有 Gist 中，只有你能访问

## 许可证

MIT License
