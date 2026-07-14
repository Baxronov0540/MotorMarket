import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API } from '../api/client';
import { useAuth } from '../context/AuthContext';
import ListingCard, { ListingCardSkeleton } from '../components/ListingCard';

export default function Saved() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) { navigate('/auth?next=/saved'); return; }
    loadSaved();
  }, [isLoggedIn]);

  const loadSaved = async () => {
    setLoading(true);
    try {
      const saved = await API.saved.list();
      if (!saved.length) { setListings([]); setLoading(false); return; }
      const results = await Promise.all(saved.map((s) => API.listings.get(s.listing_id).catch(() => null)));
      setListings(results.filter(Boolean));
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container section">
      <div className="section-head">
        <h2>☆ Saqlanganlar</h2>
        {!loading && <span className="badge badge--dim">{listings.length} ta e'lon</span>}
      </div>

      <div className="listing-grid">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <ListingCardSkeleton key={i} />)
          : listings.length === 0
            ? (
              <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                <span className="empty-icon">⭐</span>
                <h3>Saqlangan e'lonlar yo'q</h3>
                <p>Yoqqan e'lonni ochib, "Saqlash" tugmasini bosing.</p>
                <Link to="/" className="btn btn--primary">E'lonlarni ko'rish</Link>
              </div>
            )
            : listings.map((l) => <ListingCard key={l.id} listing={l} />)
        }
      </div>
    </div>
  );
}
