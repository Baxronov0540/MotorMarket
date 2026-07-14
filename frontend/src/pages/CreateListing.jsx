import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { toast } from '../components/Toast';
import s from './CreateListing.module.scss';

const DYN_FIELDS = {
  avto: [
    { name: 'brand', label: 'Marka', type: 'text' },
    { name: 'model', label: 'Model', type: 'text' },
    { name: 'year', label: 'Yili', type: 'number' },
    { name: 'mileage', label: 'Probeg (km)', type: 'number' },
    { name: 'color', label: 'Rangi', type: 'text' },
    { name: 'engine_volume', label: 'Dvigatel hajmi (l)', type: 'number' },
    { name: 'fuel_type', label: "Yoqilg'i turi", type: 'select', options: ['Benzin', 'Dizel', 'Gaz', 'Elektr', 'Gibrid'] },
    { name: 'transmission', label: 'Uzatma qutisi', type: 'select', options: ['Mexanika', 'Avtomat', 'Variator', 'Robot'] },
    { name: 'drive_type', label: 'Privod', type: 'select', options: ['Old', 'Orqa', 'To\'liq'] },
    { name: 'body_type', label: 'Kuzov turi', type: 'select', options: ['Sedan', 'Hatchback', 'Universал', 'Jeep', 'Minivan', 'Pikap'] },
  ],
  electro: [
    { name: 'brand', label: 'Marka', type: 'text' },
    { name: 'model', label: 'Model', type: 'text' },
    { name: 'year', label: 'Yili', type: 'number' },
    { name: 'mileage', label: 'Probeg (km)', type: 'number' },
    { name: 'color', label: 'Rangi', type: 'text' },
    { name: 'battery_capacity', label: "Batareya sig'imi (kWh)", type: 'number' },
    { name: 'power_reserve', label: 'Yurish zaxirasi (km)', type: 'number' },
    { name: 'motor_power', label: 'Motor quvvati (W)', type: 'number' },
    { name: 'body_type', label: 'Kuzov turi', type: 'select', options: ['Sedan', 'Hatchback', 'SUV'] },
  ],
  moto: [
    { name: 'brand', label: 'Marka', type: 'text' },
    { name: 'model', label: 'Model', type: 'text' },
    { name: 'year', label: 'Yili', type: 'number' },
    { name: 'mileage', label: 'Probeg (km)', type: 'number' },
    { name: 'engine_volume', label: 'Dvigatel hajmi (sm3)', type: 'number' },
  ],
  velo: [
    { name: 'model', label: 'Model', type: 'text' },
    { name: 'frame_size', label: "Rama o'lchami", type: 'text' },
    { name: 'wheel_size', label: "G'ildirak o'lchami (dyuym)", type: 'number' },
    { name: 'speed_count', label: 'Tezliklar soni', type: 'number' },
    { name: 'color', label: 'Rangi', type: 'text' },
  ],
};

function getCatGroup(catName = '') {
  const n = catName.toLowerCase();
  if (n.includes('elektr') || n.includes('electro')) return 'electro';
  if (n.includes('moto')) return 'moto';
  if (n.includes('velo') || n.includes('bayk')) return 'velo';
  return 'avto';
}

export default function CreateListing({ editMode = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const fileRef = useRef();

  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [dynGroup, setDynGroup] = useState(null);
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [initialData, setInitialData] = useState(null);
  const [form, setForm] = useState({
    subcategory_id: '', title: '', price: '', condition: 'new',
    status: 'active', location: '', description: '',
  });
  const [dynForm, setDynForm] = useState({});

  useEffect(() => {
    if (!isLoggedIn) { navigate('/auth?next=/create'); return; }
    API.categories.list().then(setCategories).catch(() => {});
    if (editMode && id) {
      API.listings.get(id).then((data) => {
        setInitialData(data);
        setForm({
          subcategory_id: data.subcategory_id || '',
          title: data.title || '',
          price: data.price || '',
          condition: data.condition || 'new',
          status: data.status || 'active',
          location: data.location || '',
          description: data.description || '',
        });
        const d = {};
        Object.keys(DYN_FIELDS).flatMap((g) => DYN_FIELDS[g]).forEach(({ name }) => {
          if (data[name] != null) d[name] = data[name];
        });
        setDynForm(d);
      }).catch(() => navigate('/'));
    }
  }, [isLoggedIn, editMode, id]);

  const handleCatChange = (catId) => {
    const cat = categories.find((c) => c.id === Number(catId));
    setSelectedCat(cat);
    setSubcategories(cat?.subcategories || []);
    setDynGroup(cat ? getCatGroup(cat.name) : null);
    setForm((f) => ({ ...f, subcategory_id: '' }));
  };

  const handleFile = (fileList) => {
    const arr = Array.from(fileList);
    setFiles((prev) => [...prev, ...arr]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const payload = {
      ...form,
      subcategory_id: Number(form.subcategory_id),
      price: Number(form.price),
      ...Object.fromEntries(
        Object.entries(dynForm).map(([k, v]) => [k, isNaN(Number(v)) ? v : Number(v) || v])
      ),
    };

    try {
      let listing;
      if (editMode && id) {
        listing = await API.listings.update(id, payload);
        toast("E'lon yangilandi ✓", 'success');
      } else {
        listing = await API.listings.create(payload);
        if (files.length > 0) {
          for (let i = 0; i < files.length; i++) {
            try {
              await API.listings.uploadMedia(files[i], { listingId: listing.id, sortOrder: i, isCover: i === 0 });
            } catch (err) {
              toast(`Rasm yuklanmadi: ${err.message}`, 'error');
            }
          }
        }
        toast("E'lon muvaffaqiyatli joylandi ✓", 'success');
      }
      navigate(`/listing/${listing.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const dynFields = dynGroup ? DYN_FIELDS[dynGroup] : [];

  return (
    <div className={s.page}>
      <div className={s.header}>
        <h1>{editMode ? "E'lonni tahrirlash" : "Yangi e'lon joylash"}</h1>
        <p>Barcha maydonlarni to'ldiring. Yulduzcha (*) bilan belgilangan maydonlar majburiy.</p>
      </div>

      <form className={s.form_card} onSubmit={handleSubmit}>
        {error && <div className={s.error_box}>{error}</div>}

        {/* Category */}
        <div>
          <div className={s.section_title}>Kategoriya</div>
          <div className={s.two_col}>
            <div className="form-group">
              <label>Kategoriya *</label>
              <select className="input" onChange={(e) => handleCatChange(e.target.value)} defaultValue="" required>
                <option value="" disabled>Tanlang...</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Subkategoriya *</label>
              <select
                className="input"
                value={form.subcategory_id}
                onChange={(e) => setForm({ ...form, subcategory_id: e.target.value })}
                required
                disabled={subcategories.length === 0}
              >
                <option value="" disabled>Tanlang...</option>
                {subcategories.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div>
          <div className={s.section_title}>Asosiy ma'lumotlar</div>
          <div className={s.two_col} style={{ marginBottom: '16px' }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>E'lon nomi *</label>
              <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="masalan: Chevrolet Cobalt 2023 yil" />
            </div>
            <div className="form-group">
              <label>Narx (so'm) *</label>
              <input className="input" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required placeholder="0" min="0" />
            </div>
            <div className="form-group">
              <label>Hudud *</label>
              <input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required placeholder="Toshkent" />
            </div>
            <div className="form-group">
              <label>Holati *</label>
              <select className="input" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>
                <option value="new">Yangi</option>
                <option value="used">Ishlatilgan</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">Faol</option>
                <option value="inactive">Nofaol</option>
                <option value="sold">Sotilgan</option>
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Tavsif</label>
              <textarea className="input" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Transport haqida batafsil ma'lumot yozing..." />
            </div>
          </div>
        </div>

        {/* Dynamic fields */}
        {dynFields.length > 0 && (
          <div>
            <div className={s.section_title}>Texnik ma'lumotlar</div>
            <div className={s.two_col}>
              {dynFields.map((f) => (
                <div key={f.name} className="form-group">
                  <label>{f.label}</label>
                  {f.type === 'select' ? (
                    <select className="input" value={dynForm[f.name] || ''} onChange={(e) => setDynForm({ ...dynForm, [f.name]: e.target.value })}>
                      <option value="">Tanlang</option>
                      {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input
                      className="input"
                      type={f.type}
                      value={dynForm[f.name] || ''}
                      onChange={(e) => setDynForm({ ...dynForm, [f.name]: e.target.value })}
                      placeholder={f.label}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Media Upload */}
        {!editMode && (
          <div>
            <div className={s.section_title}>Rasmlar</div>
            <div
              className={`${s.media_zone} ${dragging ? s.dragging : ''}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files); }}
            >
              <input ref={fileRef} type="file" multiple accept="image/*" onChange={(e) => handleFile(e.target.files)} />
              <div className={s.upload_icon}>🖼</div>
              <div className={s.upload_text}>Rasm yuklash uchun bosing yoki sudrang</div>
              <div className={s.upload_hint}>JPG, PNG • Birinchi rasm muqova bo'ladi</div>
            </div>

            {files.length > 0 && (
              <div className={s.thumb_strip}>
                {files.map((f, i) => (
                  <div key={i} className={s.thumb}>
                    <img src={URL.createObjectURL(f)} alt="" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className={s.actions}>
          <button type="button" className="btn btn--ghost" onClick={() => navigate(-1)}>Bekor qilish</button>
          <button type="submit" className="btn btn--primary btn--lg" disabled={loading}>
            {loading ? 'Saqlanmoqda...' : editMode ? "Saqlash" : "E'lonni joylash"}
          </button>
        </div>
      </form>
    </div>
  );
}
