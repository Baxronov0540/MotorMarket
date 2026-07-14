import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../api/client';
import ListingCard, { ListingCardSkeleton } from '../components/ListingCard';
import s from './Home.module.scss';

export default function Home() {
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});
  const [activeCat, setActiveCat] = useState(null);

  const loadListings = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const data = await API.listings.filter({ ...params, page, size: 12 });
      setListings(data);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    API.categories.list().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    loadListings(filters);
  }, [page, filters]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const f = Object.fromEntries(fd.entries());
    setFilters(f);
    setPage(1);
  };

  const handleCatClick = (catId) => {
    if (activeCat === catId) {
      setActiveCat(null);
      setFilters({});
    } else {
      setActiveCat(catId);
      setFilters({});
    }
    setPage(1);
  };

  return (
    <div className={s.page}>
      {/* Hero */}
      <section className={s.hero}>
        <div className={s.inner}>
          <div className={s.eyebrow}>🇺🇿 UZ · TRANSPORT MARKET</div>
          <h1>Mototsikl, avtomobil va<br />velosiped — <em>bitta bozorda</em>.</h1>
          <p>
            MotorMarket — faqat transport vositalari uchun maxsus e'lonlar bozori.
            Narxini, holatini va texnik xususiyatlarini solishtiring, sotuvchi bilan bevosita bog'laning.
          </p>
          <div className={s.hero_actions}>
            <Link to="/create" className="btn btn--primary btn--lg">+ E'lon joylash</Link>
            <Link to="#listings" className="btn btn--ghost btn--lg">Barchasini ko'rish</Link>
          </div>

          <div className={s.stats}>
            <div className={s.stat}>
              <span className={s.num}>{listings.length}+</span>
              <span className={s.label}>Faol e'lonlar</span>
            </div>
            <div className={s.stat}>
              <span className={s.num}>{categories.length}</span>
              <span className={s.label}>Kategoriyalar</span>
            </div>
            <div className={s.stat}>
              <span className={s.num}>100%</span>
              <span className={s.label}>Bepul joylash</span>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Filters */}
      <div className={s.filters_section}>
        <form className={s.filter_form} onSubmit={handleFilterSubmit}>
          <div className="form-group">
            <label htmlFor="q">Qidiruv</label>
            <input className="input" id="q" name="q" placeholder="masalan: Cobalt..." defaultValue={filters.q || ''} />
          </div>
          <div className="form-group">
            <label htmlFor="min_price">Narx, dan</label>
            <input className="input" type="number" id="min_price" name="min_price" placeholder="0" min="0" />
          </div>
          <div className="form-group">
            <label htmlFor="max_price">Narx, gacha</label>
            <input className="input" type="number" id="max_price" name="max_price" placeholder="100 000 000" min="0" />
          </div>
          <div className="form-group">
            <label htmlFor="location">Hudud</label>
            <input className="input" id="location" name="location" placeholder="Toshkent" />
          </div>
          <div className="form-group">
            <label htmlFor="condition">Holati</label>
            <select className="input" id="condition" name="condition">
              <option value="">Barchasi</option>
              <option value="new">Yangi</option>
              <option value="used">Ishlatilgan</option>
            </select>
          </div>
          <button type="submit" className="btn btn--primary">Filtrlash</button>
        </form>
      </div>

      {/* Category Strip */}
      {categories.length > 0 && (
        <div className={s.category_strip}>
          <button
            className={`${s.cat_chip} ${!activeCat ? s.active : ''}`}
            onClick={() => handleCatClick(null)}
          >
            Barchasi
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`${s.cat_chip} ${activeCat === cat.id ? s.active : ''}`}
              onClick={() => handleCatClick(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Listings */}
      <div className={s.listings_section} id="listings">
        <div className={s.section_header}>
          <h2>E'lonlar</h2>
          {!loading && <span className={s.count}>{listings.length} ta · {page}-bet</span>}
        </div>

        <div className="listing-grid">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <ListingCardSkeleton key={i} />)
            : listings.length > 0
              ? listings.map((l) => <ListingCard key={l.id} listing={l} />)
              : (
                <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                  <span className="empty-icon">🔍</span>
                  <h3>Hech narsa topilmadi</h3>
                  <p>Filtrlarni o'zgartirib ko'ring yoki barcha e'lonlarni ko'ring.</p>
                </div>
              )
          }
        </div>

        {/* Pagination */}
        <div className={s.pagination}>
          <button className="btn btn--ghost" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            ← Oldingi
          </button>
          <span className={s.page_info}>{page}-bet</span>
          <button className="btn btn--ghost" onClick={() => setPage((p) => p + 1)} disabled={listings.length < 12}>
            Keyingi →
          </button>
        </div>
      </div>
    </div>
  );
}
