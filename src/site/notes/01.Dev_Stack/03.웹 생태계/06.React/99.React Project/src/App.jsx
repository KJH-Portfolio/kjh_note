import { BrowserRouter } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import Layout from "./components/commons/Layout"
import '@/styles/globals.css'
import AppRouter from "./router/AppRouter"


function App() {

  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
            <AppRouter></AppRouter>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
