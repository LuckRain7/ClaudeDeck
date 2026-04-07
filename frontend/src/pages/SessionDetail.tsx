import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, type SessionDetail as Detail } from '../api'
import TokenStats from '../components/TokenStats'

export default function SessionDetail() {
  const { id = '', sid = '' } = useParams()
  const [d, setD] = useState<Detail | null>(null)
  const [err, setErr] = useState('')
  useEffect(() => { api.session(id, sid).then(setD).catch(e => setErr(String(e))) }, [id, sid])
  if (err) return <div className="card">加载失败：{err}</div>
  if (!d) return <div className="card">加载中…</div>
  return (
    <>
      <h2>
        <Link to={`/projects/${encodeURIComponent(id)}`}>← 返回</Link> / Session {sid.slice(0, 8)}
      </h2>
      <div className="card">
        <TokenStats usage={d.usage} />
      </div>
      <div className="card">
        <h3>消息（{d.messageCount}）</h3>
        <table>
          <thead>
            <tr><th>时间</th><th>类型</th><th>角色</th><th>模型</th><th>Tokens</th></tr>
          </thead>
          <tbody>
            {d.messages.map(m => (
              <tr key={m.uuid}>
                <td>{m.timestamp?.slice(11, 19)}</td>
                <td>{m.type}</td>
                <td>{m.role || '-'}</td>
                <td>{m.model || '-'}</td>
                <td>{m.usage ? (m.usage.input_tokens + m.usage.output_tokens).toLocaleString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
