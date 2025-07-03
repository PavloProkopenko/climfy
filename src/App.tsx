import { Outlet } from 'react-router'
import Layout from './shared/layout/layout'

function App() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}

export default App
