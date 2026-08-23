<script setup lang="ts">
import MermaidDiagram from './MermaidDiagram.vue'
import agentTwoViews from '../../agents/assets/agent-two-views.svg'
import agentCoreShell from '../../agents/assets/agent-core-shell.svg'

defineProps<{
  placement: 'before' | 'after'
}>()

const runtimeSequence = String.raw`
sequenceDiagram
    autonumber
    actor U as User
    participant R as Agent Runtime
    participant M as LLM
    participant G as Governor
    participant T as Tool
    participant E as Environment

    U->>R: Goal / Request
    loop Until final answer or stop condition
        R->>R: Build Context from State
        R->>M: Prompt + Messages + Tool Schemas
        alt Final answer
            M-->>R: Final Answer
        else Tool call
            M-->>R: Proposed Tool Call
            R->>G: Validate schema, permission, risk
            G-->>R: Approved Action
            R->>T: Execute Tool
            T->>E: Read or mutate
            E-->>T: Result
            T-->>R: Observation
            R->>R: Update State
        end
    end
    R-->>U: Deliver result
`

const structuralLoop = String.raw`
flowchart LR
    S[(State_t)] --> C[Context Compiler]
    C --> P[Prompt / Messages]
    P --> M[LLM Policy]
    M --> D{Model Output}
    D -->|Tool Call| G[Governor / Validator]
    G --> T[Tool Runtime]
    T --> E[Environment]
    E --> O[Observation_t]
    O --> U[State Update]
    U --> S
    D -->|Final Answer| F([Finish])
`

const productionArchitecture = String.raw`
flowchart TB
    S[(State Store)]
    C[Context Compiler]
    P[Prompt / Messages]
    M[LLM Policy]
    A[Proposed Action]
    G[Governor / Validator]
    T[Tool Runtime / Executor]
    E[Environment]
    O[Observation]
    X[Observability & Evaluation]

    S --> C --> P --> M --> A --> G --> T --> E --> O --> S
    S -.-> X
    C -.-> X
    M -.-> X
    A -.-> X
    G -.-> X
    T -.-> X
`

const incidentSequence = String.raw`
sequenceDiagram
    autonumber
    actor U as User
    participant R as Agent Runtime
    participant L as LLM
    participant M as Metrics Tool
    participant C as Change Tool
    participant G as Log Tool

    U->>R: Analyze EBS IO latency incident
    R->>L: Context_0: goal + incident + tools
    L-->>R: Query metrics
    R->>M: Read CPU, network and IO metrics
    M-->>R: IO latency up; CPU and network normal

    R->>L: Context_1 + metrics observation
    L-->>R: Query recent changes
    R->>C: Read changes in incident window
    C-->>R: Storage path config changed 10 min earlier

    R->>L: Context_2 + metrics + change
    L-->>R: Query path error logs
    R->>G: Read path switch and queue logs
    G-->>R: Retries and queue backlog after path switch

    R->>L: Context_3 + complete evidence chain
    L-->>R: Root cause + evidence + confidence + next action
    R-->>U: Diagnosis and recovery recommendation
`
</script>

<template>
  <figure v-if="placement === 'before'" class="agent-figure agent-figure--hero">
    <img
      :src="agentTwoViews"
      alt="Agent 的运行时序与系统结构双视图"
    >
    <figcaption>
      同一个 Agent：左侧是时间上的 LLM—Tool 循环，右侧是结构上的 State—Context—Action 闭环。
    </figcaption>
  </figure>

  <section v-else class="agent-visual-appendix" aria-labelledby="agent-visual-guide">
    <hr>
    <h2 id="agent-visual-guide">可视化附录：Agent 如何真正运行</h2>
    <p>
      下面把全文最重要的四个关系画出来：运行时序、状态闭环、概率性内核与确定性外壳，以及生产故障诊断中的多轮轨迹。
    </p>

    <h3>运行时序：真正驱动循环的是 Runtime</h3>
    <MermaidDiagram
      :code="runtimeSequence"
      caption="Runtime 构造上下文、调用 LLM、校验并执行工具，再把 Observation 写回 State。"
    />

    <h3>结构闭环：Observation 如何进入下一轮 Context</h3>
    <MermaidDiagram
      :code="structuralLoop"
      caption="工具结果只有经过 State Update 和 Context Compiler，才会成为模型下一轮可以使用的事实。"
    />

    <h3>生产边界：概率性内核，确定性外壳</h3>
    <figure class="agent-figure">
      <img
        :src="agentCoreShell"
        alt="由确定性软件外壳包围 LLM 概率性内核的生产级 Agent 架构"
      >
      <figcaption>
        LLM 负责开放性判断；Governor、权限、事务、幂等与 Tool Runtime 负责把动作约束在可验证、可授权、可审计的边界内。
      </figcaption>
    </figure>

    <h3>生产级 Agent 的完整结构</h3>
    <MermaidDiagram
      :code="productionArchitecture"
      caption="生产系统不仅有模型和工具，还需要状态、上下文编译、治理、执行、观测与评测。"
    />

    <h3>案例：云盘 IO 延迟诊断的多轮轨迹</h3>
    <MermaidDiagram
      :code="incidentSequence"
      caption="指标、变更和日志依次成为新的 Observation，推动 Agent 修正假设并形成证据链。"
    />
  </section>
</template>
