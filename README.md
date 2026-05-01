# Stacklane（栈径）

> 企业级模型运行与交付平台 — Deploy faster. Route smarter. Operate with confidence.

**更快部署，更稳运行，更易治理。**

---

## 项目简介

Stacklane 是一个面向企业的 AI 云原生基础设施平台，用于统一管理模型部署、推理运行时、流量路由、资源容量、性能调优、权限治理与审计。基于 GPUStack 核心能力，重构为结构化、可治理、可审计、可交付的企业级产品。

### 核心特性

- **多集群 GPU 管理** — 统一调度多区域 GPU 资源池
- **可插拔推理引擎** — 支持 vLLM、llama.cpp、TensorRT-LLM、GPUStack 等运行时
- **模型部署向导** — 四步向导式部署，内置成本与风险预估
- **流量治理** — 金丝雀发布、蓝绿部署、滚动更新
- **容量可视化** — 资源热力图、容量矩阵、迁移建议
- **策略中心** — 配额管理、访问控制、弹性伸缩、路由规则
- **事件与审计** — 全链路操作追踪、变更记录
- **多租户** — 企业级租户隔离与权限管理
- **双语支持** — 完整中英文界面切换
- **实时监控** — Prometheus + Grafana 全栈可观测

---

## 系统架构

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              用户浏览器                                       │
│                         (React + TypeScript + MUI)                           │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │ HTTPS / WebSocket
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Nginx 反向代理                                     │
│                    (静态资源 + API 代理 + WS 代理)                            │
└──────────────┬──────────────────────────────────┬───────────────────────────┘
               │                                  │
               ▼                                  ▼
┌──────────────────────────┐       ┌──────────────────────────────────────────┐
│     Frontend (React)     │       │          Backend (Go + Gin)              │
│                          │       │                                          │
│  ┌────────────────────┐  │       │  ┌─────────────┐  ┌──────────────────┐  │
│  │  Dashboard 总览    │  │       │  │  Router     │  │  JWT Middleware  │  │
│  │  Services 服务    │  │       │  │  (Gin)      │  │  CORS Middleware │  │
│  │  Models 模型      │  │       │  └──────┬──────┘  └──────────────────┘  │
│  │  Capacity 容量    │  │       │         │                                │
│  │  Events 审计      │  │       │  ┌──────▼──────────────────────────────┐ │
│  │  Policies 策略    │  │       │  │         Handlers                    │ │
│  │  Deploy 部署向导  │  │       │  │  Auth | Dashboard | Service | Model │ │
│  │  i18n 双语       │  │       │  │  Cluster | Event | Policy           │ │
│  └────────────────────┘  │       │  └──────┬──────────────────────────────┘ │
│                          │       │         │                                │
│  Theme: #165DFF 主色     │       │  ┌──────▼──────┐  ┌──────────────────┐  │
│  MUI + Recharts          │       │  │  GORM ORM   │  │  WebSocket Hub   │  │
│                          │       │  └──────┬──────┘  └──────────────────┘  │
└──────────────────────────┘       └─────────┼────────────────────────────────┘
                                             │
                              ┌───────────────┼───────────────┐
                              │               │               │
                              ▼               ▼               ▼
                   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
                   │    MySQL     │  │    Redis     │  │  Prometheus  │
                   │   (数据持久化) │  │  (缓存/会话)  │  │   (监控采集)  │
                   └──────────────┘  └──────────────┘  └──────┬───────┘
                                                              │
                                                              ▼
                                                     ┌──────────────┐
                                                     │   Grafana    │
                                                     │  (可视化面板)  │
                                                     └──────────────┘
```

### 架构分层说明

| 层级 | 组件 | 说明 |
|------|------|------|
| 接入层 | Nginx | 反向代理、静态资源、HTTPS 终止、WebSocket 升级 |
| 展示层 | React + TypeScript + MUI | 企业级控制台 UI，主色 #165DFF |
| 网关层 | Gin Router + Middleware | 路由分发、JWT 鉴权、CORS、限流 |
| 业务层 | Handlers + Services | 核心业务逻辑：部署、服务、模型、集群、策略、审计 |
| 数据层 | GORM + MySQL | 持久化存储，支持自动迁移 |
| 缓存层 | Redis | 会话缓存、分布式锁、限流计数器 |
| 实时层 | WebSocket Hub | 实时事件推送、日志流 |
| 监控层 | Prometheus + Grafana + Node Exporter | 全栈可观测性 |

---

## 技术栈

| 分类 | 技术 | 版本 |
|------|------|------|
| **后端语言** | Go | 1.21+ |
| **Web 框架** | Gin | 1.9+ |
| **ORM** | GORM | 1.25+ |
| **认证** | JWT (golang-jwt) | v5 |
| **实时通信** | WebSocket (gorilla/websocket) | 1.5+ |
| **前端框架** | React | 18.2+ |
| **类型系统** | TypeScript | 5.3+ |
| **构建工具** | Vite | 5.0+ |
| **UI 组件库** | Material UI (MUI) | 5.15+ |
| **图表库** | Recharts | 2.10+ |
| **终端模拟** | Xterm.js | 5.3+ |
| **国际化** | i18next + react-i18next | 23+ |
| **数据库** | MySQL | 8.0 |
| **缓存** | Redis | 7+ |
| **反向代理** | Nginx | latest |
| **监控采集** | Prometheus | latest |
| **监控面板** | Grafana | latest |
| **节点监控** | Node Exporter | latest |
| **容器化** | Docker + Docker Compose | latest |
| **推理引擎** | vLLM / GPUStack / llama.cpp | - |

---

## 项目结构

```
stacklane/
├── backend/                    # Go 后端
│   ├── cmd/
│   │   └── main.go           # 入口文件
│   ├── internal/
│   │   ├── config/           # 配置管理
│   │   ├── handler/          # HTTP 处理器
│   │   │   ├── auth.go       # 认证（登录/注册）
│   │   │   ├── dashboard.go  # 仪表盘统计
│   │   │   ├── service.go    # 服务管理
│   │   │   ├── models.go     # 模型管理
│   │   │   ├── cluster.go    # 集群与节点
│   │   │   └── events.go     # 事件与策略
│   │   ├── middleware/       # 中间件
│   │   │   └── auth.go       # JWT + CORS
│   │   ├── model/            # 数据模型
│   │   │   └── models.go     # GORM 模型定义
│   │   ├── router/           # 路由注册
│   │   └── ws/               # WebSocket
│   ├── Dockerfile
│   └── go.mod
├── frontend/                   # React 前端
│   ├── src/
│   │   ├── components/       # 通用组件
│   │   ├── pages/            # 页面
│   │   │   ├── Dashboard.tsx # 运营总览
│   │   │   ├── Services.tsx  # 服务实例
│   │   │   ├── Models.tsx    # 模型资产
│   │   │   ├── Capacity.tsx  # 容量与集群
│   │   │   ├── Events.tsx    # 事件与审计
│   │   │   ├── Policies.tsx  # 策略与治理
│   │   │   ├── DeployWizard.tsx # 部署向导
│   │   │   └── Login.tsx     # 登录页
│   │   ├── layouts/          # 布局
│   │   │   └── MainLayout.tsx # 主布局（侧栏+顶栏）
│   │   ├── services/         # API 服务
│   │   ├── i18n/             # 国际化（中/英）
│   │   ├── theme/            # MUI 主题
│   │   └── hooks/            # 自定义 Hooks
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── monitoring/                 # 监控配置
│   └── prometheus.yml
├── docker-compose.yml          # 一键部署
├── .gitignore
└── README.md
```

---

## 快速开始

### 环境要求

- Docker 20.10+
- Docker Compose 2.0+
- （可选）Go 1.21+，Node.js 20+（本地开发）

### 一键部署

```bash
# 克隆项目
git clone https://github.com/your-org/stacklane.git
cd stacklane

# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps
```

启动后访问：
- **前端控制台**: http://localhost
- **API 服务**: http://localhost:8080
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin123)

### 本地开发

```bash
# 后端
cd backend
go mod tidy
go run cmd/main.go

# 前端
cd frontend
npm install
npm run dev
```

---

## API 概览

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/v1/auth/login` | 用户登录 |
| POST | `/api/v1/auth/register` | 用户注册 |
| GET | `/api/v1/dashboard/stats` | 仪表盘统计 |
| GET | `/api/v1/dashboard/alerts` | 活跃告警 |
| GET | `/api/v1/services` | 服务列表 |
| POST | `/api/v1/services` | 创建服务 |
| GET | `/api/v1/models` | 模型列表 |
| GET | `/api/v1/clusters` | 集群列表 |
| GET | `/api/v1/nodes` | 节点列表 |
| GET | `/api/v1/events` | 事件列表 |
| GET | `/api/v1/policies` | 策略列表 |
| GET | `/api/v1/health` | 健康检查 |
| WS | `/ws` | WebSocket 实时推送 |

---

## 信息架构

基于产品重设计方案，导航按管理对象与用户任务组织：

| 模块 | 英文 | 说明 |
|------|------|------|
| 总览 | Overview | KPI 卡片、运行时分布、服务健康、告警、成本趋势 |
| 运行时 | Runtimes | 推理引擎管理（vLLM / llama.cpp / TensorRT） |
| 模型资产 | Models | 模型注册、版本管理、格式兼容 |
| 服务实例 | Services | 已部署服务、状态监控、端点管理 |
| 流量与路由 | Traffic | 请求路由、负载均衡、限流策略 |
| 容量与集群 | Capacity | GPU 节点、集群拓扑、容量矩阵 |
| 策略与治理 | Policies | 配额、访问控制、弹性伸缩、审批流 |
| 租户与权限 | Tenants | 多租户隔离、RBAC 角色管理 |
| 事件与审计 | Events | 操作日志、变更追踪、告警历史 |
| 集成中心 | Integrations | 外部系统对接、Webhook、API Key |
| 系统设置 | System | 平台配置、许可证、通知设置 |

---

## 设计原则

1. **去 AI 味** — 拒绝霓虹渐变、对话框首页、机器人图标，采用企业级控制台风格
2. **数据驱动** — 首屏以状态与指标为先，高信息密度
3. **状态语义** — 颜色服务于状态（成功/警告/错误/信息），而非装饰
4. **结构清晰** — 左侧导航 + 顶部状态栏 + 主内容区
5. **可审计** — 所有关键操作可追踪、可回溯

### 视觉规范

| 属性 | 值 |
|------|------|
| 主色 | `#165DFF` |
| 成功色 | `#00B42A` |
| 警告色 | `#FF7D00` |
| 错误色 | `#F53F3F` |
| 中文字体 | PingFang SC / HarmonyOS Sans SC |
| 英文字体 | Inter |
| 等宽字体 | JetBrains Mono |
| 圆角 | 8px（卡片/输入框），10px（弹层）|

---

## 部署架构图

```
                    ┌─────────────────────────────────────┐
                    │         Docker Compose               │
                    │                                     │
                    │  ┌─────────┐     ┌──────────────┐  │
                    │  │ Frontend│────▶│   Nginx:80   │  │
                    │  │ (React) │     └──────┬───────┘  │
                    │  └─────────┘            │          │
                    │                         │ proxy    │
                    │  ┌──────────────────────▼───────┐  │
                    │  │     Backend (Go):8080        │  │
                    │  │     Gin + GORM + JWT + WS    │  │
                    │  └───┬──────────┬──────────┬────┘  │
                    │      │          │          │       │
                    │  ┌───▼───┐  ┌───▼───┐  ┌──▼────┐  │
                    │  │ MySQL │  │ Redis │  │Prometh│  │
                    │  │ :3306 │  │ :6379 │  │ :9090 │  │
                    │  └───────┘  └───────┘  └───┬───┘  │
                    │                            │       │
                    │                        ┌───▼───┐   │
                    │                        │Grafana│   │
                    │                        │ :3001 │   │
                    │                        └───────┘   │
                    └─────────────────────────────────────┘
```

---

## 许可证

MIT License

---

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交代码 (`git commit -m 'feat: add amazing feature'`)
4. 推送分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

---

## 联系方式

- **项目名称**: Stacklane（栈径）
- **定位**: AI 云原生基础设施 — 企业级模型运行平台
- **版本**: V1.0
- **日期**: 2026-05-01
