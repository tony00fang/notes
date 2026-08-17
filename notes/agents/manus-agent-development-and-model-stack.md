# Manus Agent 发展时间线与模型栈调研

> 更新时间：2026-08-17  
> 研究对象：Manus 通用 AI Agent，而非同名软件或其他项目  
> 证据说明：本文将“官方披露”“媒体报道”和“工程推断”尽量分开。Manus 公布的 ARR、任务数量、内部评测提升等数据均属于公司自报数据，并非公开审计结果。

## 背景

这篇文档主要回答五个问题：

1. Manus 是从什么产品和团队演化而来的？
2. Manus 从 2025 年发布至今，经历了哪些关键产品与公司事件？
3. Manus 到底使用了哪些基础模型？
4. Manus 1.5、1.6、1.6 Max 是不是基础模型？
5. Manus 真正的技术壁垒更可能位于模型层，还是 Agent Runtime、Context Engineering 和计算环境层？

---

## 结论

一句话结论：

> Manus 不是一家以自研基础模型为核心的公司，而是一套建立在 Claude、Qwen、GPT、Gemini 等外部模型之上的任务执行系统；它真正试图掌握的是模型路由、上下文工程、工具调用、浏览器与终端执行、云端虚拟机、持久工作空间以及多 Agent 并行协作。

关键判断：

1. **Manus 的产品路线不是“训练一个更强的大模型”，而是“让现有大模型真正完成工作”。**
2. **Manus 首发时期公开确认使用 Claude 3.5 Sonnet v1 和多个 Qwen 微调模型，随后主后端升级到 Claude 3.7 Sonnet。**
3. **当前官方口径已经演进为 Claude、GPT、Gemini 等模型的多模型路由，但具体版本、调用比例和路由规则没有公开。**
4. **Manus 1.5、1.6、1.6 Max 是 Agent Profile 或 Agent Architecture，不是类似 GPT、Claude、Gemini 的基础模型名称。**
5. **Manus 最值得关注的技术点，是长任务中的 Context Engineering、KV Cache、文件系统记忆、工具状态约束、错误恢复和并行 Agent 调度。**
6. **公司层面经历了从中国创业团队迁往新加坡、宣布加入 Meta、交易被要求撤销，再到 2026 年 8 月宣布恢复独立运营的剧烈变化。**

---

## 一、Manus 是什么

Manus 的核心交互不是传统聊天机器人式的“问一个问题，得到一段回答”，而是：

```text
用户给出目标
   ↓
Agent 理解任务并生成计划
   ↓
选择模型、工具和执行环境
   ↓
浏览网页 / 运行终端 / 写代码 / 处理文件 / 调用第三方应用
   ↓
持续观察结果、重新规划、重试和验证
   ↓
交付报告、表格、网站、应用、幻灯片或自动化程序
```

因此，更准确地说，Manus 是一个由大模型驱动的任务执行平台，而不是单纯的聊天产品。

它的通用性并不只来自模型能力，还来自每个任务背后的计算环境：

- 浏览器；
- 终端和 Python；
- 文件系统；
- 网络访问；
- 云端虚拟机；
- 应用部署能力；
- 本地电脑访问；
- 持久云电脑；
- 第三方 Connectors；
- 多 Agent 并行执行。

Manus 后来逐渐把自己的定位从“通用 AI Agent”扩展到更接近 **Action Engine** 或个人 AI 工作系统：模型负责理解和决策，工具与环境负责执行。

---

## 二、发展时间线

| 时间 | 关键事件 | 影响与解读 |
|---|---|---|
| **2022 年** | Butterfly Effect 团队成立，早期核心产品为 AI 浏览器助手 Monica。 | Manus 不是凭空出现的，而是 Monica 团队从翻译、总结、写作等 AI 辅助功能，向自主任务执行演进的结果。 |
| **2024 年 10 月** | 团队开始集中开发 Manus。创始团队后来提到，Cursor 让他们意识到：AI 的价值不只是回答问题，而是进入完整计算环境完成工作。 | 产品方向从“浏览器 AI 助手”转向“拥有浏览器、终端和文件系统的云端 Agent”。 |
| **2025 年 3 月 6 日** | Manus 以邀请制预览版发布，演示了筛选简历、股票分析、房产搜索、网站制作等任务。 | Manus 将“通用 Agent”从开发者概念大规模推向普通用户。首发时“世界首个通用 AI Agent”等说法属于公司营销口径，并非行业公认结论。 |
| **2025 年 3 月 10 日前后** | 联合创始人季逸超公开说明，首发版本使用 Claude 3.5 Sonnet v1 和多个 Qwen 微调模型，并正在测试 Claude 3.7。 | 首次明确 Manus 不是自研基础模型，而是由外部模型与 Agent 系统组合而成。 |
| **2025 年 3 月 11 日** | Manus 与阿里 Qwen 团队宣布合作，计划将 Manus 能力适配国产模型和中国境内计算平台。 | 这是一条国产化和本地部署路线，不等于全球版 Manus 已经完全切换为 Qwen。 |
| **2025 年 3 月下旬** | 媒体报道候补名单达到约 200 万人，Manus 在中国 AI 圈快速出圈。 | 市场关注度远高于当时可供给的实际服务容量，也产生了邀请码炒作和大量早期体验争议。 |
| **2025 年 3 月 31 日** | 上线 39 美元和 199 美元订阅方案，发布 iOS App，并将主要后端升级到 Claude 3.7 Sonnet。 | 产品发布后不到一个月即进入商业化，同时反映长任务 Agent 的推理和虚拟机成本较高。 |
| **2025 年 4 月 25 日** | Benchmark 领投约 7500 万美元，媒体报道投后估值约 5 亿美元。 | Manus 获得全球化扩张资金，但也开始进入美国对华 AI 投资审查的敏感区域。 |
| **2025 年 5 月 13 日** | 结束邀请制，开放注册。 | 从制造稀缺性的封闭测试，进入真正的大规模用户验证。 |
| **2025 年 5 月 20 日** | 推出 Manus Team。 | 开始从个人用户和 Prosumer 扩展到团队协作和小型企业市场。 |
| **2025 年 6 月 26 日** | 发布上线三个月复盘，承认早期系统慢、昂贵，而且用户并不清楚哪些任务适合交给 Agent；同时推出 Chat Mode、Playbooks 等能力。 | 标志着 Manus 从发布热潮进入产品工程阶段。官方称速度提升约 2 倍、成本降至原来的约 1/5，属于公司自报数据。 |
| **2025 年中** | Manus 收缩中国团队并将运营重心迁往新加坡。 | 公司明确选择全球市场路线，但后续事实说明，注册地和运营地迁移并不能完全切断其与中国团队、技术和监管的关联。 |
| **2025 年 7 月 18 日** | 季逸超发布《Context Engineering for AI Agents》，系统披露 Manus 的核心工程方法。 | Manus 正式明确其技术路线：不训练端到端 Agent 基础模型，而是在前沿模型之上建设上下文组织、工具系统、记忆和长任务稳定性。 |
| **2025 年 7 月 31 日** | 发布 Wide Research。 | 从单 Agent 顺序执行升级为多个完整 Manus 实例并行工作，每个子 Agent 都拥有独立上下文和云端计算环境。 |
| **2025 年 10 月 16 日** | 发布 Manus 1.5 和 1.5 Lite，重构 Agent Engine，并扩展到带数据库、登录和 AI 功能的完整 Web 应用。 | Manus 从研究、报告和文件生成，进一步进入软件构建平台。官方称平均任务时间从 4 月约 15 分钟下降到不足 4 分钟，质量和满意度数据均为内部评测。 |
| **2025 年 11 月** | 推出 Browser Operator。 | Manus 可以在用户已登录的本地浏览器中执行操作，补上云端浏览器无法访问登录态、企业内网和本地环境的缺口。 |
| **2025 年 12 月 15 日** | 发布 Manus 1.6 Max，并加入移动应用开发、Design View 等能力。 | Max 被定位为旗舰 Agent，其提升来自规划、问题求解、推理预算和 Agent 架构，而不是公开发布了一个名为 Manus Max 的基础模型。 |
| **2025 年 12 月 17 日** | 公司宣布 ARR 超过 1 亿美元、收入运行率超过 1.25 亿美元，并披露累计处理 147 万亿 Token、创建 8000 多万个虚拟机实例。 | 说明“为任务结果付费”的 Agent 商业模式获得了强烈早期验证，但这些数字均为公司自行披露。 |
| **2025 年 12 月 19 日前后** | 推出 Projects 与多种 Connectors，接入 Gmail、Calendar、Drive、Notion、GitHub 等服务。 | Manus 从一次性任务工具，转向拥有持久指令、知识文件、权限和团队上下文的 AI 工作空间。 |
| **2025 年 12 月 29 日** | Manus 宣布加入 Meta；媒体估计交易规模约 20 亿至 30 亿美元。 | Meta 看中的不只是团队，还包括已经商业化的 Agent 产品、云端执行基础设施和用户任务数据。 |
| **2026 年 1 月—4 月** | 中国有关部门审查交易，期间媒体报道创始团队受到出境限制；4 月 27 日，Reuters 报道中国方面要求撤销该收购交易。 | Manus 从产品公司变成中美 AI 技术、资本和人才流动的监管案例。 |
| **2026 年 3 月 16 日** | 发布 Manus Desktop 的 My Computer。 | Manus 可以在授权后使用本地文件、终端、开发工具和本地 GPU，形成“云端智能 + 本地数据与算力”的混合执行模式。 |
| **2026 年 4 月—7 月** | 陆续推出 Cloud Computer、Scheduled Tasks 2.0、会话 Branch、原生 PowerPoint、Plan Mode 等功能。 | 产品从临时任务执行，继续向可持续运行的软件、机器人、定时工作流和可编辑交付物演进。 |
| **2026 年 8 月 11 日** | Manus 宣布将恢复独立运营，Meta 交易进入拆分和回退阶段。 | 截至 2026 年 8 月 17 日，Manus 的准确状态不是“仍在正常并入 Meta”，而是正在恢复独立运营；最终股权结构和交易收尾细节尚未完全公开。 |

---

## 三、产品路线的五次跃迁

### 1. Monica：AI 信息助手

早期 Monica 主要帮助用户完成：

- 网页总结；
- 翻译；
- 写作；
- 搜索辅助；
- 聚合多个大模型能力。

这时 AI 的角色仍然是“辅助用户完成信息工作”。

### 2. 首发 Manus：异步任务代理

Manus 把交互从“给我一个答案”改成“替我完成一个目标”。任务可以在云端继续执行，用户不必始终停留在对话框中。

这一步的核心不是聊天体验，而是：

- 云端虚拟机；
- 浏览器和终端；
- 长任务循环；
- 文件交付；
- 错误恢复；
- 异步执行。

### 3. Wide Research：并行多 Agent

单 Agent 的局限是任务步骤大多串行，长研究需要不断等待搜索、阅读和整理。

Wide Research 将任务拆为多个并行分支，每个子 Agent 都是完整的 Manus 实例，而不是一个只能做固定角色的小工具。其本质是把 Agent 能力扩展成一种推理时计算：

```text
一个任务
   ↓
拆成多个相对独立的研究或执行分支
   ↓
多个完整 Agent 并行工作
   ↓
主 Agent 汇总、比较和生成最终交付物
```

### 4. Projects、Connectors、Builder：AI 工作空间

Manus 1.5、1.6、Projects 和 Connectors 使其逐渐具备：

- 持久项目说明；
- 项目知识文件；
- 历史任务上下文；
- 团队权限；
- 第三方应用身份；
- Web 和移动应用构建；
- 可编辑幻灯片与设计稿。

这时 Manus 已经不只是“研究工具”，而是在竞争下一代生产力平台。

### 5. My Computer、Cloud Computer、Schedules、API：Action OS

My Computer 负责接入用户私有文件、本地应用、终端和 GPU；Cloud Computer 负责提供长期在线、跨任务保留状态的云机器；Scheduled Tasks 负责周期执行；API 和 Connectors 负责嵌入现有业务系统。

最终形态更接近：

> 一个由自然语言驱动、拥有权限和计算环境、能够长期维护状态并持续完成工作的 AI Action OS。

---

## 四、Manus 使用的模型：演进时间线

| 时间 | 公开确认的模型情况 | 证据强度与解读 |
|---|---|---|
| **首发前至 2025 年 3 月** | Claude 3.5 Sonnet v1 + 多个不同的 Qwen 微调模型。 | 联合创始人季逸超公开披露。具体 Qwen 版本、参数规模、训练方式和模块分工均未公开。 |
| **2025 年 3 月 10 日前后** | 团队开始测试 Claude 3.7 Sonnet。 | 官方成员披露，说明团队希望借助更强推理能力减少部分辅助模型和复杂工程补偿。 |
| **2025 年 3 月 31 日** | 主要后端升级到 Claude 3.7 Sonnet。 | 得到媒体明确报道，是首个公开确认的生产后端升级。不能据此断言所有 Qwen 辅助模型立即退出。 |
| **2025 年 3 月 11 日以后** | 与 Qwen 团队推动国产模型和中国境内计算平台适配。 | 这是本地化适配路线，不能直接等同于全球版生产环境的主模型发生切换。 |
| **2025 年 5 月** | Anthropic 在 Claude 4 发布材料中引用 Manus 对 Claude Sonnet 4 的评价。 | 说明 Manus 至少进行了测试或早期接入，但没有公开宣布全量生产切换。 |
| **2025 年 7 月** | 官方明确“模型无关”的 Context Engineering 路线。 | Manus 希望 Agent 系统与底层模型保持相对正交，让 Claude、GPT、Gemini 等前沿模型升级时，系统可以直接受益。 |
| **2025 年 10 月** | 发布 Manus 1.5 和 1.5 Lite。 | 官方称其为新的 Agent 和重构后的 Agent Engine，没有把它们定义为基础模型。 |
| **2025 年 12 月** | 发布 Manus 1.6 Max。 | 官方称其为旗舰 Agent，能力提升来自规划、问题求解、计算预算和系统架构，未公开固定绑定某个基础模型。 |
| **截至 2026 年 8 月** | 官方公开口径为 Claude、GPT、Gemini 等多模型路由。 | 当前系统会根据任务和步骤选择模型，但精确版本、调用比例、成本策略和路由规则没有公开。 |

---

## 五、首发时期：Claude 和 Qwen 分别可能做什么

### 1. 已确认事实

可以确认的是：

- 首发版本使用 Claude 3.5 Sonnet v1；
- 同时使用多个 Qwen 微调模型；
- 团队认为当时的 Claude 3.5 Sonnet v1 缺少足够的长程推理能力，因此需要辅助模型；
- 2025 年 3 月底，主要后端升级为 Claude 3.7 Sonnet。

### 2. 合理但未被官方逐项确认的架构推断

结合后续 Manus 对 Claude 的持续升级和其 Agent Loop，可以合理推测 Claude 在早期主要承担：

- 理解用户目标；
- 制定和维护计划；
- 选择下一步工具；
- 阅读浏览器、终端和文件系统返回结果；
- 判断是否完成、失败或需要重试。

Qwen 微调模型可能承担部分更固定、成本敏感或专业化的子任务，例如：

- 分类和路由；
- 信息抽取；
- 网页结构处理；
- 格式转换；
- 特定场景的辅助判断。

但这些分工没有得到 Manus 官方逐模块确认，因此不能写成确定事实。

### 3. 当前不能确认的内容

公开资料没有确认：

- 使用的是 Qwen1.5、Qwen2、Qwen2.5 还是其他版本；
- 参数规模是 7B、32B、72B 或其他；
- 是否包含 Qwen-VL；
- 使用 LoRA、全量微调还是其他后训练方法；
- Qwen 是否仍在 2026 年全球生产链路中；
- Claude、Qwen 分别承担多少请求比例。

因此，网上常见的“Manus 使用 Qwen2.5-32B”“Qwen-VL 专门负责视觉”等说法，目前不宜作为确定结论。

---

## 六、Manus 1.5、1.6、1.6 Max 不是基础模型

严格来说，Manus 1.5、1.6、1.6 Lite 和 1.6 Max 更接近 Agent Profile 或 Agent Architecture，而不是基础模型。

可以将其理解为：

```text
Manus 1.6 Max
    ≠ 一个名为 Manus Max 的自研大语言模型

Manus 1.6 Max
    = Agent 架构
    + 模型路由
    + 推理预算
    + 上下文管理
    + 工具系统
    + 多 Agent 并行
    + 重试与验证策略
    + 云端计算资源
```

不同 Profile 之间的差异，可能同时包括：

- 是否调用更强、成本更高的基础模型；
- 每个任务允许使用的推理时间；
- 上下文容量与压缩策略；
- 并行子 Agent 数量；
- 工具调用次数；
- 验证和重试强度；
- 可使用的云端资源；
- 对复杂任务的一次完成率目标。

官方没有公布 `manus-1.6-max` 是否固定使用某个 Claude、GPT 或 Gemini 版本，也没有公布它是否在每一步都调用最昂贵的模型。

---

## 七、当前的多模型架构

根据 Manus 当前官网公开描述，其核心架构可以抽象为：

```text
用户任务
   ↓
Agent Profile
Lite / Standard / Max
   ↓
任务理解、规划与拆分
   ↓
模型路由器
   ├── Claude
   ├── GPT
   ├── Gemini
   └── 其他可能的辅助模型
   ↓
浏览器 / 终端 / Python / 文件系统 / Connectors
   ↓
环境返回 Observation
   ↓
重新规划 / 重试 / 验证 / 切换模型
   ↓
最终交付物
```

这是基于官方公开描述形成的系统抽象，并不是 Manus 已公开完整内部架构图。

### 多模型路由可能考虑的因素

从 Agent 工程和成本控制角度，路由器通常需要综合考虑：

| 因素 | 可能影响 |
|---|---|
| 任务难度 | 是否调用最强推理模型 |
| 输入上下文长度 | 长上下文价格、Prefill 延迟和缓存收益 |
| 任务类型 | 代码、视觉、检索、结构化抽取或自然语言生成 |
| 工具调用稳定性 | JSON、函数调用、参数生成是否可靠 |
| 延迟要求 | 用户是否需要快速交互，还是允许异步长任务 |
| 成本预算 | Lite、Standard、Max 允许的计算预算不同 |
| 验证需求 | 是否需要独立模型复核结果 |
| 供应商状态 | API 可用性、限额、区域和合规要求 |

合理的工程分工可能是：

- 长程规划和关键决策使用更强模型；
- 网页抽取、分类和格式处理使用更快、更便宜的模型；
- 代码生成使用编码能力更强的模型；
- 多模态任务使用原生视觉模型；
- 最终校验由独立模型或验证 Agent 完成。

但这些属于工程推断，Manus 没有公开真实路由规则。

---

## 八、Manus-built 应用的模型目录，不等于 Manus Agent 自己的模型清单

Manus Website Builder 允许用户在生成的网站或 Web App 中调用不同供应商的模型。当前官方文档列出的模型包括：

### OpenAI

- GPT-5 nano
- GPT-5 mini
- GPT-5
- GPT-5.5

### Anthropic

- Claude Haiku 4.5
- Claude Sonnet 4.6
- Claude Opus 4.6
- Claude Opus 4.7

### Google

- Gemini 3 Flash
- Gemini 3.1 Pro

这里需要严格区分两件事：

```text
Manus 构建出来的应用可以调用哪些模型
                     ≠
Manus Agent Runtime 内部实际使用哪些模型
```

例如，用户可以让 Manus 构建一个使用 Claude Haiku 的客服应用，但这不意味着负责构建该应用的 Manus Agent 本身也是由 Claude Haiku 驱动。

---

## 九、专业生成模型

除了负责规划和工具调用的通用 LLM，Manus 还会集成面向特定内容形态的专业模型。

公开案例包括：

- Nano Banana Pro：用于图片生成、Design View 和视觉化 Slides；
- GPT Image 2：用于图片生成和 Slides 的图像模式；
- 通用 Agent：负责研究、规划、组织内容和调用上述专业模型。

这说明 Manus 的模型栈并不是“一个大模型包办一切”，而是：

> 通用大模型负责理解、规划和控制，专业模型负责图片和设计等特定模态，工具与计算环境负责真正执行。

---

## 十、为什么 Manus 没有训练自己的端到端 Agent 模型

Manus 团队公开表示，他们曾考虑训练端到端 Agent 模型，但最终选择在前沿模型之上进行 Context Engineering。

核心原因是：

- 基础模型迭代速度太快；
- 自研或微调端到端 Agent 模型，训练和评测周期通常以周计算；
- 基于 In-context Learning 和 Agent Runtime 的工程迭代可以缩短到小时级；
- 当 Claude、GPT、Gemini 等基础模型升级时，Manus 可以直接继承部分能力提升；
- 团队可以把资源集中在任务成功率、工具执行、记忆和用户体验上。

这条路线的优势是：

1. 快速接入最新模型；
2. 可以跨供应商路由；
3. 按任务选择质量、速度和成本；
4. 避免承担巨额预训练成本；
5. Agent 系统可以与基础模型保持相对正交。

相应代价是：

1. 依赖外部模型供应商；
2. API 价格、限额和策略变化会影响产品；
3. 上游模型更新可能改变工具调用行为；
4. 多模型评测和一致性维护更加复杂；
5. 基础模型公司也可能直接推出类似 Agent 产品；
6. Manus 很难把“智能本身”完全掌握在自己手中。

---

## 十一、Context Engineering：Manus 真正的核心技术

### 1. Agent 工作负载不是普通聊天工作负载

Manus 官方披露，一个典型 Agent 任务会经历大量模型调用和工具调用。

每一轮大致是：

```text
长上下文输入
   ↓
模型输出一个较短的工具调用
   ↓
工具执行
   ↓
网页、终端或文件结果追加进上下文
   ↓
下一轮模型调用
```

随着任务进行：

- 输入上下文越来越长；
- 每次输出通常很短；
- 多数计算消耗发生在 Prefill，而不是长文本 Decode；
- 官方披露平均输入与输出 Token 比约为 100:1。

因此，Manus 的推理优化重点与普通聊天服务不同。

### 2. KV Cache 命中率是关键指标

Manus 把 KV Cache 命中率称为生产 Agent 最重要的指标之一，原因是每轮都会重复读取大段历史上下文。

其工程策略包括：

- 保持 Prompt Prefix 稳定；
- 使用 Append-only Context；
- 避免随意修改历史消息；
- 使用确定性序列化；
- 尽量让同一任务复用相同前缀；
- 减少工具定义变化造成的缓存失效。

对于 AI Infra 来说，这意味着 Agent Serving 不能只看 Decode TPS，还要重点关注：

- Prefill 吞吐；
- Prefix Cache；
- Session Affinity；
- KV Cache 生命周期；
- 长上下文调度；
- 不同 Worker 之间的缓存复用；
- 多 Agent 并行带来的 Prefill 峰值。

### 3. 文件系统是外部记忆

Manus 不会把所有网页、PDF、代码和日志永久塞进模型上下文，而是把文件系统当成可读写的外部记忆：

- 大型网页和文件保存到磁盘；
- 需要时只读取相关片段；
- 中间结果保存为文件；
- `todo.md` 等任务文件持续维护当前目标；
- 最终交付物直接在文件系统中生成。

这比单纯扩大 Context Window 更实用，因为模型上下文昂贵、有限，而且容易被无关信息污染。

### 4. 保留错误，而不是隐藏错误

传统应用经常清理失败日志，但 Manus 强调保留错误操作和异常反馈，让模型看到：

- 哪一步失败；
- 为什么失败；
- 哪个工具参数不合法；
- 哪个网页状态发生变化；
- 哪条路径不应再次尝试。

错误本身成为 Agent 的短期学习信号，有助于重试和恢复。

### 5. 工具选择是一种状态机

当工具数量不断增加时，如果每轮都让模型从所有工具中自由选择，会增加错误概率并破坏缓存稳定性。

Manus 的思路包括：

- 让上下文显式记录当前任务状态；
- 按阶段限制可选工具；
- 通过 Logit Masking 或结构化约束控制动作空间；
- 使用 Response Prefill 引导模型输出合法结构；
- 将 Agent Loop 设计成上下文感知状态机。

这说明成熟 Agent 系统不是简单地“给模型几十个函数，然后让它自己选”。

---

## 十二、Manus 的商业价值

Manus 验证了一个重要商业假设：

> 用户不一定愿意为更多 Token 付费，但可能愿意为一个完成的结果付费。

传统聊天产品交付的是回答，Manus 试图交付：

- 一份研究报告；
- 一个可访问的网站；
- 一个带数据库和登录的应用；
- 一份可编辑的 PPT；
- 一个持续运行的机器人；
- 一条定时自动执行的工作流。

Credits 计费把模型调用、浏览器操作、虚拟机时长、文件处理和并行 Agent 成本包装为“完成任务的价格”。

2025 年 12 月，Manus 自报 ARR 超过 1 亿美元，说明这套模式至少获得了强烈的早期市场验证。但需要注意：

- ARR 是公司自报；
- Agent 任务的推理和虚拟机成本可能很高；
- ARR 不等于利润；
- 长任务失败会直接消耗成本并影响用户信任；
- Credits 是否能覆盖高并发和复杂任务成本，取决于模型路由和基础设施效率。

---

## 十三、Manus 可能的护城河

Manus 的护城河不太可能是某一个 Prompt，也不太可能是独占某一个基础模型。

更有价值的资产可能包括：

1. 大量真实长任务的执行轨迹；
2. 工具调用失败、重试和纠错数据；
3. 云端虚拟机和沙箱编排能力；
4. Prefix Cache、上下文压缩和会话调度能力；
5. 多 Agent 并行执行系统；
6. 对报告、网站、应用和 Slides 等交付物的验证能力；
7. Projects、Connectors、Skills 和 API 形成的平台生态；
8. 已形成的全球 Agent 品牌和付费用户基础；
9. 不同模型供应商之间的路由、评测和成本优化经验。

其长期护城河能否成立，取决于这些系统能力能否持续领先于 OpenAI、Anthropic、Google、Microsoft 等基础模型和平台公司。

---

## 十四、主要风险与不确定性

### 1. 长链路可靠性

Agent 的问题不是某一步能否成功，而是几十步连续执行后能否仍然正确。

假设每一步独立成功率为 98%，连续 50 步全部正确的理论概率约为：

```text
0.98^50 ≈ 36%
```

真实系统可以通过重试、验证和自我纠错提高成功率，但网页变化、权限、网络、第三方 API、模型幻觉和状态不一致都会增加复杂度。

### 2. Benchmark 与真实世界存在差距

GAIA 等 Benchmark 可以衡量浏览、检索、推理和工具使用，但难以充分覆盖：

- 登录和权限异常；
- 网页结构变化；
- 支付等不可逆操作；
- 多小时运行；
- 数据正确性；
- 多次修改后的状态一致性；
- 用户对最终交付物的真实满意度。

因此，Benchmark 成绩可以说明竞争力，但不能单独证明“通用自主执行”已经成熟。

### 3. 外部模型依赖

Manus 会受到以下因素影响：

- 模型 API 价格变化；
- 供应商限额和区域限制；
- 模型安全策略变化；
- 上游模型工具调用行为改变；
- 不同模型之间的一致性问题；
- 基础模型公司推出同类产品。

### 4. 权限与安全风险

Browser Operator、My Computer、Connectors 和 Cloud Computer 能力越强，潜在风险越高：

- Prompt Injection；
- 越权读取数据；
- 误操作；
- 敏感信息泄露；
- 使用已登录身份执行错误动作；
- 长期运行程序的安全问题；
- 第三方服务权限撤销和审计困难。

这要求 Agent 系统具备明确授权、最小权限、操作日志、可中断执行和高风险动作确认机制。

### 5. 公司治理和地缘政治风险

Manus 从中国创业团队迁往新加坡，接受美国资本并宣布出售给 Meta，最终仍被要求撤销交易。

这说明：

> 公司注册地迁移，不一定意味着技术、团队、知识产权和早期资产与原司法辖区完全切割。

截至 2026 年 8 月 17 日，Manus 已宣布恢复独立运营，但最终股权结构、原投资者回购安排和与 Meta 的拆分细节仍未完全公开。

---

## 十五、当前仍未公开的模型信息

| 未公开项目 | 当前判断 |
|---|---|
| 每种 Agent Profile 对应的具体基础模型 | 未公开 |
| Manus 1.6 Max 是否固定使用某个最强模型 | 未公开 |
| Claude、GPT、Gemini 的精确版本和请求占比 | 未公开 |
| 模型路由器的判断规则 | 未公开 |
| 是否采用独立 Planner、Executor、Verifier 模型 | 未公开 |
| Qwen 是否仍用于全球版生产环境 | 无法确认 |
| 首发 Qwen 微调模型的版本和参数规模 | 未公开 |
| 是否仍有自研小模型负责分类、路由、压缩或安全 | 无法确认 |
| Max 的提升中，基础模型升级与 Agent 架构升级各占多少 | 未公开 |
| 是否对外部模型进行蒸馏、LoRA 或其他后训练 | 未公开 |

因此，目前不能严谨地说：

- “Manus 1.6 Max 就是某个 Claude 版本”；
- “Manus 现在完全不用 Qwen”；
- “Manus 所有步骤都由 Claude 执行”；
- “Manus 已经训练了自己的通用大模型”；
- “Website Builder 的十个模型就是 Manus Runtime 的内部模型列表”。

---

## 十六、总体判断

### 1. Manus 不是新的 DeepSeek

DeepSeek 的核心价值主要位于模型层和训练层；Manus 的核心价值位于 Agent Runtime、Context Engineering、工具系统和计算环境层。

更准确的对比是：

- DeepSeek 在制造更强、更便宜的“大脑”；
- Manus 在制造可以使用不同大脑的“手、电脑、工作环境和执行系统”。

### 2. Manus 的主要贡献是 Agent 产品化

浏览器控制、代码执行、Planning、多 Agent 和云沙箱在 Manus 之前都已经存在。

Manus 的贡献是将这些能力组合成普通用户可以直接购买和使用的完整产品，并把：

```text
等待 AI 生成回答
```

转变为：

```text
把一个目标委托给 AI，并等待可使用的结果
```

### 3. Manus 的终局更接近 Action OS

从 Projects、Connectors、My Computer、Cloud Computer、Scheduled Tasks、Builder 和 API 的演进看，Manus 最终想成为的并不是单纯的 ChatGPT 替代品，而是：

> 面向个人和团队的 AI Action OS：理解目标，获得权限，调用本地与云端资源，长期维护状态，并持续完成工作。

### 4. 最值得持续观察的四个问题

1. 恢复独立后，Manus 是否还能保持模型、算力、人才和产品迭代速度；
2. 最终股权结构和与 Meta 的拆分将如何完成；
3. 当 Claude、GPT、Gemini 等底层模型都原生提供浏览器、电脑使用、代码执行和 Connectors 时，Manus 是否仍能保持独立护城河；
4. Manus 能否把 Demo 级能力稳定转化为企业可审计、可授权、可验证的长期生产系统。

最终评价：

> Manus 不是 Agent 理论的起点，却是通用 Agent 产品化、商业化和云计算化过程中的关键样本。它的发展史同时展示了 Agent 的技术潜力、商业爆发速度、推理基础设施挑战，以及跨境 AI 公司可能面对的治理风险。

---

## 参考资料

### Manus 官方

- Context Engineering for AI Agents: Lessons from Building Manus  
  https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus
- Introducing Wide Research  
  https://manus.im/blog/introducing-wide-research
- What We Saw in the Past Three Months, and What We See in the Future  
  https://manus.im/blog/what-we-saw-in-the-past-three-months-and-what-we-see-in-the-future
- Manus 1.5 Release  
  https://manus.im/en/blog/manus-1.5-release
- Manus 1.6 Max Release  
  https://manus.im/blog/manus-max-release
- Manus Browser Operator  
  https://manus.im/blog/manus-browser-operator
- Projects and Connectors  
  https://manus.im/blog/projects-connectors
- Manus Reaches $100M ARR  
  https://manus.im/blog/manus-100m-arr
- Manus Joins Meta  
  https://manus.im/en/blog/manus-joins-meta-for-next-era-of-innovation
- My Computer on Manus Desktop  
  https://manus.im/blog/manus-my-computer-desktop
- What Is the Cloud Computer  
  https://help.manus.im/en/articles/15392111-what-is-the-cloud-computer
- Manus Plan Mode  
  https://manus.im/blog/manus-plan-mode
- Manus vs Claude Code：官方架构与多模型路由说明  
  https://manus.im/compare/manus-vs-claude-code
- Website Builder AI Capabilities：可供应用调用的模型目录  
  https://manus.im/docs/website-builder/ai-capabilities
- Manus Scheduled Tasks  
  https://manus.im/blog/manus-schedules

### 模型与早期披露

- 季逸超关于 Claude 3.5、Claude 3.7 与 Qwen 微调模型的公开说明  
  https://x.com/peakji/status/1898997311646437487
- Anthropic：Claude 4 发布材料  
  https://www.anthropic.com/news/claude-4
- TechCrunch：付费方案、iOS App 与 Claude 3.7 后端升级  
  https://techcrunch.com/2025/03/31/manus-launches-paid-subscription-plans-and-a-mobile-app/
- Reuters：Manus 与 Qwen 团队合作  
  https://www.reuters.com/technology/artificial-intelligence/chinas-manus-ai-announces-partnership-with-alibabas-qwen-team-2025-03-11/

### 产品、融资与公司事件

- TechCrunch：Manus Team  
  https://techcrunch.com/2025/05/20/agentic-ai-platform-manus-launches-a-paid-plan-for-teams/
- SCMP：Manus 开放注册  
  https://www.scmp.com/tech/tech-trends/article/3310122/chinas-manus-ai-offers-free-registration-after-fresh-funding-amid-ai-agent-competition
- Bloomberg：Benchmark 融资与估值  
  https://www.bloomberg.com/news/articles/2025-04-25/chinese-ai-startup-manus-scores-funding-at-500-million-value
- SCMP：团队与早期产品背景  
  https://www.scmp.com/tech/tech-trends/article/3301864/chinese-ai-agent-manus-transcends-chatbots-founder-start-butterfly-effect-says
- Reuters：Meta 宣布收购 Manus  
  https://www.reuters.com/world/china/meta-acquire-chinese-startup-manus-boost-advanced-ai-features-2025-12-29/
- Reuters：中国方面要求撤销 Meta 收购 Manus 的交易  
  https://www.reuters.com/world/asia-pacific/china-blocks-foreign-acquisition-ai-startup-manus-2026-04-27/
- Reuters：Manus 宣布恢复独立运营  
  https://www.reuters.com/world/china/ai-startup-manus-resume-independent-operations-deal-with-meta-unwinds-2026-08-11/
- Reuters：交易审查期间的创始人出境限制报道  
  https://www.reuters.com/world/asia-pacific/china-bars-manus-co-founders-leaving-country-it-reviews-sale-meta-ft-reports-2026-03-25/

---

## 备注

- 本文中的“模型分工”只在有公开证据时写成事实；其余内容均明确标记为工程推断。
- Manus 的产品、底层模型、公司归属和股权结构仍在快速变化，后续维护时应优先核对官方公告和一手媒体报道。
- 不应将 Agent Profile、Agent Engine 版本和基础模型名称混为一谈。