import { useEffect, useState } from 'react'
import { api, type SkillInfo } from '../api'

export default function Skills() {
  const [list, setList] = useState<SkillInfo[]>([])
  const [err, setErr] = useState('')
  useEffect(() => { api.skills().then(setList).catch(e => setErr(String(e))) }, [])
  if (err) return <div className="card">加载失败：{err}</div>
  return (
    <>
      <h2>Skills（{list.length}）</h2>
      <div className="card">
        <table>
          <thead>
            <tr><th>名称</th><th>用户可调用</th><th>描述</th></tr>
          </thead>
          <tbody>
            {list.map(s => (
              <tr key={s.path}>
                <td>{s.name}</td>
                <td>{s.userInvocable ? '✓' : ''}</td>
                <td>{s.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
