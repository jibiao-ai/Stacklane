# Stacklane (栈径) - 企业级 AI 模型运行平台

<p align="center">
  <img src="docs/logo.png" width="120" alt="Stacklane Logo" />
</p>

<p align="center">
  <strong>AI 云原生基础设施 | Enterprise Model Runtime Platform</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Go-1.21+-00ADD8?style=flat&logo=go" alt="Go" />
  <img src="https://img.shields.io/badge/React-18+-61DAFB?style=flat&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.3+-3178C6?style=flat&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Dify-Integrated-165DFF?style=flat" alt="Dify" />
  <img src="https://img.shields.io/badge/GPUStack-Connected-722ED1?style=flat" alt="GPUStack" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat" alt="License" />
</p>

## 产品定位

Stacklane 是基于 GPUStack 构建的企业级 AI 模型运行平台，提供从 GPU 资源管理到模型全生命周期管理的完整解决方案。平台深度集成 GPUStack、vLLM、llama.cpp、TensorRT-LLM 等推理引擎，实现模型的高效调度、部署和治理。同时集成多智能体编排、多渠道接入、自动化技能库，打造 AI 应用全栈运营平台。

### 核心能力

| 能力 | 说明 |
|------|------|
| 接入快 | 模型目录 + HuggingFace 一键导入，多引擎格式自动适配 |
| 跑得稳 | GPUStack 多节点编排，自动故障转移，健康巡检 |
| 跑得省 | GPU 资源池化，利用率可视化，自动调度与容量规划 |
| 管得住 | 策略中心 + 审计事件 + 多租户隔离，全链路可追溯 |
| 玩得转 | 智能体市场 + 多渠道接入 + 技能自动化，AI 应用一站式交付 |

---

## 平台预览

### 登录页

> 品牌化设计，左侧特性展示 + 右侧登录表单，主色 #165DFF

![登录](docs/screenshots/login.png)

### 平台概览 (Dashboard)

> 在线服务、GPU利用率、P95延迟、错误率等核心KPI；引擎分布饼图、资源趋势折线图、服务健康表

![Dashboard](docs/screenshots/dashboard.png)

### 即时对话 (Chat)

> 聊天框式对话界面，支持选择智能体、MCP 工具调用、流式输出、**随时中止**、快捷提示、Token 统计

![Chat](docs/screenshots/chat.png)

### 智能体管理

> 内置 AI 智能体市场，从开源社区一键拉取，支持 OpenAI / Anthropic / DeepSeek / Qwen / Ollama 多 Provider

![Agents](docs/screenshots/agents.png)

### 工作流编辑器 (Workflow)

> 类 Dify 拖拉拽式工作流编排，8 种节点类型，SVG 曲线连接，右侧配置面板（模型选择、重试机制、输出映射）

![Workflow](docs/screenshots/workflow.png)

### 技能商店

> 自动化技能库 - 定时器、PDF 转换、网页抓取、邮件发送等 12 个开源内置技能

![Skills](docs/screenshots/skills.png)

### GPU 管理

> 多集群 GPU 资源管理，节点/设备/资源池三合一

![GPU Management](docs/screenshots/gpu.png)

### 推理引擎

> 管理 vLLM、GPUStack、llama.cpp、TensorRT-LLM 推理运行时

![Runtimes](docs/screenshots/runtimes.png)

### 模型管理

> 模型全生命周期管理 - 导入、版本控制、部署、退役、兼容性矩阵

![Model Management](docs/screenshots/models.png)

### 服务管理

> 在线推理服务管理，引擎、延迟、吞吐量、副本数一目了然

![Services](docs/screenshots/services.png)

### 渠道管理

> 多平台消息渠道接入 - QQ、企业微信、飞书、微信、Telegram、Discord、Slack、DingTalk

![Channels](docs/screenshots/channels.png)

### Dify 集成

> LLM 应用平台集成 - 应用管理、工作流编排、执行监控、统计分析、费用追踪

![Dify](docs/screenshots/dify.png)

### 集成管理

> 管理外部系统集成：GPUStack GPU 编排、Prometheus 监控、Grafana 可视化

![Integrations](docs/screenshots/integrations.png)

### 流量治理

> 路由规则、A/B 测试、限流配置、熔断器

![Traffic](docs/screenshots/traffic.png)

### 租户管理

> 多租户隔离管理 - 配额分配、成员管理、资源隔离

![Tenants](docs/screenshots/tenants.png)

### 系统设置

> 平台全局配置、通知管理、审计日志、备份恢复、组件状态

![System](docs/screenshots/system.png)

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

### 5. 流量治理 (Traffic Governance)

- **路由规则**: 按权重(weight)、请求头(header)、Cookie 进行流量分发
- **A/B 测试**: 配置实验组/对照组，按流量比例灰度验证
- **限流配置**: 按服务/租户/全局维度设置 QPS 上限
- **熔断器**: 异常检测自动熔断，保护下游服务

### 6. 租户管理 (Tenant Management)

- **多租户隔离**: 独立配额、独立资源池、独立访问控制
- **配额管理**: GPU 配额分配与用量追踪，支持弹性扩缩
- **成员管理**: 租户内用户角色管理，RBAC 权限控制
- **统计分析**: 租户级服务数、模型数、资源使用率

### 7. 系统设置 (System Settings)

- **系统信息**: 服务器版本、Go 版本、OS/Arch、CPU、内存、运行时间
- **全局配置**: 平台级参数管理，分类配置
- **通知设置**: 多渠道告警通知配置
- **审计日志**: 全操作审计追溯
- **备份管理**: 数据备份与恢复
- **组件状态**: MySQL、Redis、Prometheus、Grafana、GPUStack、Dify 连接状态

### 8. Dify 集成

- **连接配置**: Dify 平台 URL/API Key 配置与连接测试
- **应用同步**: 一键同步 Dify 应用到本地管理
- **工作流管理**: 创建/编辑/运行 Dify 工作流
- **执行记录**: 工作流执行历史与统计

### 9. 智能体管理 (Agent Management)

- **模板市场**: 从开源社区拉取智能体模板，一键安装
- **多 Provider**: 支持 OpenAI / Anthropic / DeepSeek / Qwen / Ollama
- **分类管理**: 通用助手、代码开发、内容创作、数据分析、创意设计、客户服务
- **评分系统**: 用户评分与使用统计
- **一键部署**: 内置 Claude Assistant、DeepSeek Coder、Qwen Writer 等预配置智能体

### 10. 渠道管理 (Channel Management)

- **8 大平台**: QQ Bot、企业微信 Bot、飞书 Bot、微信、Telegram、Discord、Slack、DingTalk
- **智能体绑定**: 将智能体绑定到消息渠道，自动应答
- **消息统计**: 消息量、活跃度、最后活跃时间
- **状态监控**: 实时在线/离线/异常状态检测
- **Token 管理**: 渠道 Token 过期提醒与自动刷新

### 11. 技能管理 (Skill Management)

- **12 个内置技能**: Cron Timer、PDF Converter、Web Scraper、Email Sender、JSON/CSV Transform、Image Processor、HTTP Request、Text Summarizer、Code Executor、Webhook Listener、File Manager、Database Query
- **6 大分类**: 自动化、文档处理、数据处理、通信、工具、开发
- **执行追踪**: 成功率、平均耗时、执行次数统计
- **开源来源**: 每个技能链接到 GitHub 开源仓库

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
│   │   │   ├── auth.go             # JWT 认证
│   │   │   ├── traffic.go          # 流量治理 (路由/A/B测试/限流/熔断)
│   │   │   ├── tenant.go           # 租户管理 (多租户隔离/配额/成员)
│   │   │   ├── system.go           # 系统设置 (全局配置/通知/审计/备份)
│   │   │   ├── dify.go             # Dify 集成 (应用同步/工作流/执行)
│   │   │   ├── agent.go            # 智能体管理 (模板市场/一键安装)
│   │   │   ├── channel.go          # 渠道管理 (QQ/企微/飞书/微信/TG)
│   │   │   └── skill.go            # 技能管理 (12个内置技能/执行记录)
│   │   ├── middleware/auth.go       # JWT + CORS 中间件
│   │   ├── model/
│   │   │   ├── models.go           # 核心数据模型
│   │   │   ├── gpu_models.go       # GPU/Runtime/ModelVersion/Deployment 模型
│   │   │   ├── traffic_models.go   # 流量治理数据模型
│   │   │   ├── system_models.go    # 系统设置数据模型
│   │   │   └── agent_models.go     # 智能体/渠道/技能数据模型
│   │   ├── router/router.go         # 路由注册 (全部模块 API)
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
│   │   │   ├── Traffic.tsx          # 流量治理
│   │   │   ├── Tenants.tsx          # 租户管理
│   │   │   ├── System.tsx           # 系统设置
│   │   │   ├── Agents.tsx           # 智能体管理
│   │   │   ├── Channels.tsx         # 渠道管理
│   │   │   ├── Skills.tsx           # 技能管理
│   │   │   └── Login.tsx            # 登录
│   │   ├── layouts/MainLayout.tsx   # 主布局 (侧边栏 + 顶栏)
│   │   ├── services/api.ts          # API 服务层
│   │   ├── i18n/                    # 国际化 (中/英)
│   │   └── theme/theme.ts           # MUI 主题 (主色 #165DFF)
│   ├── package.json
│   └── Dockerfile
├── docs/screenshots/                 # 平台 UI 截图
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

## API 概览 (107+ 端点)

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
| 流量 | `GET /api/v1/traffic/rules` | 流量路由规则 |
| 流量 | `POST /api/v1/traffic/ab-tests` | 创建 A/B 测试 |
| 流量 | `GET /api/v1/traffic/rate-limits` | 限流配置 |
| 流量 | `GET /api/v1/traffic/circuit-breakers` | 熔断器状态 |
| 租户 | `GET /api/v1/tenants` | 租户列表 |
| 租户 | `GET /api/v1/tenants/:id/members` | 租户成员 |
| 租户 | `PUT /api/v1/tenants/:id/quota` | 更新配额 |
| 系统 | `GET /api/v1/system/info` | 系统信息 |
| 系统 | `GET /api/v1/system/config` | 全局配置 |
| 系统 | `GET /api/v1/system/audit-logs` | 审计日志 |
| Dify | `GET /api/v1/dify/apps` | Dify 应用列表 |
| Dify | `POST /api/v1/dify/workflows/:id/run` | 运行工作流 |
| 智能体 | `GET /api/v1/agents` | 智能体列表 |
| 智能体 | `POST /api/v1/agents/sync-templates` | 同步模板市场 |
| 渠道 | `GET /api/v1/channels` | 渠道列表 |
| 渠道 | `POST /api/v1/channels/:id/connect` | 连接渠道 |
| 技能 | `GET /api/v1/skills` | 技能列表 |
| 技能 | `POST /api/v1/skills/:id/execute` | 执行技能 |
| 技能 | `POST /api/v1/skills/sync-builtin` | 同步内置技能 |
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
