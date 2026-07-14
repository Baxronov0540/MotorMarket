import { Link } from 'react-router-dom';
import { mediaUrl } from '../api/client';
import s from './ListingCard.module.scss';

export function formatPrice(value) {
  if (value == null) return '—';
  return new Intl.NumberFormat('uz-UZ').format(value) + " so'm";
}

const STATUS_LABELS = { active: 'Faol', sold: 'Sotilgan', inactive: 'Nofaol' };
const CONDITION_LABELS = { new: 'Yangi', used: 'Ishlatilgan' };

export default function ListingCard({ listing }) {
  const cover = listing.media?.find((m) => m.is_cover) || listing.media?.[0];
  const imgSrc = cover ? mediaUrl(cover.url) : null;
  const statusLabel = STATUS_LABELS[listing.status] || listing.status;
  const condLabel = CONDITION_LABELS[listing.condition] || listing.condition;

  return (
    <Link to={`/listing/${listing.id}`} className={s.card}>
      <div className={s.media}>
        {imgSrc ? (
          <img src={imgSrc} alt={listing.title} loading="lazy" />
        ) : (
          <div className={s.no_photo}>
            <span>🚗</span>
            <p>Rasm yo'q</p>
          </div>
        )}
        <div className={s.price_badge}>{formatPrice(listing.price)}</div>
        <div className={`${s.status_badge} ${s[listing.status]}`}>{statusLabel}</div>
      </div>

      <div className={s.body}>
        <h3>{listing.title || "Nomsiz e'lon"}</h3>
        <div className={s.meta}>
          {condLabel && <span className={s.tag}>{condLabel}</span>}
          {listing.brand && <span className={s.tag}>{listing.brand}</span>}
          {listing.year && <span className={s.tag}>{listing.year}</span>}
        </div>
        <div className={s.location}>{listing.location || "Hudud ko'rsatilmagan"}</div>
      </div>
    </Link>
  );
}

export function ListingCardSkeleton() {
  return (
    <div className={s.skeleton}>
      <div className={s.sk_media} />
      <div className={s.sk_body}>
        <div className={`${s.sk_line} ${s.long}`} />
        <div className={`${s.sk_line} ${s.medium}`} />
        <div className={`${s.sk_line} ${s.short}`} />
      </div>
    </div>
  );
}
