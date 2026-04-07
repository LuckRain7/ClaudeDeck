import { NavLink, Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <h1>Claude Code 看板</h1>
        <NavLink to="/" end>概览</NavLink>
        <NavLink to="/projects">项目</NavLink>
        <NavLink to="/history">历史记录</NavLink>
        <NavLink to="/plugins">插件</NavLink>
        <NavLink to="/skills">Skills</NavLink>
        <NavLink to="/commands">Commands</NavLink>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
