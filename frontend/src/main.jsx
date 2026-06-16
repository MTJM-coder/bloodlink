import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css'
import App from './App.jsx'
import Login from './pages/login.jsx'
import Home from './pages/Home.jsx';
import DashboardBank from './pages/DashboardBank.jsx';
import DashboardLayout from './components/DashboardLayout.jsx';
import Alertes from './pages/Alertes.jsx';
import Stock from './pages/Stock.jsx';
import Cautions from './pages/Cautions.jsx';


createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/bank/dashboard" element={<DashboardLayout/>}>

        <Route index element={<DashboardBank/>}/>
         <Route path="stock" element={<Stock />} />
         <Route path="alertes" element={<Alertes />} />
           <Route path="cautions" element={<Cautions />} />
      </Route>

    </Routes>
  </BrowserRouter>
)
