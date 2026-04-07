import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, totalOf, type SessionSummary } from '../api'

export default function ProjectDetail() {
  const { id = '' } = useParams()
  const [sessions, setSessions] = useState<SessionSummary[]>([])
  const [err, setErr] = useState('')
  useEffect(() => { api.sessions(id).then(setSessions).catch(e => setErr(String(e))) }, [id])
  if (err) return <div className="card">加载失败：{err}</div>
  return (
    <>
      <h2><Link to="/projects">← 项目</Link> / {decodeURIComponent(id)}</h2>
      <div className="card">
        <table>
          <thead>
            <tr><th>Session</th><th>开始</th><th>结束</th><th>消息数</th><th>Models</th><th>Tokens</th></tr>
          </thead>
          <tbody>
            {sessions.map(s => (
              <tr key={s.sessionId}>
                <td><Link to={`/projects/${encodeURIComponent(id)}/sessions/${s.sessionId}`}>{s.sessionId.slice(0, 8)}</Link></td>
                <td>{s.startedAt?.slice(0, 19).replace('T', ' ')}</td>
                <td>{s.endedAt?.slice(0, 19).replace('T', ' ')}</td>
                <td>{s.messageCount}</td>
                <td>{s.models?.join(', ')}</td>
                <td>{totalOf(s.usage).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
