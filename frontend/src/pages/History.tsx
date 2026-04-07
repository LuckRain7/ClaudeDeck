import { useEffect, useMemo, useState } from 'react'
import { api, type HistoryDay, type HistoryEntry } from '../api'

interface SessionGroup {
  sessionId: string
  project: string
  startTs: number
  endTs: number
  entries: HistoryEntry[]
}

function groupBySession(entries: HistoryEntry[]): SessionGroup[] {
  const map = new Map<string, SessionGroup>()
  for (const e of entries) {
    let g = map.get(e.sessionId)
    if (!g) {
      g = { sessionId: e.sessionId, project: e.project, startTs: e.timestamp, endTs: e.timestamp, entries: [] }
      map.set(e.sessionId, g)
    }
    g.entries.push(e)
    if (e.timestamp < g.startTs) g.startTs = e.timestamp
    if (e.timestamp > g.endTs) g.endTs = e.timestamp
  }
  const groups = Array.from(map.values())
  groups.forEach(g => g.entries.sort((a, b) => a.timestamp - b.timestamp))
  groups.sort((a, b) => b.endTs - a.endTs)
  return groups
}

function fmtTime(ts: number) {
  return new Date(ts).toLocaleTimeString('zh-CN', { hour12: false })
}

export default function History() {
  const [days, setDays] = useState<HistoryDay[]>([])
  const [err, setErr] = useState('')
  const [openDay, setOpenDay] = useState<Record<string, boolean>>({})
  const [openSess, setOpenSess] = useState<Record<string, boolean>>({})

  useEffect(() => {
    api.history().then(d => {
      setDays(d)
      if (d.length > 0) setOpenDay({ [d[0].date]: true })
    }).catch(e => setErr(String(e)))
  }, [])

  const grouped = useMemo(
    () => days.map(d => ({ ...d, sessions: groupBySession(d.entries) })),
    [days]
  )

  if (err) return <div className="card">加载失败：{err}</div>

  return (
    <>
      <h2>历史记录（按会话）</h2>
      {/* 按天分组渲染，每一天是一个可折叠的卡片 */}
      {grouped.map(day => (
        <div className="card" key={day.date}>
          {/* 日期头部：点击切换当天的展开/收起 */}
          <div
            className="history-day-header"
            onClick={() => setOpenDay(o => ({ ...o, [day.date]: !o[day.date] }))}
          >
            <strong>{day.date}</strong>
            <span className="history-day-meta">
              {day.sessions.length} 个会话 · {day.count} 条 {openDay[day.date] ? '▾' : '▸'}
            </span>
          </div>

          {/* 展开当天后渲染该日下属的会话列表 */}
          {openDay[day.date] && (
            <div className="history-session-list">
              {day.sessions.map(s => {
                // 用「日期 + 会话 ID」作为唯一 key，避免跨天会话相互影响
                const key = day.date + '/' + s.sessionId
                const isOpen = openSess[key] ?? false
                return (
                  <div className="history-session" key={key}>
                    {/* 会话头部：展示项目路径 / 会话 ID / 起止时间，点击切换条目列表 */}
                    <div
                      className="history-session-header"
                      onClick={() => setOpenSess(o => ({ ...o, [key]: !isOpen }))}
                    >
                      <div className="history-session-info">
                        <div className="history-session-id">
                          <span>{s.sessionId.slice(0, 8)}</span><span style={{marginLeft: '12px'}}>[{fmtTime(s.startTs)}–{fmtTime(s.endTs)}]</span>
                        </div>
                        <div className="history-session-project" title={s.project}>
                          {s.project}
                        </div>
                      </div>
                      <span className="history-session-count">
                        {s.entries.length} 条 {isOpen ? '▾' : '▸'}
                      </span>
                    </div>

                    {/* 展开会话后渲染条目明细表，过长内容截断到 300 字符 */}
                    {isOpen && (
                      <table className="history-entry-table">
                        <thead>
                          <tr>
                            <th className="history-entry-time">时间</th>
                            <th>内容</th>
                          </tr>
                        </thead>
                        <tbody>
                          {s.entries.map(e => (
                            <tr key={e.sessionId + e.timestamp}>
                              <td>{fmtTime(e.timestamp)}</td>
                              <td className="history-entry-content">
                                {e.display.length > 300 ? e.display.slice(0, 300) + '…' : e.display}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ))}
    </>
  )
}
