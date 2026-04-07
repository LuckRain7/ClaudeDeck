export interface Usage {
  input_tokens: number
  output_tokens: number
  cache_creation_input_tokens: number
  cache_read_input_tokens: number
}

export interface ProjectInfo {
  id: string
  cwd: string
  sessionCount: number
  lastActive: string
  usage: Usage
}

export interface SessionSummary {
  sessionId: string
  file: string
  startedAt: string
  endedAt: string
  messageCount: number
  usage: Usage
  models: string[]
}

export interface SessionMessage {
  uuid: string
  type: string
  role?: string
  model?: string
  timestamp: string
  usage?: Usage
}

export interface SessionDetail extends SessionSummary {
  messages: SessionMessage[]
}

export interface Summary {
  total: Usage
  byProject: ProjectInfo[]
  byModel: Record<string, Usage>
}

async function get<T>(url: string): Promise<T> {
  const r = await fetch(url)
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`)
  return r.json()
}

export interface PluginInstall {
  name: string
  scope: string
  installPath: string
  version: string
  installedAt: string
  lastUpdated: string
  gitCommitSha: string
}

export interface SkillInfo {
  name: string
  description: string
  userInvocable: boolean
  path: string
}

export interface CommandInfo {
  name: string
  description: string
  path: string
}

export interface HistoryEntry {
  display: string
  timestamp: number
  project: string
  sessionId: string
}

export interface HistoryDay {
  date: string
  count: number
  entries: HistoryEntry[]
}

export const api = {
  plugins: () => get<PluginInstall[]>('/api/plugins'),
  skills: () => get<SkillInfo[]>('/api/skills'),
  commands: () => get<CommandInfo[]>('/api/commands'),
  history: () => get<HistoryDay[]>('/api/history'),
  settings: () => get<any>('/api/settings'),
  projects: () => get<ProjectInfo[]>('/api/projects'),
  summary: () => get<Summary>('/api/usage/summary'),
  sessions: (projectId: string) =>
    get<SessionSummary[]>(`/api/projects/${encodeURIComponent(projectId)}/sessions`),
  session: (projectId: string, sid: string) =>
    get<SessionDetail>(`/api/projects/${encodeURIComponent(projectId)}/sessions/${sid}`),
}

export function totalOf(u: Usage): number {
  return u.input_tokens + u.output_tokens + u.cache_creation_input_tokens + u.cache_read_input_tokens
}
