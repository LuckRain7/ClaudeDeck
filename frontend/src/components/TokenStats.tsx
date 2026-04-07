import type { Usage } from '../api'

const fmt = (n: number) => n.toLocaleString()

export default function TokenStats({ usage }: { usage: Usage }) {
  return (
    <div className="stats">
      <div className="stat">
        <div className="label">Input</div>
        <div className="value">{fmt(usage.input_tokens)}</div>
      </div>
      <div className="stat">
        <div className="label">Output</div>
        <div className="value">{fmt(usage.output_tokens)}</div>
      </div>
      <div className="stat">
        <div className="label">Cache Create</div>
        <div className="value">{fmt(usage.cache_creation_input_tokens)}</div>
      </div>
      <div className="stat">
        <div className="label">Cache Read</div>
        <div className="value">{fmt(usage.cache_read_input_tokens)}</div>
      </div>
    </div>
  )
}
