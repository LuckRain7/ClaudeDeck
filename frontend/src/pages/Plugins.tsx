import { useEffect, useState } from 'react'
import { api, type PluginInstall } from '../api'

export default function Plugins() {
  const [list, setList] = useState<PluginInstall[]>([])
  const [err, setErr] = useState('')
  useEffect(() => { api.plugins().then(setList).catch(e => setErr(String(e))) }, [])
  if (err) return <div className="card">加载失败：{err}</div>
  return (
    <>
      <h2>已安装插件（{list.length}）</h2>
      <div className="card">
        <table>
          <thead>
            <tr><th>名称</th><th>版本</th><th>Scope</th><th>安装时间</th><th>最近更新</th><th>路径</th></tr>
          </thead>
          <tbody>
            {list.map(p => (
              <tr key={p.name + p.installPath}>
                <td>{p.name}</td>
                <td>{p.version}</td>
                <td>{p.scope}</td>
                <td>{p.installedAt?.slice(0, 10)}</td>
                <td>{p.lastUpdated?.slice(0, 10)}</td>
                <td style={{ fontSize: 12, color: '#6b7280' }}>{p.installPath}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
