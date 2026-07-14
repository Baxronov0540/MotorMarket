import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Auth from './pages/Auth';
import ListingDetail from './pages/ListingDetail';
import CreateListing from './pages/CreateListing';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Saved from './pages/Saved';
import './styles/global.scss';

function Footer() {
  return (
    <footer style={{
      background: '#13141F',
      borderTop: '1px solid rgba(255,255,255,0.07)',
      padding: '24px 0',
      marginTop: 'auto'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <span style={{ fontSize: '13px', color: '#6B6B90' }}>© {new Date().getFullYear()} MotorMarket — Barcha huquqlar himoyalangan</span>
        <span style={{ fontSize: '13px', color: '#6B6B90' }}>Faqat transport vositalari uchun e'lonlar bozori</span>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', paddingTop: '84px' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/listing/:id" element={<ListingDetail />} />
                <Route path="/create" element={<CreateListing />} />
                <Route path="/edit/:id" element={<CreateListing editMode={true} />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/saved" element={<Saved />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
