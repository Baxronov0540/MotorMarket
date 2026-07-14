import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { API, mediaUrl } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { toast } from '../components/Toast';
import { formatPrice } from '../components/ListingCard';
import s from './ListingDetail.module.scss';

const SPEC_FIELDS = [
  ['brand', 'Marka'], ['model', 'Model'], ['year', 'Yili'],
  ['mileage', 'Probeg (km)'], ['color', 'Rangi'],
  ['engine_volume', 'Dvigatel hajmi (l)'], ['fuel_type', "Yoqilg'i turi"],
  ['transmission', 'Uzatma qutisi'], ['drive_type', 'Privod'],
  ['body_type', 'Kuzov turi'], ['battery_capacity', "Batareya sig'imi"],
  ['power_reserve', 'Yurish zaxirasi (km)'], ['motor_power', 'Motor quvvati (W)'],
  ['frame_size', "Rama o'lchami"], ['wheel_size', "G'ildirak o'lchami"],
  ['speed_count', 'Tezliklar soni'],
];

const STATUS_LABELS = { active: 'Faol', sold: 'Sotilgan', inactive: 'Nofaol' };
const CONDITION_LABELS = { new: 'Yangi', used: 'Ishlatilgan' };

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [chatLoading, setChatLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    API.listings.get(id)
      .then((data) => { setListing(data); setActiveImg(0); })
      .catch(() => setListing(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChat = async () => {
    if (!isLoggedIn) { navigate(`/auth?next=/listing/${id}`); return; }
    setChatLoading(true);
    try {
      const conv = await API.chat.create({ listing_id: Number(id), seller_id: listing.user_id });
      navigate(`/chat?id=${conv.id}`);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setChatLoading(false);
    }
  };

  const handleSave = async () => {
    if (!isLoggedIn) { navigate(`/auth?next=/listing/${id}`); return; }
    setSaveLoading(true);
    try {
      await API.saved.create(Number(id));
      toast("E'lon saqlanganlar ro'yxatiga qo'shildi ✓", 'success');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner" />
        <span>Yuklanmoqda...</span>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="empty-state" style={{ minHeight: '60vh' }}>
        <span className="empty-icon">😕</span>
        <h3>E'lon topilmadi</h3>
        <Link to="/" className="btn btn--primary">Asosiy sahifaga qaytish</Link>
      </div>
    );
  }

  const media = listing.media || [];
  const activeImgSrc = media[activeImg] ? mediaUrl(media[activeImg].url) : null;
  const specs = SPEC_FIELDS.filter(([key]) => listing[key] != null && listing[key] !== '');
  const isOwner = user?.id === listing.user_id;

  return (
    <div className={s.page}>
      <div className={s.back_btn}>
        <button className="btn btn--ghost" onClick={() => navigate(-1)}>← Ortga</button>
      </div>

      <div className={s.detail_grid}>
        {/* Left: Gallery + Description */}
        <div>
          <div className={s.gallery}>
            <div className={s.main}>
              {activeImgSrc
                ? <img src={activeImgSrc} alt={listing.title} />
                : <div className={s.no_photo}><span>🚗</span><p>Rasm yo'q</p></div>
              }
            </div>
            {media.length > 1 && (
              <div className={s.thumbs}>
                {media.map((m, i) => (
                  <img
                    key={m.id}
                    src={mediaUrl(m.url)}
                    alt=""
                    className={i === activeImg ? s.active : ''}
                    onClick={() => setActiveImg(i)}
                  />
                ))}
              </div>
            )}
          </div>

          {listing.description && (
            <div className={s.description}>
              <h3>Tavsif</h3>
              <p>{listing.description}</p>
            </div>
          )}
        </div>

        {/* Right: Panel */}
        <div className={s.panel}>
          <div className={s.price_card}>
            <div className={s.price}>{formatPrice(listing.price)}</div>
            <h1>{listing.title || "Nomsiz e'lon"}</h1>
            <div className={s.subtitle}>
              <span className={`badge badge--${listing.condition === 'new' ? 'success' : 'dim'}`}>
                {CONDITION_LABELS[listing.condition] || listing.condition}
              </span>
              <span className={`badge badge--${listing.status === 'active' ? 'primary' : 'danger'}`}>
                {STATUS_LABELS[listing.status] || listing.status}
              </span>
              {listing.location && <span>📍 {listing.location}</span>}
            </div>

            <div className={s.actions}>
              {!isOwner && (
                <button className="btn btn--primary btn--block btn--lg" onClick={handleChat} disabled={chatLoading}>
                  {chatLoading ? 'Kuting...' : '✉ Sotuvchiga yozish'}
                </button>
              )}
              <button className="btn btn--ghost btn--block" onClick={handleSave} disabled={saveLoading}>
                {saveLoading ? '...' : '☆ Saqlash'}
              </button>
              {isOwner && (
                <Link to={`/edit/${listing.id}`} className="btn btn--ghost btn--block" style={{ textAlign: 'center' }}>
                  ✏ Tahrirlash
                </Link>
              )}
            </div>
          </div>

          {specs.length > 0 && (
            <div className={s.specs_card}>
              <h3>Texnik ma'lumotlar</h3>
              <div className={s.spec_list}>
                {specs.map(([key, label]) => (
                  <div key={key} className={s.spec_item}>
                    <span className={s.key}>{label}</span>
                    <span className={s.val}>{String(listing[key])}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
