import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, totalOf, type ProjectInfo } from '../api'

export default function Projects() {
  const [list, setList] = useState<ProjectInfo[]>([])
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    api.projects()
      .then(setList)
      .catch(e => setErr(String(e)))
      .finally(() => setLoading(false))
  }, [])

  if (err) return <div className="card">加载失败：{err}</div>
  if (loading) return <div className="card"><div className="loading"><div className="spinner" />正在加载项目列表...</div></div>
  return (
    <>
      <h2>项目列表（{list.length}）</h2>
      <div className="card">
        <table>
          <thead>
            <tr><th>项目路径</th><th>会话数</th><th>最后活跃</th><th>Token 总量</th></tr>
          </thead>
          <tbody>
            {list.map(p => (
              <tr key={p.id}>
                <td><Link to={`/projects/${encodeURIComponent(p.id)}`}>{p.cwd}</Link></td>
                <td>{p.sessionCount}</td>
                <td>{p.lastActive?.slice(0, 19).replace('T', ' ')}</td>
                <td>{totalOf(p.usage).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
