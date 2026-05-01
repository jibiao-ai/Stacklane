# Stacklane (栈径) - 企业级 AI 模型运行平台

> AI 云原生基础设施 | Enterprise Model Runtime Platform

## 产品定位

Stacklane 是基于 GPUStack 构建的企业级 AI 模型运行平台，提供从 GPU 资源管理到模型全生命周期管理的完整解决方案。平台深度集成 GPUStack、vLLM、llama.cpp、TensorRT-LLM 等推理引擎，实现模型的高效调度、部署和治理。

### 核心能力

| 能力 | 说明 |
|------|------|
| 接入快 | 模型目录 + HuggingFace 一键导入，多引擎格式自动适配 |
| 跑得稳 | GPUStack 多节点编排，自动故障转移，健康巡检 |
| 跑得省 | GPU 资源池化，利用率可视化，自动调度与容量规划 |
| 管得住 | 策略中心 + 审计事件 + 多租户隔离，全链路可追溯 |

---

## 系统架构

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Stacklane Platform                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────┐   ┌─────────────────────────────────────────────────┐ │
│  │ Browser │──▶│          Nginx (Reverse Proxy)                  │ │
│  └─────────┘   └────────┬──────────────────────────┬────────────┘ │
│                          │                          │              │
│                          ▼                          ▼              │
│  ┌──────────────────────────────┐  ┌───────────────────────────┐  │
│  │     Frontend (React/TS)      │  │    Backend API (Go/Gin)   │  │
│  │  ┌─────────────────────────┐ │  │  ┌─────────────────────┐  │  │
│  │  │ Dashboard / GPU Mgmt    │ │  │  │ GPU Handler         │  │  │
│  │  │ Model Lifecycle         │ │  │  │ Model Handler       │  │  │
│  │  │ Runtime Hub             │ │  │  │ Runtime Handler     │  │  │
│  │  │ Service Management      │ │  │  │ GPUStack Client     │  │  │
│  │  │ Deploy Wizard           │ │  │  │ Auth / JWT          │  │  │
│  │  │ Integrations            │ │  │  │ WebSocket Hub       │  │  │
│  │  └─────────────────────────┘ │  │  └─────────────────────┘  │  │
│  └──────────────────────────────┘  └──────────┬────────────────┘  │
│                                                │                   │
│                    ┌───────────────────────────┼──────────────┐    │
│                    │                           │              │    │
│                    ▼                           ▼              ▼    │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌─────────┐ │
│  │      MySQL 8.0       │  │    Redis (Cache)     │  │   WS    │ │
│  │  (Models, Nodes,     │  │  (Sessions, Metrics) │  │(Realtime)│ │
│  │   GPU, Policies...)  │  │                      │  │         │ │
│  └──────────────────────┘  └──────────────────────┘  └─────────┘ │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│                     External Integrations                           │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                    GPUStack (GPU 编排层)                       │ │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐ │ │
│  │  │ Worker 01  │  │ Worker 02  │  │    Worker 03           │ │ │
│  │  │ 8x A100    │  │ 8x A100    │  │    8x H100            │ │ │
│  │  │ vLLM       │  │ vLLM       │  │    vLLM + multi-node   │ │ │
│  │  └────────────┘  └────────────┘  └────────────────────────┘ │ │
│  │  ┌────────────┐                                              │ │
│  │  │ Worker 04  │  API: /api/v1/workers, /api/v1/models       │ │
│  │  │ 4x L40S    │  Auto-scheduling, Resource Pooling          │ │
│  │  │ llama-box  │                                              │ │
│  │  └────────────┘                                              │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Prometheus     │  │    Grafana      │  │  Node Exporter  │  │
│  │   (Metrics)      │  │  (Dashboards)   │  │  (System Info)  │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                    │
│  ┌─────────────────┐                                              │
│  │   Dify (预留)    │  LLM Application Platform Integration      │
│  └─────────────────┘                                              │
└────────────────────────────────────────────────────────────────────┘
```

---

## 核心模块

### 1. GPU 管理 (GPU Management)

- **节点管理**: 多集群 GPU Worker 节点注册、监控、调度
- **设备监控**: 每张 GPU 卡的 VRAM、利用率、温度、功耗实时监控
- **资源池**: 按 GPU 型号汇总资源池（A100/H100/L40S），支持容量预警
- **GPUStack 同步**: 定期从 GPUStack API 同步 Worker/GPU 状态
- **调度信息**: 为部署向导提供可用 GPU 资源查询

### 2. 模型管理 (Model Lifecycle)

- **模型目录**: 注册/导入模型资产，支持 HuggingFace 一键导入
- **版本控制**: 多版本管理（safetensors/gguf/awq/gptq），支持量化版本
- **兼容性矩阵**: 模型格式 × 推理引擎兼容性自动匹配
- **部署管理**: 模型部署到指定集群/引擎，跟踪部署状态
- **GPUStack 集成**: 从 GPUStack 同步已部署模型状态

### 3. 推理引擎 (Runtime Hub)

| 引擎 | 版本 | 特性 | 支持格式 |
|------|------|------|----------|
| vLLM | 0.6.4 | Continuous Batching, PagedAttention, Tensor Parallelism | safetensors, awq, gptq |
| GPUStack | 0.4.1 | 多节点编排, 异构GPU调度, 自动扩缩容 | safetensors, gguf, awq |
| llama.cpp | b4547 | CPU推理, 极致量化, 低显存占用 | gguf |
| TensorRT-LLM | 0.12.0 | NVIDIA优化, InFlight Batching, FP8 | safetensors, engine |

### 4. GPUStack 集成

- **API 代理**: 完整代理 GPUStack `/api/v1/workers`, `/api/v1/models`, `/api/v1/model-instances`
- **定时同步**: 每 30 秒自动同步 Worker 节点和 GPU 设备状态
- **模型部署**: 通过 GPUStack 调度模型到合适 GPU
- **资源汇总**: 聚合计算集群级 GPU 资源概览

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 后端 | Go 1.21+, Gin, GORM, JWT, WebSocket |
| 前端 | React 18+, TypeScript 5.3+, Vite, Material UI 5, Recharts |
| 数据库 | MySQL 8.0 |
| 缓存 | Redis 7 (可选) |
| 推理引擎 | vLLM, GPUStack, llama.cpp (llama-box), TensorRT-LLM |
| GPU 编排 | GPUStack (多节点 GPU 集群管理) |
| 反向代理 | Nginx |
| 监控 | Prometheus, Grafana, Node Exporter |
| 部署 | Docker, Docker Compose |
| 终端 | Xterm.js |
| 国际化 | i18next (中/英双语) |

---

## 项目结构

```
stacklane/
├── backend/
│   ├── cmd/main.go                   # 入口: 初始化 DB, GPUStack Client, Router
│   ├── internal/
│   │   ├── config/config.go          # 环境变量配置
│   │   ├── gpustack/                 # GPUStack 集成层
│   │   │   ├── client.go            # GPUStack API Client (Workers/Models/Instances)
│   │   │   └── sync.go             # 定时同步服务 (Worker/GPU/Model)
│   │   ├── handler/
│   │   │   ├── gpu.go              # GPU 管理 + GPUStack 代理 + Runtime Hub
│   │   │   ├── models.go           # 模型全生命周期 (导入/版本/部署/兼容性)
│   │   │   ├── service.go          # 服务 CRUD
│   │   │   ├── dashboard.go        # 仪表盘 KPI
│   │   │   ├── cluster.go          # 集群/节点
│   │   │   ├── events.go           # 事件审计 + 策略
│   │   │   └── auth.go             # JWT 认证
│   │   ├── middleware/auth.go       # JWT + CORS 中间件
│   │   ├── model/
│   │   │   ├── models.go           # 核心数据模型
│   │   │   └── gpu_models.go       # GPU/Runtime/ModelVersion/Deployment 模型
│   │   ├── router/router.go         # 路由注册 (GPU/Model/Runtime/GPUStack)
│   │   └── ws/websocket.go          # WebSocket 实时推送
│   ├── go.mod
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx        # 平台概览
│   │   │   ├── GPUManagement.tsx    # GPU 资源管理 (节点/设备/资源池)
│   │   │   ├── ModelManagement.tsx  # 模型管理 (目录/版本/兼容性)
│   │   │   ├── Runtimes.tsx         # 推理引擎管理
│   │   │   ├── Services.tsx         # 服务管理
│   │   │   ├── Integrations.tsx     # 集成管理 (GPUStack/Dify/Prometheus)
│   │   │   ├── DeployWizard.tsx     # 部署向导
│   │   │   ├── Capacity.tsx         # 容量规划
│   │   │   ├── Events.tsx           # 事件审计
│   │   │   ├── Policies.tsx         # 策略中心
│   │   │   └── Login.tsx            # 登录
│   │   ├── layouts/MainLayout.tsx   # 主布局 (侧边栏 + 顶栏)
│   │   ├── services/api.ts          # API 服务层
│   │   ├── i18n/                    # 国际化 (中/英)
│   │   └── theme/theme.ts           # MUI 主题 (主色 #165DFF)
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml               # 全栈部署 (含 GPUStack 环境变量)
├── monitoring/prometheus.yml         # Prometheus 配置
└── README.md
```

---

## 快速开始

### Docker 一键部署

```bash
# 克隆项目
git clone https://github.com/jibiao-ai/Stacklane.git
cd Stacklane

# 配置 GPUStack 连接 (可选 - 无配置则使用 Demo 数据)
export GPUSTACK_URL=http://your-gpustack-server:8080
export GPUSTACK_API_KEY=your-api-key

# 启动全部服务
docker-compose up -d

# 查看状态
docker-compose ps
```

### 本地开发

```bash
# 后端
cd backend
go run cmd/main.go

# 前端 (另一终端)
cd frontend
npm install
npm run dev
```

访问地址: `http://localhost:3000`

---

## API 概览

| 模块 | 端点 | 说明 |
|------|------|------|
| GPU | `GET /api/v1/gpus` | GPU 设备列表 (支持 node/type/status 过滤) |
| GPU | `GET /api/v1/gpus/:id/metrics` | GPU 历史指标 |
| GPU | `GET /api/v1/gpu-nodes` | Worker 节点列表 |
| GPU | `GET /api/v1/gpus/pool/summary` | GPU 资源池汇总 |
| GPUStack | `GET /api/v1/gpustack/status` | GPUStack 连接状态 |
| GPUStack | `GET /api/v1/gpustack/workers` | GPUStack Workers 代理 |
| GPUStack | `GET /api/v1/gpustack/models` | GPUStack Models 代理 |
| GPUStack | `POST /api/v1/gpustack/sync` | 触发手动同步 |
| 模型 | `GET /api/v1/models` | 模型目录 (支持 runtime/format/status 过滤) |
| 模型 | `POST /api/v1/models/import/huggingface` | 从 HuggingFace 导入模型 |
| 模型 | `GET /api/v1/models/:id/versions` | 模型版本列表 |
| 模型 | `GET /api/v1/models/compatibility` | 兼容性矩阵 |
| 模型 | `POST /api/v1/models/deploy` | 部署模型到引擎 |
| 引擎 | `GET /api/v1/runtimes` | 推理引擎列表 |
| 引擎 | `GET /api/v1/runtimes/compatibility` | 引擎-格式兼容性 |
| 服务 | `GET /api/v1/services` | 服务列表 |
| 认证 | `POST /api/v1/auth/login` | JWT 登录 |
| WS | `WS /ws` | 实时推送 |

---

## 设计规范

| 属性 | 值 |
|------|------|
| 主色 | `#165DFF` |
| 成功色 | `#00B42A` |
| 警告色 | `#FF7D00` |
| 错误色 | `#F53F3F` |
| GPUStack 色 | `#722ED1` |
| 圆角 | 8px |
| 字体 | Inter, -apple-system |
| 代码字体 | JetBrains Mono |

---

## 许可证

MIT License

---

**Stacklane** - 让 GPU 算力像基础设施一样可靠交付
