import { useEffect, useState } from 'react'
import { api, type Summary } from '../api'
import TokenStats from '../components/TokenStats'

export default function Overview() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [settings, setSettings] = useState<any>(null)
  const [err, setErr] = useState<string>('')

  useEffect(() => {
    api.summary().then(setSummary).catch(e => setErr(String(e)))
    api.settings().then(setSettings).catch(() => {})
  }, [])

  if (err) return <div className="card">加载失败：{err}</div>
  if (!summary) return <div className="card">加载中…</div>

  return (
    <>
      <h2>全局 Token 概览</h2>
      <div className="card">
        <TokenStats usage={summary.total} />
      </div>

      <div className="card">
        <h3>按模型</h3>
        <table>
          <thead>
            <tr><th>Model</th><th>Input</th><th>Output</th><th>Cache Create</th><th>Cache Read</th></tr>
          </thead>
          <tbody>
            {Object.entries(summary.byModel).map(([m, u]) => (
              <tr key={m}>
                <td>{m}</td>
                <td>{u.input_tokens.toLocaleString()}</td>
                <td>{u.output_tokens.toLocaleString()}</td>
                <td>{u.cache_creation_input_tokens.toLocaleString()}</td>
                <td>{u.cache_read_input_tokens.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {settings && (
        <div className="card">
          <h3>settings.json</h3>
          <pre>{JSON.stringify(settings, null, 2)}</pre>
        </div>
      )}
    </>
  )
}
