import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { toast } from '../components/Toast';
import ListingCard, { ListingCardSkeleton, formatPrice } from '../components/ListingCard';

export default function Profile() {
  const { user, isLoggedIn, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [myListings, setMyListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [profileForm, setProfileForm] = useState({ first_name: '', last_name: '', phone: '' });
  const [pwForm, setPwForm] = useState({ password: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) { navigate('/auth'); return; }
    if (user) {
      setProfileForm({ first_name: user.first_name || '', last_name: user.last_name || '', phone: user.phone || '' });
    }
    loadMyListings();
  }, [isLoggedIn, user]);

  const loadMyListings = async () => {
    setLoadingListings(true);
    try {
      const data = await API.listings.mine();
      setMyListings(data);
    } catch {
      setMyListings([]);
    } finally {
      setLoadingListings(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.user.updateProfile(profileForm);
      await refreshUser();
      toast('Profil yangilandi ✓', 'success');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.user.changePassword(pwForm.password);
      toast('Parol yangilandi ✓', 'success');
      setPwForm({ password: '' });
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("E'lonni o'chirmoqchimisiz?")) return;
    try {
      await API.listings.remove(id);
      toast("E'lon o'chirildi", 'success');
      loadMyListings();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const handleMarkSold = async (id) => {
    if (!confirm("E'lonni 'Sotildi' deb belgilash?")) return;
    try {
      await API.listings.update(id, { status: 'sold' });
      toast("E'lon 'Sotildi' deb belgilandi", 'success');
      loadMyListings();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : 'MM';

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
      {/* Profile Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1A1B2E, #13141F)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '20px',
        padding: '32px',
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.35)'
      }}>
        <div style={{
          width: '80px', height: '80px',
          background: 'linear-gradient(135deg, #6C63FF 0%, #8B85FF 100%)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '28px', fontWeight: 800, color: '#fff',
          boxShadow: '0 4px 20px rgba(108,99,255,0.4)',
          flexShrink: 0
        }}>
          {initials}
        </div>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#F0F0FF', marginBottom: '4px' }}>
            {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.email}
          </h1>
          <p style={{ fontSize: '13px', color: '#A0A0CC' }}>{user?.email}</p>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <span className="badge badge--primary">{myListings.length} ta e'lon</span>
          </div>
        </div>
        <button className="btn btn--danger" style={{ marginLeft: 'auto' }} onClick={() => { logout(); navigate('/'); }}>
          Chiqish
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Left: Profile forms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Profile edit */}
          <div style={{ background: '#1A1B2E', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '24px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#6B6B90', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '20px' }}>
              Profil ma'lumotlari
            </h2>
            <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label>Email</label>
                <input className="input" type="email" value={user?.email || ''} disabled style={{ opacity: 0.5 }} />
              </div>
              <div className="form-group">
                <label>Ism</label>
                <input className="input" value={profileForm.first_name} onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })} placeholder="Ism" />
              </div>
              <div className="form-group">
                <label>Familiya</label>
                <input className="input" value={profileForm.last_name} onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })} placeholder="Familiya" />
              </div>
              <div className="form-group">
                <label>Telefon</label>
                <input className="input" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder="+998..." />
              </div>
              <button type="submit" className="btn btn--primary btn--block" disabled={saving}>
                {saving ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </form>
          </div>

          {/* Password change */}
          <div style={{ background: '#1A1B2E', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '24px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#6B6B90', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '20px' }}>
              Parolni o'zgartirish
            </h2>
            <form onSubmit={handlePasswordSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label>Yangi parol</label>
                <input className="input" type="password" value={pwForm.password} onChange={(e) => setPwForm({ password: e.target.value })} required minLength={6} placeholder="Kamida 6 belgi" />
              </div>
              <button type="submit" className="btn btn--ghost btn--block" disabled={saving}>
                {saving ? '...' : 'Parolni yangilash'}
              </button>
            </form>
          </div>
        </div>

        {/* Right: My Listings */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#F0F0FF' }}>Mening e'lonlarim</h2>
            <Link to="/create" className="btn btn--primary btn--sm">+ E'lon qo'shish</Link>
          </div>
          <div className="listing-grid">
            {loadingListings
              ? Array.from({ length: 3 }).map((_, i) => <ListingCardSkeleton key={i} />)
              : myListings.length === 0
                ? (
                  <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                    <span className="empty-icon">📋</span>
                    <h3>Hali e'lon joylamagansiz</h3>
                    <Link to="/create" className="btn btn--primary">Birinchi e'lonni qo'shish</Link>
                  </div>
                )
                : myListings.map((listing) => (
                  <div key={listing.id} style={{ position: 'relative' }}>
                    <ListingCard listing={listing} />
                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                      <Link to={`/edit/${listing.id}`} className="btn btn--ghost btn--sm" style={{ flex: 1, justifyContent: 'center' }}>
                        ✏ Tahrir
                      </Link>
                      {listing.status !== 'sold' && (
                        <button className="btn btn--ghost btn--sm" onClick={() => handleMarkSold(listing.id)} style={{ flex: 1, color: '#22C55E', borderColor: '#22C55E' }}>
                          ✓ Sotildi
                        </button>
                      )}
                      <button className="btn btn--danger btn--sm" onClick={() => handleDelete(listing.id)} style={{ flex: 1 }}>
                        🗑
                      </button>
                    </div>
                  </div>
                ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}
