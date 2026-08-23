---
title: 从传统软件工程到 Agent 工程：时序、状态、上下文、模型与行动
outline: deep
---

# 从传统软件工程到 Agent 工程：时序、状态、上下文、模型与行动

> 更新时间：2026-08-23  
> 核心判断：**传统软件工程是在显式编码状态转移；Agent 工程是在设计一个由模型动态决定部分状态转移、同时受到确定性系统约束的运行环境。**

## 结论

从应用运行时看，一个最小的 LLM Agent 就是下面这个循环：

```text
Prompt / Context
→ LLM
→ Tool Call
→ Tool Result / Observation
→ 新一轮 Prompt / Context
→ LLM
→ Tool Call
→ Tool Result / Observation
→ ...
→ Final Answer
```

更完整地写，它实际运行的是：

```text
State_t
→ Context Compiler
→ Prompt_t
→ LLM
→ Proposed Action_t
→ Validator / Executor
→ Tool / Environment
→ Observation_t
→ State_{t+1}
→ Context Compiler
→ Prompt_{t+1}
→ LLM
→ ...
```

因此，Agent 至少需要同时从两个视角理解：

1. **运行时序视角**：`Prompt → LLM → Tool → Observation → LLM`，描述一次任务如何一轮一轮执行；
2. **系统结构视角**：`State → Context → Model → Action → Environment → State`，描述每轮背后的状态、边界和职责。

这两个表达并不冲突。前者是系统在时间上的展开，后者是同一个系统在结构上的抽象。

Agent 相比传统软件最核心的变化，也不是系统突然有了循环、状态或工具，而是：

> **原来由工程师显式编写的一部分决策逻辑，被转移到了模型的运行时推理中。**

从认知内核看，Agent 工程主要研究两件事：

1. LLM 推理—行动循环如何运行；
2. 每一轮循环中，把什么上下文、以什么形态交给模型。

但完整的生产级 Agent 还必须保留传统软件工程中的状态管理、动作执行、权限、安全、一致性、可靠性和可观测性。

---

## 1. Agent 的实际运行时序

### 1.1 最小循环

从用户使用 Agent 的表面过程看，时序非常简单：

```text
用户给出目标
→ 系统构造 Prompt
→ 调用 LLM
→ LLM 决定调用工具
→ 系统执行工具
→ 将工具结果放回下一轮 Prompt
→ 再次调用 LLM
→ 再次调用工具
→ ...
→ LLM 认为任务完成并输出最终结果
```

也就是：

```text
Prompt_0
→ LLM_0
→ Tool_0
→ Observation_0
→ Prompt_1
→ LLM_1
→ Tool_1
→ Observation_1
→ Prompt_2
→ LLM_2
→ Final Answer
```

这里的关键不是“调用了几次模型”，而是每次工具执行后，系统都会获得新的 Observation，并据此构造下一轮模型输入。

### 1.2 一轮循环内部发生了什么

一轮典型的 Agent 循环可以拆成八步。

#### 第一步：初始化任务状态

用户给出一个目标，例如：

```text
检查最近一次线上故障，判断最可能的根因，并给出下一步排查建议。
```

Agent Runtime 创建初始 State，可能包括：

- 用户目标；
- 当前任务状态；
- 用户身份和权限；
- 可用工具；
- 执行预算；
- 已知环境信息；
- 历史记忆或工作区。

#### 第二步：构造本轮 Context

系统从 State 中挑选当前模型需要看到的信息，并形成 Context：

```text
Context_0 = {
  system_instructions,
  user_goal,
  current_state,
  available_tools,
  tool_schemas,
  relevant_memory,
  execution_constraints
}
```

#### 第三步：序列化成 Prompt 或 Messages

Context 是系统层面的逻辑结构；Prompt 是发送给模型 API 的具体表示。

```text
Prompt_0 = serialize(Context_0)
```

实际 API 中，它可能不是一段单独字符串，而是一组 messages、tool schemas、附件和结构化参数。这里使用 Prompt 只是一个便于理解的统称。

#### 第四步：LLM 产生下一步决策

模型可能输出两类结果。

第一类是工具调用建议：

```json
{
  "tool": "query_metrics",
  "arguments": {
    "service": "storage-node",
    "time_range": "last_incident_window"
  }
}
```

第二类是最终回答：

```text
任务已经完成，以下是根因判断和建议。
```

所以每次 LLM 调用，本质上都在回答：

> **基于当前上下文，下一步应该做什么？**

#### 第五步：验证并执行工具

模型输出的只是 Proposed Action，并不等于真实动作已经发生。

Agent Runtime 需要完成：

- 结构化解析；
- schema 校验；
- 权限校验；
- 参数范围检查；
- 风险判断；
- 必要时请求人工确认；
- 调用真实工具；
- 处理超时、重试和错误。

然后工具才真正作用于外部环境。

#### 第六步：获得 Observation

工具执行后返回结果：

```json
{
  "status": "success",
  "data": {
    "cpu_usage": "normal",
    "io_latency": "increased_8x",
    "network_errors": 0
  }
}
```

这份结果对 Agent 来说不是“最终答案”，而是一次新的环境观测，即 Observation。

#### 第七步：更新 State

系统把工具调用和 Observation 写入 State：

```text
State_{t+1} = reduce(
  State_t,
  ProposedAction_t,
  Observation_t
)
```

更新内容可能包括：

- 已经调用过哪些工具；
- 工具返回了什么；
- 当前计划完成到哪一步；
- 新发现了哪些事实；
- 哪些假设被支持或否定；
- 剩余预算；
- 是否发生错误；
- 是否需要人工确认。

#### 第八步：构造下一轮 Context，再调用 LLM

系统不会简单地假设模型“记住了上一轮”。下一轮必须重新从 State 构造 Context：

```text
Context_{t+1} = build_context(State_{t+1})
Prompt_{t+1} = serialize(Context_{t+1})
```

然后再次调用模型：

```text
Prompt_{t+1} → LLM → Proposed Action_{t+1}
```

循环持续运行，直到模型给出最终回答，或者 Runtime 触发其他终止条件。

### 1.3 最小伪代码

一个最小 Agent Runtime 可以写成：

```python
def run_agent(user_goal, tools, limits):
    state = initialize_state(
        user_goal=user_goal,
        tools=tools,
        limits=limits,
    )

    while True:
        context = build_context(state)
        model_output = call_llm(context)

        if model_output.is_final_answer:
            return model_output.final_answer

        proposed_action = parse_action(model_output)
        validated_action = validate_action(
            proposed_action,
            state=state,
        )

        observation = execute_tool(validated_action)
        state = update_state(
            state,
            action=validated_action,
            observation=observation,
        )
```

这段代码已经包含 Agent 最小闭环：

```text
构造上下文
→ 模型决策
→ 工具执行
→ 获得观测
→ 更新状态
→ 再构造上下文
```

### 1.4 真正的循环不是 LLM 自己在调用工具

表面上我们常说：

```text
LLM → Tool → LLM
```

但更准确地说，真正控制循环的是 Agent Runtime：

```text
Runtime 调用 LLM
→ LLM 输出 Tool Call
→ Runtime 校验并执行 Tool
→ Runtime 得到 Tool Result
→ Runtime 把结果写入 State
→ Runtime 构造新 Context
→ Runtime 再次调用 LLM
```

模型本身通常只负责生成输出。它不会天然保存长期任务状态，也不会直接拥有操作系统、数据库或外部 API 的执行权。

因此，Agent 不是“一个会自己调用工具的 LLM”，而是：

> **一个以 LLM 作为决策策略、由 Runtime 维护状态并驱动工具交互的循环系统。**

### 1.5 循环如何终止

循环不应只依赖模型说“我完成了”。生产系统通常还要定义明确的终止条件：

- 模型返回 Final Answer；
- 目标状态已经满足；
- 验证器确认任务完成；
- 达到最大循环次数；
- token、时间或成本预算耗尽；
- 工具持续失败；
- 遇到不可恢复错误；
- 需要用户补充信息；
- 高风险动作等待人工确认；
- 用户取消任务。

因此，循环控制本身也是 Agent 工程的一部分。

### 1.6 实际系统可能不是严格的一次 LLM 对一次 Tool

最小模型是交替循环，但生产系统可能出现：

- 一次 LLM 输出多个并行工具调用；
- 工具调用后由确定性代码直接触发另一个工具；
- 先由 Planner 生成计划，再由 Executor 执行；
- 一个主 Agent 调用多个子 Agent；
- 某些轮次只进行内部状态整理，不调用外部工具；
- 某些任务只需一次 LLM 调用，不进入循环；
- 某些工具执行时间很长，需要异步事件重新唤醒任务。

但无论系统多复杂，核心仍然可以还原为：

```text
模型根据当前 Context 选择下一步
→ 环境返回新的 Observation
→ 系统据此构造下一轮 Context
```

---

## 2. 时序视图与结构视图如何对应

`Prompt → LLM → Tool → LLM` 是从时间顺序观察 Agent。

`State → Context → Model → Action → Environment → State` 是从系统结构观察 Agent。

二者可以一一对应：

| 运行时序中的概念 | 系统结构中的概念 | 含义 |
|---|---|---|
| 用户请求 | 初始 State 的一部分 | 定义任务目标和初始约束 |
| Prompt / Messages | Context 的具体序列化结果 | 本轮真正发送给模型的信息 |
| LLM 输出 | Proposed Action 或 Final Answer | 模型对下一步的建议 |
| Tool Call | Action 的结构化表达 | 模型希望 Runtime 执行的动作 |
| Tool Executor | Mechanism | 负责可靠调用真实工具 |
| Tool Result | Observation | 环境对动作的反馈 |
| 历史消息 | State 的一种视图 | 不一定等于完整系统状态 |
| 下一轮 Prompt | 新 State 编译出的 Context | 加入新观测后重新构造 |
| Final Answer | 终止动作或交付结果 | 结束循环并返回用户 |

因此，更精确的时序应该写成：

```text
State_t
→ Context_t
→ Prompt_t
→ LLM
→ ProposedAction_t
→ Tool_t
→ Observation_t
→ State_{t+1}
→ Context_{t+1}
→ Prompt_{t+1}
→ LLM
```

其中：

```text
Prompt_t = serialize(Context_t)
Context_t = compile(State_t, Tools_t, Budget_t, Permissions_t)
State_{t+1} = update(State_t, Action_t, Observation_t)
```

这也解释了为什么 Context Engineering 是 Agent 的核心：

> 工具执行本身不会自动让模型变聪明；只有当工具结果被正确写入 State，并以正确形式进入下一轮 Context，模型才能基于新事实继续推理。

---

## 3. 一个统一的软件系统抽象

传统软件可以抽象为：

```text
State_t
→ Input_t
→ Explicit Logic
→ Action_t
→ Environment
→ State_{t+1}
```

Agent 可以抽象为：

```text
State_t
→ Context_t
→ Model
→ Proposed Action_t
→ Validation
→ Environment
→ State_{t+1}
```

二者拥有相同的外部闭环，真正发生变化的是中间的**决策方式**。

### 3.1 State 是系统真实拥有的状态

State 可以包括：

- 数据库中的业务数据；
- 当前任务状态和完成进度；
- 事件日志；
- 文件与工作区；
- 长短期记忆；
- 工具执行结果；
- 用户授权；
- 外部资源状态；
- 错误、重试次数和人工确认状态。

### 3.2 Context 是 State 面向模型的编译结果

模型通常不应该，也不可能在每一轮看到完整 State。系统需要从 State 中进行选择、检索、压缩、排序和序列化，形成这一轮真正交给模型的 Context。

```text
Context_t = build_context(
  state=State_t,
  history=History_t,
  tools=Tools_t,
  permissions=Permissions_t,
  token_budget=Budget_t,
)
```

Context Builder 或 Context Compiler 决定：

- 哪些信息进入本轮上下文；
- 哪些信息被忽略、摘要或按需检索；
- 信息采用自然语言、JSON、XML、事件流还是其他结构；
- 任务目标、工具、历史和环境观测按什么顺序出现；
- 哪些内容需要标明来源、可信度和权限边界；
- 在有限 token budget 下优先保留什么。

模型基于 Context 提出下一步动作：

```text
ProposedAction_t = LLM(Context_t)
```

这里更准确的词是 **Proposed Action**，而不是直接的 Action。模型提出动作，确定性软件系统负责验证、授权和执行。

---

## 4. Agent 的认知内核：循环与上下文

从认知内核来看，Agent 工程最核心的确可以归结为两件事。

### 4.1 推理—行动循环如何运行

循环负责决定：

- 什么时候调用模型；
- 一轮调用还是多轮调用；
- 什么时候规划、执行、反思或回退；
- 什么时候调用工具；
- 失败后是重试、换策略、降级还是终止；
- 什么时候认为任务已经完成；
- 多个子任务或多个 Agent 如何调度。

ReAct、Plan-and-Execute、Reflection、Multi-Agent 等模式，首先都是对循环控制方式的不同设计。

### 4.2 每一轮模型看见什么

上下文构造负责决定：

- 当前任务和目标；
- 系统指令与行为边界；
- 历史对话与中间结果；
- 当前计划与任务进度；
- 可用工具及其 schema；
- 文件、网页、数据库和知识库的检索结果；
- 长期记忆；
- 环境观测；
- 上一轮的错误与反馈；
- 剩余预算和终止条件。

许多看起来不同的 Agent 能力，本质上都可以还原为以下两类变化：

1. **改变循环怎么走；**
2. **改变下一轮模型能看见什么。**

| Agent 概念 | 本质变化 |
|---|---|
| Memory | 改变未来轮次可获得的上下文 |
| RAG | 在本轮上下文中动态注入外部知识 |
| Planning | 在状态中增加计划，并改变后续循环路径 |
| Reflection | 把执行结果和错误重新放回上下文 |
| Tool Use | 扩展模型可以提出的动作空间 |
| Multi-Agent | 将一个循环拆分为多个带不同上下文和角色的循环 |
| Skills | 将可复用流程、指令和工具组合注入特定轮次 |

因此可以说：

> **Agent 的认知内核，是上下文构造器加上推理—行动控制循环。**

---

## 5. 传统软件工程究竟在做什么

传统软件也运行在同样的闭环中，只不过决定下一步动作的不是 LLM，而是工程师预先写好的代码、算法、规则、状态机和工作流。

```text
(State_t, Input_t)
→ Explicit Code
→ (Action_t, State_{t+1})
```

传统软件工程的核心，可以概括为：

> **由工程师显式定义状态、事件、状态转移规则、动作语义和系统不变量。**

### 5.1 定义 State

工程师首先要决定系统需要记住什么。例如一个任务可能包含：

```text
CREATED
RUNNING
WAITING_RETRY
PARTIAL_SUCCESS
SUCCESS
FAILED
CANCELLED
```

这对应到工程实践中的：

- 数据模型；
- 数据库表；
- 内存对象；
- 缓存结构；
- 事件模型；
- 状态机；
- 生命周期设计。

很多复杂系统的问题，根源并不是算法不够高级，而是状态定义不清楚、状态边界不完整，或者多个组件对同一个状态拥有不同理解。

### 5.2 编写状态转移函数

传统程序会显式规定：

```text
当前是什么状态
+ 收到了什么输入或事件
+ 满足什么条件
= 应该执行什么动作，并进入什么新状态
```

工程师不仅需要定义允许的状态转移，也需要明确禁止的状态转移。

```text
CREATED   → RUNNING     允许
RUNNING   → SUCCESS     允许
RUNNING   → FAILED      允许
FAILED    → RETRYING    允许
SUCCESS   → RUNNING     禁止
CANCELLED → SUCCESS     禁止
```

### 5.3 定义动作的精确语义

在传统软件中，“创建云盘”“退款”或“发送邮件”不能只是一句自然语言，而必须被定义成具有精确契约的接口：

```python
create_disk(
    region_id: str,
    zone_id: str,
    size_gib: int,
    disk_type: str,
    idempotency_token: str,
) -> Disk
```

动作需要有明确的：

- 参数和返回值；
- 前置条件和后置条件；
- 权限边界；
- 错误码；
- 超时语义；
- 幂等语义；
- 并发语义；
- 一致性语义；
- 回滚和补偿机制。

LLM 可以判断“下一步应该创建云盘”，但云盘究竟如何被安全、可靠地创建，仍然必须由传统软件定义。

### 5.4 保证系统不变量

传统软件工程尤其重要的一项工作，是定义并强制保证那些“无论发生什么都不能被破坏”的条件。例如：

- 已退款金额不能超过已支付金额；
- 库存不能小于零；
- 同一资源不能同时存在两个合法 owner；
- 已确认写入的数据不能静默丢失；
- 同一个幂等请求不能创建两份资源；
- 无权限主体不能执行高风险操作。

这些约束不能依赖模型“理解以后自觉遵守”，而要由数据库约束、事务、锁、CAS、共识协议、fencing token、权限系统和状态机校验强制保证。

### 5.5 处理异常世界

理想路径通常并不复杂，真正的软件工程难度来自现实世界中的不确定性：

- 网络超时；
- 服务重启；
- 请求重复；
- 消息乱序；
- 部分成功；
- 并发修改；
- 数据暂时不一致；
- 操作成功但响应丢失；
- 重试导致重复副作用；
- 下游依赖不可用。

例如：

```text
调用扣款接口
→ 实际扣款成功
→ 网络断开
→ 调用方只收到超时
→ 调用方发起重试
```

如果没有幂等性和事务设计，就可能发生重复扣款。

因此，传统软件工程不仅是在描述正常情况下“应该做什么”，还要确保系统在异常、并发、故障和部分失败条件下，仍然能够维持正确状态并最终收敛。

---

## 6. 两者的根本区别：谁拥有状态转移的决策权

传统软件和 Agent 都有状态、输入、循环、动作和环境。两者最本质的差异不是“有没有循环”，而是：

> **谁在运行时决定下一步动作。**

传统软件中：

```text
Action_t = explicit_code(State_t, Input_t)
```

这个函数由工程师预先编写，系统按照明确的条件、分支和规则运行。

Agent 中：

```text
Context_t = context_compiler(State_t, History_t, Tools_t)
ProposedAction_t = llm_policy(Context_t)
```

工程师不再穷举所有可能的语义判断和决策分支，而是更多地设计：

- 模型看见什么；
- 模型可以选择什么；
- 模型输出采用什么结构；
- 什么动作允许执行；
- 什么条件下必须拒绝、确认或转人工；
- 动作执行后如何形成新的状态和上下文。

因此可以说：

> **传统软件工程主要是在编写决策逻辑；Agent 工程更多是在设计决策环境。**

从另一个角度看，这是部分“状态转移权”的转移：

```text
传统软件：
State → Explicit Code → Action → Environment → State

Agent：
State → Context Compiler → LLM Policy → Proposed Action
      → Deterministic Validation → Execution → Environment → State
```

模型获得的是**提出状态转移建议的权力**，而不是无条件改变真实世界的权力。

---

## 7. Policy 与 Mechanism：Agent 系统最重要的边界

操作系统和分布式系统中常用一组概念：

- **Policy：应该做什么；**
- **Mechanism：具体怎么做。**

这组划分同样适用于 Agent。

### 7.1 LLM 更适合承担 Soft Policy

- 理解自然语言；
- 判断用户意图；
- 分析非结构化信息；
- 制定计划；
- 在多个工具之间选择；
- 处理规则难以穷举的开放性问题；
- 根据反馈动态调整策略。

### 7.2 传统软件更适合承担 Hard Mechanism 与 Hard Constraints

- 权限校验；
- 参数校验；
- 数据库事务；
- 幂等控制；
- 并发控制；
- 超时与重试；
- 爆炸半径限制；
- 审计；
- 回滚；
- 安全策略；
- 不变量保护。

因此，一个稳健的生产 Agent 应遵循：

```text
LLM = Soft Policy
Software = Hard Mechanism + Hard Constraints

Agent System = Probabilistic Core + Deterministic Shell
```

模型负责柔性的理解、判断和规划，确定性软件负责可靠、安全、可审计地执行。

---

## 8. 生产级 Agent 的完整架构

```text
┌───────────────────────────────────────────────────────────┐
│ State Store                                               │
│ 任务、历史、记忆、权限、环境状态、事件与执行结果            │
└────────────────────────────┬──────────────────────────────┘
                             ↓
┌───────────────────────────────────────────────────────────┐
│ Context Compiler                                          │
│ 选择、检索、压缩、排序、结构化、权限过滤、预算分配           │
└────────────────────────────┬──────────────────────────────┘
                             ↓
┌───────────────────────────────────────────────────────────┐
│ Prompt / Messages                                         │
│ 本轮发送给模型的具体输入表示                               │
└────────────────────────────┬──────────────────────────────┘
                             ↓
┌───────────────────────────────────────────────────────────┐
│ LLM Policy                                                │
│ 理解、判断、规划、工具选择、参数草案、继续或终止建议          │
└────────────────────────────┬──────────────────────────────┘
                             ↓
┌───────────────────────────────────────────────────────────┐
│ Proposed Action                                           │
└────────────────────────────┬──────────────────────────────┘
                             ↓
┌───────────────────────────────────────────────────────────┐
│ Governor / Validator                                      │
│ Schema、权限、业务规则、风险、人审、安全与不变量检查         │
└────────────────────────────┬──────────────────────────────┘
                             ↓
┌───────────────────────────────────────────────────────────┐
│ Tool Runtime / Executor                                   │
│ API、超时、重试、限流、熔断、幂等、事务、沙箱与回滚           │
└────────────────────────────┬──────────────────────────────┘
                             ↓
┌───────────────────────────────────────────────────────────┐
│ Environment → Observation → State Store                   │
└───────────────────────────────────────────────────────────┘
```

### 8.1 State Store

保存系统真实状态，而不是把全部状态寄托在模型上下文中。上下文窗口不是数据库，也不是可靠状态存储。

### 8.2 Context Compiler

将当前 State 编译为模型可消费的 Context。它处理的不是简单的“拼 Prompt”，而是一整套从系统状态到模型输入的确定性转换过程。

### 8.3 Prompt / Messages

Prompt 是 Context 在某个模型 API 上的具体传输形式，可能包括：

- system message；
- user message；
- assistant history；
- tool schemas；
- tool results；
- 文件或多模态输入；
- 输出格式约束。

### 8.4 LLM Policy

模型根据上下文产生回答、判断、计划、工具选择、参数草案和下一步动作建议。

### 8.5 Governor / Validator

这是模型和真实世界之间的治理层，负责 schema 校验、业务规则、权限检查、风险分级、人工确认、安全策略和不变量保护。

### 8.6 Tool Runtime / Executor

执行层把合法的 Proposed Action 变成真实动作，并提供超时、重试、限流、熔断、幂等、事务、沙箱、回滚和执行结果标准化。

### 8.7 Observability 与 Evaluation

传统软件通常关注调用成功率、延迟、错误码和资源使用；Agent 还需要观察完整决策轨迹：

- 每轮模型实际看见了什么；
- Prompt 如何由 State 构造；
- 模型提出了什么动作；
- 调用了哪些工具；
- 工具参数是否正确；
- 工具结果是否被正确理解；
- 哪一步出现了偏差；
- 是否进行了无效循环；
- 是否在正确时机终止；
- 最终状态是否真正满足任务目标；
- 模型或 Prompt 版本变化是否造成行为漂移。

---

## 9. 一个故障诊断与恢复的时序例子

假设用户要求：

```text
分析一次云盘 IO 延迟故障，判断最可能的根因。
```

一次真实的 Agent 时序可能是：

```text
第 0 轮 Context
= 用户目标
+ 故障基础信息
+ 指标查询工具
+ 日志查询工具
+ 变更查询工具
+ 安全与查询范围限制

第 0 次 LLM
→ 提议调用指标查询工具

指标工具
→ 返回 IO 延迟上升、CPU 正常、网络正常

第 1 轮 Context
= 原目标
+ 已执行动作
+ 指标 Observation
+ 剩余工具和预算

第 1 次 LLM
→ 根据指标结果，提议查询故障时间段内的宿主机变更

变更工具
→ 返回故障前 10 分钟发生存储路径配置变更

第 2 轮 Context
= 原目标
+ 指标结果
+ 变更结果
+ 当前诊断假设

第 2 次 LLM
→ 提议查询对应路径的错误日志

日志工具
→ 返回路径切换后大量重试和队列积压

第 3 轮 Context
= 所有关键 Observation
+ 当前证据链
+ 输出要求

第 3 次 LLM
→ 输出根因判断、证据、置信度和下一步恢复建议
```

这段时序从表面看是：

```text
Prompt
→ LLM
→ Metrics Tool
→ LLM
→ Change Tool
→ LLM
→ Log Tool
→ LLM
→ Final Answer
```

从结构上看则是：

```text
State
→ Context
→ Model
→ Proposed Action
→ Tool
→ Observation
→ State
→ Context
→ Model
```

在这个系统中，LLM 适合负责：

- 将多源信息组织成假设；
- 选择下一步调查方向；
- 理解日志和自然语言变更信息；
- 动态组合已有诊断工具；
- 在证据不足时修正计划。

传统软件仍然负责：

- 指标和日志的真实查询；
- 鉴权与数据隔离；
- 查询范围与资源限制；
- 恢复动作白名单；
- 爆炸半径控制；
- 幂等、超时和重试；
- 变更窗口检查；
- 回滚和审计；
- 高风险动作的人审门槛。

这说明 Agent 并没有替代传统工程，而是在传统可靠执行系统之上增加了一个更加通用的语义决策层。

---

## 10. 传统软件与 Agent 工程的对比

| 维度 | 传统软件工程 | Agent 工程 |
|---|---|---|
| 决策来源 | 工程师显式编写的代码、规则和状态机 | 模型基于上下文在运行时生成决策 |
| 运行时序 | 输入后执行预定义路径 | LLM 与工具在 Observation 驱动下循环 |
| 输入形式 | 参数、事件、结构化请求 | 自然语言、结构化数据、历史、工具结果和记忆 |
| 输出性质 | 通常是直接可执行动作 | 首先应视为 Proposed Action |
| 确定性 | 高，相同输入通常产生相同结果 | 概率性，行为可能随模型和上下文变化 |
| 主要抽象 | 函数、接口、对象、状态机、工作流 | State、Context、Prompt、Model、Tool、Trajectory |
| 工程师主要工作 | 编写状态转移函数 | 设计状态、上下文、循环、动作空间和治理边界 |
| 测试重点 | 单元测试、集成测试、不变量、边界条件 | 任务成功率、轨迹评测、工具选择、鲁棒性和漂移 |
| 失败模式 | Bug、异常、超时、并发和一致性问题 | 还包括幻觉、错误规划、上下文污染、死循环和行为漂移 |
| 安全方式 | 权限、类型、事务、状态机、静态规则 | 保留传统机制，并增加模型输入输出治理 |
| 擅长问题 | 规则明确、边界稳定、要求强确定性的任务 | 语义复杂、路径开放、规则难穷举的任务 |

---

## 11. Agent 工程的关键原则

### 11.1 State 应外置，不能只存在于对话历史

任务进度、权限、执行结果和关键事实应保存在外部 State Store 中，模型上下文只是它们的临时视图。

### 11.2 Prompt 是 Context 的表示，不是 Context 本身

Prompt 只是当前 Context 在模型接口上的一种序列化。不要把“写 Prompt”误认为完整的 Context Engineering。

### 11.3 每次 Tool Result 都必须成为可追踪的 Observation

工具结果需要被标准化、标注来源并写入 State，再由 Context Compiler 决定如何进入下一轮模型输入。

### 11.4 Context 是编译产物，而不是数据堆积

把所有信息都塞给模型通常不会得到更好的 Agent。上下文应该经过选择、检索、压缩、排序、来源标注和冲突处理。

### 11.5 模型输出是提议，不是命令

任何可能产生副作用的模型输出，都应先经过结构化解析、校验、授权和风险控制。

### 11.6 用确定性外壳包围概率性内核

越靠近真实资源、资金、权限和生产环境，越应该依赖确定性软件机制。LLM 的自由度应与动作风险成反比。

### 11.7 Capability 与 Authority 必须分离

“模型知道一个工具存在”不等于“模型有权调用它”。工具能力、调用权限、参数范围和审批策略应该由独立治理层控制。

### 11.8 评测对象应是完整轨迹

不能只评测模型最后一句回答，还要评测：

- 每一轮 Context 是否正确；
- 是否选择了正确工具；
- 工具参数是否正确；
- Observation 是否被正确理解；
- 是否出现无效或重复调用；
- 循环是否及时终止；
- 最终 State 是否满足目标。

### 11.9 失败必须成为显式 State

超时、拒绝、权限不足、部分成功、等待人工确认等情况，都应该成为明确状态，而不是被隐藏在一段自然语言中。

### 11.10 循环必须有预算和终止保护

任何 Agent Loop 都需要最大轮数、时间、成本、token、工具调用次数和错误次数限制，避免无效循环或失控执行。

---

## 12. 什么时候应该使用 Agent

一个任务更适合传统软件，通常因为：

- 规则可以完整枚举；
- 输入和输出结构稳定；
- 错误成本很高；
- 必须严格确定；
- 业务不变量复杂；
- 延迟和成本极其敏感。

一个任务更适合引入 Agent，通常因为：

- 输入包含大量自然语言或非结构化信息；
- 决策路径难以预先穷举；
- 需要跨多个系统动态调查；
- 需要根据中间结果不断调整计划；
- 人类原本依靠经验、语义理解和判断完成任务；
- 可以通过工具约束和结果校验控制风险。

现实中最好的方案通常不是二选一，而是：

```text
确定性流程处理稳定主干
+ LLM 处理开放性判断
+ Agent Runtime 驱动 LLM—Tool 循环
+ 确定性治理层验证模型动作
+ 传统执行系统完成真实副作用
```

---

## 13. 最终定义

可以将传统软件工程概括为：

> **传统软件工程，是显式定义状态、事件、规则、动作和不变量，使系统在正常与异常环境中可靠完成状态转移。**

可以将 Agent 工程概括为：

> **Agent 工程，是维护任务状态，持续把状态编译成模型上下文，并通过 LLM—Tool—Observation 循环，在确定性约束下完成概率性的状态转移。**

二者最精炼的对比是：

```text
传统软件工程：工程师编写状态转移函数
Agent 工程：工程师设计状态转移函数的运行环境
```

从运行时序上，Agent 是：

```text
Prompt
→ LLM
→ Tool
→ Observation
→ Prompt
→ LLM
→ Tool
→ Observation
→ ...
→ Final Answer
```

从系统结构上，Agent 是：

```text
State
→ Context Compiler
→ Prompt
→ LLM Policy
→ Proposed Action
→ Deterministic Governor
→ Tool Runtime
→ Environment
→ Observation
→ State
```

一个完整的生产级 Agent 可以表示为：

```text
Agent System
= State Runtime
+ Context Compiler
+ LLM Policy
+ Deterministic Governor
+ Tool Runtime
+ Loop Controller
+ Observability & Evaluation
```

最终，Agent 并没有取消传统软件工程。它只是把原来由工程师显式编码的一部分语义判断和决策逻辑，转移到了模型的运行时推理中。

> **让模型处理语义、判断、规划和开放性；让软件处理状态、循环、权限、约束、一致性和可靠执行。**
