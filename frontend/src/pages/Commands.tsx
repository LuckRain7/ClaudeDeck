import { useEffect, useState } from 'react'
import { api, type CommandInfo } from '../api'

export default function Commands() {
  const [list, setList] = useState<CommandInfo[]>([])
  const [err, setErr] = useState('')
  useEffect(() => { api.commands().then(setList).catch(e => setErr(String(e))) }, [])
  if (err) return <div className="card">加载失败：{err}</div>
  return (
    <>
      <h2>Slash Commands（{list.length}）</h2>
      <div className="card">
        <table>
          <thead>
            <tr><th>命令</th><th>描述</th></tr>
          </thead>
          <tbody>
            {list.map(c => (
              <tr key={c.path}>
                <td>/{c.name}</td>
                <td>{c.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
