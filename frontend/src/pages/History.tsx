import { useEffect, useState } from 'react'
import { api, type HistoryDay } from '../api'

export default function History() {
  const [days, setDays] = useState<HistoryDay[]>([])
  const [err, setErr] = useState('')
  const [open, setOpen] = useState<Record<string, boolean>>({})

  useEffect(() => {
    api.history().then(d => {
      setDays(d)
      // 默认展开最近一天
      if (d.length > 0) setOpen({ [d[0].date]: true })
    }).catch(e => setErr(String(e)))
  }, [])

  if (err) return <div className="card">加载失败：{err}</div>

  return (
    <>
      <h2>历史记录（按天）</h2>
      {days.map(day => (
        <div className="card" key={day.date}>
          <div
            style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
            onClick={() => setOpen(o => ({ ...o, [day.date]: !o[day.date] }))}
          >
            <strong>{day.date}</strong>
            <span style={{ color: '#6b7280' }}>{day.count} 条 {open[day.date] ? '▾' : '▸'}</span>
          </div>
          {open[day.date] && (
            <table style={{ marginTop: 12 }}>
              <thead>
                <tr><th style={{ width: 80 }}>时间</th><th>项目</th><th>内容</th></tr>
              </thead>
              <tbody>
                {day.entries.map(e => (
                  <tr key={e.sessionId + e.timestamp}>
                    <td>{new Date(e.timestamp).toLocaleTimeString('zh-CN', { hour12: false })}</td>
                    <td style={{ fontSize: 12, color: '#6b7280', maxWidth: 220, wordBreak: 'break-all' }}>
                      {e.project}
                    </td>
                    <td style={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>
                      {e.display.length > 300 ? e.display.slice(0, 300) + '…' : e.display}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </>
  )
}
