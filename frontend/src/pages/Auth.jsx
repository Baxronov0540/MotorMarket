import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API, Auth } from '../api/client';
import { toast } from '../components/Toast';
import logo from '../assets/logo.svg';
import s from './Auth.module.scss';

export default function AuthPage() {
  const [tab, setTab] = useState('login');
  const [step, setStep] = useState(1); // register: 1=form, 2=confirm
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPage = searchParams.get('next') || '/';

  // Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const email = e.target.email.value;
    const password = e.target.password.value;
    try {
      await login(email, password);
      toast("Xush kelibsiz! 👋", 'success');
      navigate(nextPage);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Register
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const email = e.target.email.value;
    const password = e.target.password.value;
    try {
      await API.user.register(email, password);
      setStep(2);
      toast("Tasdiqlash kodi emailingizga yuborildi", 'info');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Confirm code
  const handleConfirm = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const code = e.target.code.value;
    try {
      const tokens = await API.user.confirm(code);
      Auth.setTokens(tokens.access_token, tokens.refresh_token);
      toast("Ro'yxatdan muvaffaqiyatli o'tdingiz! 🎉", 'success');
      navigate(nextPage);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (t) => { setTab(t); setError(''); setStep(1); };

  return (
    <div className={s.auth_page}>
      <div className={s.card}>
        <div className={s.card_header}>
          <div className={s.logo}>
            <img src={logo} alt="MotorMarket Logo" className={s.brand_logo} />
          </div>
          <h1>{tab === 'login' ? 'Xush kelibsiz!' : step === 2 ? 'Emailni tasdiqlang' : "Ro'yxatdan o'tish"}</h1>
          <p>{tab === 'login' ? 'Hisobingizga kiring' : step === 2 ? '6 xonali kodni kiriting' : 'Yangi hisob yarating'}</p>
        </div>

        <div className={s.tabs}>
          <button className={tab === 'login' ? s.active : ''} onClick={() => switchTab('login')}>Kirish</button>
          <button className={tab === 'register' ? s.active : ''} onClick={() => switchTab('register')}>Ro'yxatdan o'tish</button>
        </div>

        {tab === 'login' && (
          <form className={s.form} onSubmit={handleLogin}>
            {error && <div className={s.error_box}>{error}</div>}
            <div className="form-group">
              <label>Email</label>
              <input className="input" type="email" name="email" required placeholder="siz@example.com" />
            </div>
            <div className="form-group">
              <label>Parol</label>
              <input className="input" type="password" name="password" required placeholder="••••••••" />
            </div>
            <button className="btn btn--primary btn--block btn--lg" type="submit" disabled={loading}>
              {loading ? 'Kirish...' : 'Kirish'}
            </button>
          </form>
        )}

        {tab === 'register' && step === 1 && (
          <form className={s.form} onSubmit={handleRegister}>
            {error && <div className={s.error_box}>{error}</div>}
            <p className={s.hint}>Ro'yxatdan o'tgach, emailingizga 6 xonali tasdiqlash kodi yuboriladi.</p>
            <div className="form-group">
              <label>Email</label>
              <input className="input" type="email" name="email" required placeholder="siz@example.com" />
            </div>
            <div className="form-group">
              <label>Parol</label>
              <input className="input" type="password" name="password" required placeholder="Kamida 6 belgi" minLength={6} />
            </div>
            <button className="btn btn--primary btn--block btn--lg" type="submit" disabled={loading}>
              {loading ? 'Yuborilmoqda...' : 'Tasdiqlash kodini olish'}
            </button>
          </form>
        )}

        {tab === 'register' && step === 2 && (
          <form className={s.form} onSubmit={handleConfirm}>
            {error && <div className={s.error_box}>{error}</div>}
            <p className={s.hint}>📧 Emailingizga yuborilgan 6 xonali kodni kiriting.</p>
            <div className="form-group">
              <label>Tasdiqlash kodi</label>
              <input
                className={`input ${s.code_input}`}
                type="text"
                name="code"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                required
                placeholder="123456"
              />
            </div>
            <button className="btn btn--primary btn--block btn--lg" type="submit" disabled={loading}>
              {loading ? 'Tekshirilmoqda...' : 'Tasdiqlash'}
            </button>
            <button type="button" className="btn btn--ghost btn--block" onClick={() => setStep(1)}>
              ← Ortga
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
