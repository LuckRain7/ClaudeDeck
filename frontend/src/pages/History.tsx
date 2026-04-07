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
      {grouped.map(day => (
        <div className="card" key={day.date}>
          <div
            style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
            onClick={() => setOpenDay(o => ({ ...o, [day.date]: !o[day.date] }))}
          >
            <strong>{day.date}</strong>
            <span style={{ color: '#6b7280' }}>
              {day.sessions.length} 个会话 · {day.count} 条 {openDay[day.date] ? '▾' : '▸'}
            </span>
          </div>

          {openDay[day.date] && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {day.sessions.map(s => {
                const key = day.date + '/' + s.sessionId
                const isOpen = openSess[key] ?? false
                return (
                  <div
                    key={key}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: 8,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        cursor: 'pointer',
                        padding: '8px 12px',
                        background: '#f9fafb',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 12,
                      }}
                      onClick={() => setOpenSess(o => ({ ...o, [key]: !isOpen }))}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            fontSize: 12,
                            color: '#6b7280',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={s.project}
                        >
                          {s.project}
                        </div>
                        <div style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'monospace' }}>
                          {s.sessionId.slice(0, 8)} · {fmtTime(s.startTs)} – {fmtTime(s.endTs)}
                        </div>
                      </div>
                      <span style={{ color: '#6b7280', fontSize: 12 }}>
                        {s.entries.length} 条 {isOpen ? '▾' : '▸'}
                      </span>
                    </div>

                    {isOpen && (
                      <table style={{ margin: 0 }}>
                        <thead>
                          <tr>
                            <th style={{ width: 80 }}>时间</th>
                            <th>内容</th>
                          </tr>
                        </thead>
                        <tbody>
                          {s.entries.map(e => (
                            <tr key={e.sessionId + e.timestamp}>
                              <td>{fmtTime(e.timestamp)}</td>
                              <td style={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>
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
