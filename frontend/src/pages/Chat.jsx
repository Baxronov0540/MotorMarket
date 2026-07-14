import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { API } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { toast } from '../components/Toast';
import s from './Chat.module.scss';

export default function Chat() {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initId = searchParams.get('id') ? Number(searchParams.get('id')) : null;

  const [convs, setConvs] = useState([]);
  const [activeId, setActiveId] = useState(initId);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgText, setMsgText] = useState('');
  const [sendLoading, setSendLoading] = useState(false);
  const msgsRef = useRef();
  const pollRef = useRef();

  useEffect(() => {
    if (!isLoggedIn) { navigate('/auth?next=/chat'); return; }
    loadConvs();
    const t = setInterval(loadConvs, 5000);
    return () => clearInterval(t);
  }, [isLoggedIn]);

  useEffect(() => {
    if (activeId) {
      loadMessages(activeId);
      clearInterval(pollRef.current);
      pollRef.current = setInterval(() => loadMessages(activeId, true), 3000);
    }
    return () => clearInterval(pollRef.current);
  }, [activeId]);

  const loadConvs = async () => {
    try {
      const data = await API.chat.list();
      setConvs(data);
    } catch {}
  };

  const loadMessages = useCallback(async (id, silent = false) => {
    if (!id) return;
    try {
      const data = await API.chat.getDetails(id);
      setActiveConv(data);
      setMessages(data.messages || []);
      if (!silent) {
        setTimeout(() => {
          if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
        }, 50);
      } else {
        const el = msgsRef.current;
        const near = el && (el.scrollHeight - el.clientHeight <= el.scrollTop + 80);
        if (near && el) el.scrollTop = el.scrollHeight;
      }
    } catch (err) {
      if (!silent) toast(err.message, 'error');
    }
  }, []);

  const openChat = (id) => {
    setActiveId(id);
    navigate(`/chat?id=${id}`, { replace: true });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const txt = msgText.trim();
    if (!txt || !activeId) return;
    setSendLoading(true);
    try {
      await API.chat.sendMessage(activeId, { body: txt, type: 'text' });
      setMsgText('');
      await loadMessages(activeId);
      loadConvs();
    } catch (err) {
      toast('Xato: ' + err.message, 'error');
    } finally {
      setSendLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const convName = (c) => {
    if (!user) return `Suhbat #${c.id}`;
    return c.seller_id === user.id ? `Xaridor #${c.buyer_id}` : `Sotuvchi #${c.seller_id}`;
  };

  return (
    <div className={s.page}>
      {/* Sidebar */}
      <aside className={s.sidebar}>
        <div className={s.sidebar_header}>
          <h2>💬 Xabarlar</h2>
          <p>{convs.length} ta suhbat</p>
        </div>
        <div className={s.conv_list}>
          {convs.length === 0 ? (
            <div style={{ padding: '24px', color: '#6B6B90', textAlign: 'center', fontSize: '13px' }}>
              Hozircha suhbatlar yo'q
            </div>
          ) : convs.map((c) => (
            <div
              key={c.id}
              className={`${s.conv_item} ${activeId === c.id ? s.active : ''}`}
              onClick={() => openChat(c.id)}
            >
              <div className={s.conv_name}>{convName(c)}</div>
              <div className={s.conv_meta}>
                E'lon #{c.listing_id} · {c.last_message_at ? new Date(c.last_message_at).toLocaleDateString('uz-UZ') : '—'}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main */}
      <div className={s.main}>
        {!activeId ? (
          <div className={s.empty_chat}>
            <div className={s.icon}>💬</div>
            <h3>Suhbat tanlang</h3>
            <p>Chap tarafdagi ro'yxatdan suhbatni oching yoki e'lon sahifasidan sotuvchiga murojaat qiling.</p>
          </div>
        ) : (
          <>
            <div className={s.chat_header}>
              <button className={`btn btn--ghost btn--sm ${s.back_btn}`} onClick={() => { setActiveId(null); navigate('/chat', { replace: true }); }}>
                ← Ortga
              </button>
              <div className={s.title_block}>
                <h3>{activeConv ? convName(activeConv) : 'Yuklanmoqda...'}</h3>
                {activeConv?.listing_id && (
                  <Link to={`/listing/${activeConv.listing_id}`}>
                    E'lonni ko'rish (#{activeConv.listing_id})
                  </Link>
                )}
              </div>
            </div>

            <div className={s.messages_wrap} ref={msgsRef}>
              {messages.length === 0 ? (
                <div style={{ margin: 'auto', color: '#6B6B90', textAlign: 'center' }}>
                  Hozircha xabar yo'q. Birinchi bo'lib yozing!
                </div>
              ) : messages.map((m) => {
                const isMe = m.sender_id === user?.id;
                const time = new Date(m.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return (
                  <div key={m.id} className={`${s.message} ${isMe ? s.mine : s.other}`}>
                    <div className={s.bubble}>{m.body}</div>
                    <div className={s.time}>{time} {isMe && (m.is_read ? '✓✓' : '✓')}</div>
                  </div>
                );
              })}
            </div>

            <form className={s.chat_input_area} onSubmit={handleSend}>
              <textarea
                className="input"
                value={msgText}
                onChange={(e) => setMsgText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Xabar yozing... (Enter = yuborish)"
                rows={1}
              />
              <button type="submit" className="btn btn--primary" disabled={sendLoading || !msgText.trim()}>
                {sendLoading ? '...' : '→'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
