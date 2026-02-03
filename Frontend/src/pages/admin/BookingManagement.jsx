import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search, CheckCircle2, XCircle, Clock, Eye, X,
  Users, Calendar, AlignLeft, ChevronDown, Filter
} from 'lucide-react';

// ─── CONSTANTS (static, không cần fetch từ API) ─────────────────────
const REJECT_REASONS = [
  'Phòng đã được đặt trong giờ giấy trường',
  'Số lượng người vượt quá công suất phòng',
  'Thiếu thông tin cần thiết cho đặt phòng',
  'Không thuộc thời gian cho phép đặt phòng',
  'Phòng đang bảo dưỡng trong thời gian đã đặt',
  'Mục đích sử dụng không phù hợp với quy định',
  'Đặt phòng bị trùng lịch với sự kiện đã lên kế hoạch',
  'Lý do khác'
];

const API_BASE_URL = 'http://localhost:5270/api';

// ─── STYLES ──────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500;600&display=swap');
.bk-wrap * { font-family:'DM Sans',sans-serif; box-sizing:border-box; margin:0; padding:0; }
.bk-wrap { min-height:100vh; background:#f0f4f8; padding:28px; }

/* header */
.rm-header { background: #1e293b; border-radius: 16px; padding: 28px 32px; margin-bottom: 24px; position: relative; overflow: hidden; }
.rm-header::before { content: ''; position: absolute; top: -40px; right: -40px; width: 180px; height: 180px; background: rgba(99,102,241,0.12); border-radius: 50%; }
.rm-header::after { content: ''; position: absolute; bottom: -30px; left: 30%; width: 120px; height: 120px; background: rgba(16,185,129,0.08); border-radius: 50%; }
.rm-header h1 { color: #f1f5f9; font-size: 22px; font-weight: 700; margin: 0 0 4px; position: relative; z-index: 1; }
.rm-header p { color: #94a3b8; font-size: 14px; margin: 0; position: relative; z-index: 1; }

/* stats */
.bk-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:20px; }
.bk-sc { background:#fff; border-radius:12px; padding:17px 18px; border:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center; }
.bk-sc .sv { font-size:24px; font-weight:700; line-height:1; } .bk-sc .sl { font-size:12px; color:#64748b; margin-top:3px; font-weight:500; }
.bk-sc .si { width:38px; height:38px; border-radius:10px; display:flex; align-items:center; justify-content:center; }
.bk-blue .sv{color:#3b82f6;} .bk-blue .si{background:#eff6ff;color:#3b82f6;}
.bk-amber .sv{color:#f59e0b;} .bk-amber .si{background:#fffbeb;color:#f59e0b;}
.bk-green .sv{color:#10b981;} .bk-green .si{background:#ecfdf5;color:#10b981;}
.bk-red .sv{color:#ef4444;} .bk-red .si{background:#fef2f2;color:#ef4444;}

/* toolbar */
.bk-toolbar { display:flex; gap:10px; align-items:center; margin-bottom:16px; flex-wrap:wrap; }
.bk-search { position:relative; flex:1; min-width:220px; max-width:380px; }
.bk-search input { width:100%; padding:10px 14px 10px 40px; border-radius:10px; border:1.5px solid #e2e8f0; font-size:13.5px; outline:none; background:#fff; transition:.2s; }
.bk-search input:focus { border-color:#6366f1; box-shadow:0 0 0 3px rgba(99,102,241,.12); }
.bk-search .bk-si { position:absolute; left:13px; top:50%; transform:translateY(-50%); color:#94a3b8; pointer-events:none; }

/* status tabs */
.bk-tabs { display:flex; gap:5px; flex-wrap:wrap; }
.bk-tab { padding:7px 14px; border-radius:20px; border:1.5px solid #e2e8f0; background:#fff; font-size:12.5px; font-weight:600; color:#64748b; cursor:pointer; transition:.2s; display:flex; align-items:center; gap:5px; }
.bk-tab:hover { border-color:#c7d2fe; }
.bk-tab.act { background:#6366f1; color:#fff; border-color:#6366f1; }
.bk-tab .tbadge { background:rgba(255,255,255,.25); border-radius:10px; padding:1px 7px; font-size:11px; font-weight:700; }
.bk-tab:not(.act) .tbadge { background:#f1f5f9; color:#475569; }

/* table */
.bk-tw { background:#fff; border-radius:14px; border:1px solid #e2e8f0; overflow:hidden; }
.bk-tbl { width:100%; border-collapse:collapse; }
.bk-tbl thead { background:#f8fafc; }
.bk-tbl th { padding:11px 15px; text-align:left; font-size:11.5px; font-weight:600; color:#64748b; text-transform:uppercase; letter-spacing:.05em; border-bottom:1px solid #e2e8f0; white-space:nowrap; }
.bk-tbl td { padding:13px 15px; border-bottom:1px solid #f1f5f9; font-size:13.5px; color:#334155; vertical-align:middle; }
.bk-tbl tr:last-child td { border-bottom:none; }
.bk-tbl tr:hover td { background:#fafbfd; }
.bk-tbl tr.row-pending { border-left:3px solid #f59e0b; }
.bk-tbl tr.row-approved { border-left:3px solid #10b981; }
.bk-tbl tr.row-rejected { border-left:3px solid #ef4444; }

.bk-code { font-family:'JetBrains Mono',monospace; font-size:12px; color:#6366f1; font-weight:600; background:#eef2ff; padding:3px 8px; border-radius:5px; display:inline-block; }
.bk-name { font-weight:600; color:#1e293b; }
.bk-sub { font-size:11.5px; color:#94a3b8; margin-top:1px; }
.bk-time { display:flex; align-items:center; gap:4px; }
.bk-time svg { color:#6366f1; }
.bk-people { display:flex; align-items:center; gap:5px; font-weight:600; color:#1e293b; }

/* status badge */
.bk-sbadge { display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:6px; font-size:12px; font-weight:600; white-space:nowrap; }
.bk-sb-pend { background:#fffbeb; color:#d97706; }
.bk-sb-appr { background:#ecfdf5; color:#059669; }
.bk-sb-rej  { background:#fef2f2; color:#dc2626; }

/* action buttons */
.bk-acts { display:flex; gap:6px; justify-content:center; }
.bk-abtn { width:32px; height:32px; border-radius:7px; border:1.5px solid #e2e8f0; background:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:.2s; }
.bk-abtn:hover { transform:translateY(-1px); box-shadow:0 3px 8px rgba(0,0,0,.1); }
.bk-abtn.view { color:#6366f1; } .bk-abtn.view:hover { border-color:#6366f1; background:#f5f3ff; }
.bk-abtn.approve { color:#10b981; } .bk-abtn.approve:hover { border-color:#10b981; background:#ecfdf5; }
.bk-abtn.reject { color:#ef4444; } .bk-abtn.reject:hover { border-color:#ef4444; background:#fef2f2; }
.bk-abtn:disabled { opacity:.3; cursor:not-allowed; transform:none; box-shadow:none; }

/* loading spinner */
.bk-spinner { display:inline-block; width:22px; height:22px; border:3px solid #f3f3f3; border-top:3px solid #6366f1; border-radius:50%; animation:bkSpin 0.8s linear infinite; }
@keyframes bkSpin { to { transform:rotate(360deg); } }

/* error banner */
.bk-error { background:#fef2f2; border:1px solid #fecaca; border-radius:10px; padding:12px 16px; margin-bottom:16px; color:#dc2626; font-size:13.5px; display:flex; align-items:center; justify-content:space-between; }
.bk-error button { background:none; border:none; color:#dc2626; cursor:pointer; font-size:18px; line-height:1; }

/* empty */
.bk-empty { padding:56px 20px; text-align:center; color:#94a3b8; }
.bk-empty svg { opacity:.4; margin-bottom:10px; display:block; margin-left:auto; margin-right:auto; }

/* ─── modals ─── */
.bk-ov { position:fixed; inset:0; background:rgba(15,23,42,.45); display:flex; align-items:center; justify-content:center; z-index:1000; backdrop-filter:blur(3px); animation:bkFi .2s; }
@keyframes bkFi { from{opacity:0;} to{opacity:1;} }
.bk-modal { background:#fff; border-radius:18px; width:90%; max-width:520px; max-height:88vh; overflow-y:auto; animation:bkSu .28s cubic-bezier(.34,1.56,.64,1); box-shadow:0 24px 48px rgba(0,0,0,.15); }
@keyframes bkSu { from{transform:translateY(40px);opacity:0;} to{transform:translateY(0);opacity:1;} }
.bk-mh { padding:18px 22px 15px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #f1f5f9; }
.bk-mh h3 { font-size:16px; color:#1e293b; font-weight:700; margin:0; display:flex; align-items:center; gap:7px; flex-wrap:wrap; }
.bk-mh .mh-code { font-family:'JetBrains Mono',monospace; font-size:11.5px; color:#6366f1; background:#eef2ff; padding:2px 8px; border-radius:5px; font-weight:600; }
.bk-mb { padding:20px 22px 22px; }

/* detail grid */
.bk-dg { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:18px; }
.bk-di { background:#f8fafc; border:1px solid #f1f5f9; border-radius:10px; padding:11px 14px; }
.bk-di .di-label { font-size:10.5px; text-transform:uppercase; letter-spacing:.04em; color:#94a3b8; font-weight:600; margin-bottom:4px; display:flex; align-items:center; gap:4px; }
.bk-di .di-val { font-size:13.5px; color:#1e293b; font-weight:600; line-height:1.4; }
.bk-di.full { grid-column:1/-1; }
.bk-di .di-purpose { color:#6366f1; }

/* reject form */
.bk-rej-title { font-size:13px; font-weight:700; color:#dc2626; margin-bottom:10px; display:flex; align-items:center; gap:6px; }
.bk-rej-title svg { color:#dc2626; }
.bk-rej-label { font-size:12px; font-weight:600; color:#374151; margin-bottom:6px; display:block; }
.bk-rej-sel { width:100%; padding:10px 36px 10px 13px; border:1.5px solid #e2e8f0; border-radius:9px; font-size:13.5px; outline:none; appearance:none; background:#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E") no-repeat right 13px center; cursor:pointer; color:#1e293b; font-family:inherit; margin-bottom:12px; transition:.2s; }
.bk-rej-sel:focus { border-color:#ef4444; box-shadow:0 0 0 3px rgba(239,68,68,.12); }
.bk-rej-ta { width:100%; padding:10px 13px; border:1.5px solid #e2e8f0; border-radius:9px; font-size:13.5px; outline:none; resize:vertical; min-height:72px; color:#1e293b; font-family:inherit; transition:.2s; }
.bk-rej-ta:focus { border-color:#ef4444; box-shadow:0 0 0 3px rgba(239,68,68,.12); }

/* rejected reason box in detail */
.bk-rej-box { background:#fef2f2; border:1px solid #fecaca; border-radius:9px; padding:12px 14px; margin-top:2px; }
.bk-rej-box .rb-title { font-size:11px; text-transform:uppercase; letter-spacing:.04em; color:#dc2626; font-weight:700; margin-bottom:4px; display:flex; align-items:center; gap:4px; }
.bk-rej-box .rb-text { font-size:13px; color:#991b1b; font-weight:500; line-height:1.45; }

/* modal actions */
.bk-fac { display:flex; gap:10px; margin-top:20px; }
.bk-bcn { flex:1; padding:10px; border:1.5px solid #e2e8f0; background:#fff; border-radius:9px; font-size:13.5px; font-weight:600; color:#475569; cursor:pointer; font-family:inherit; transition:.2s; }
.bk-bcn:hover { background:#f1f5f9; }
.bk-bsb { flex:1; padding:10px; background:#1e293b; color:#fff; border:none; border-radius:9px; font-size:13.5px; font-weight:600; cursor:pointer; font-family:inherit; transition:.2s; display:flex; align-items:center; justify-content:center; gap:6px; }
.bk-bsb:hover { background:#334155; }
.bk-bsb.btn-approve { background:#10b981; } .bk-bsb.btn-approve:hover { background:#059669; }
.bk-bsb.btn-reject { background:#ef4444; } .bk-bsb.btn-reject:hover { background:#dc2626; }
.bk-bsb:disabled { opacity:.4; cursor:not-allowed; }

/* confirm mini-modal */
.bk-confirm { max-width:400px; }
.bk-confirm-icon { width:52px; height:52px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 14px; }
.bk-confirm-icon.ci-approve { background:#ecfdf5; color:#10b981; }
.bk-confirm h4 { text-align:center; font-size:16px; color:#1e293b; margin-bottom:6px; }
.bk-confirm p { text-align:center; font-size:13px; color:#64748b; line-height:1.5; }

/* ─── isUsed section ─── */
.bk-used-box { margin-top:16px; padding:14px 16px; border-radius:10px; border:1.5px solid #e2e8f0; background:#f8fafc; }
.bk-used-box .ub-title { font-size:11px; text-transform:uppercase; letter-spacing:.05em; color:#64748b; font-weight:700; margin-bottom:10px; display:flex; align-items:center; gap:5px; }
.bk-used-badge { display:inline-flex; align-items:center; gap:6px; background:#ecfdf5; border:1px solid #a7f3d0; border-radius:8px; padding:8px 14px; }
.bk-used-badge svg { color:#10b981; }
.bk-used-badge span { font-size:13.5px; font-weight:600; color:#059669; }
.bk-used-btns { display:flex; gap:10px; }
.bk-used-btn { flex:1; padding:9px 12px; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; font-family:inherit; border:1.5px solid; transition:.2s; display:flex; align-items:center; justify-content:center; gap:6px; }
.bk-used-btn:hover { transform:translateY(-1px); box-shadow:0 4px 10px rgba(0,0,0,.1); }
.bk-used-btn.confirm { background:#10b981; color:#fff; border-color:#10b981; }
.bk-used-btn.confirm:hover { background:#059669; border-color:#059669; }
.bk-used-btn.cancel { background:#fff; color:#64748b; border-color:#e2e8f0; }
.bk-used-btn.cancel:hover { background:#f1f5f9; border-color:#cbd5e1; }

/* responsive */@media(max-width:900px){ .bk-stats{grid-template-columns:repeat(2,1fr);} }
@media(max-width:600px){ .bk-stats{grid-template-columns:1fr 1fr;} .bk-toolbar{flex-direction:column;align-items:stretch;} .bk-search{max-width:100%;} .bk-dg{grid-template-columns:1fr;} }
`;

// ─── HELPERS ─────────────────────────────────────────────────────────
const StatusIcon = ({ status, sz = 13 }) => {
  if (status === 'approved') return <CheckCircle2 size={sz} />;
  if (status === 'rejected') return <XCircle size={sz} />;
  return <Clock size={sz} />;
};
const statusLabel = s => ({ pending:'Chờ duyệt', approved:'Đã duyệt', rejected:'Từ chối' }[s]);
const statusCls   = s => ({ pending:'bk-sb-pend', approved:'bk-sb-appr', rejected:'bk-sb-rej' }[s]);
const rowCls      = s => ({ pending:'row-pending', approved:'row-approved', rejected:'row-rejected' }[s]);

// ─── COMPONENT ───────────────────────────────────────────────────────
export default function BookingManagement() {
  // ── state ─────────────────────────────────────────────────────────
  const [bookings, setBookings]             = useState([]);
  const [statistics, setStatistics]         = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [search, setSearch]                 = useState('');
  const [filterStatus, setFilterStatus]     = useState('all');
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState(null);

  // modals
  const [viewItem,    setViewItem]          = useState(null);
  const [rejectItem,  setRejectItem]        = useState(null);
  const [confirmItem, setConfirmItem]       = useState(null);

  // reject form
  const [rejReason,   setRejReason]         = useState(REJECT_REASONS[0]);
  const [rejNote,     setRejNote]           = useState('');

  // ── API helpers ───────────────────────────────────────────────────
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res    = await fetch(`${API_BASE_URL}/bookings`);
      const result = await res.json();
      if (result.success) {
        setBookings(result.data);
        setError(null);
      } else {
        setError(result.message || 'Không thể tải danh sách đặt phòng');
      }
    } catch {
      setError('Lỗi kết nối đến server');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStatistics = useCallback(async () => {
    try {
      const res    = await fetch(`${API_BASE_URL}/bookings/statistics`);
      const result = await res.json();
      if (result.success) setStatistics(result.data);
    } catch {
      console.error('Fetch statistics failed');
    }
  }, []);

  const searchBookings = useCallback(async (term) => {
    setLoading(true);
    try {
      const res    = await fetch(`${API_BASE_URL}/bookings/search?searchTerm=${encodeURIComponent(term)}`);
      const result = await res.json();
      if (result.success) {
        setBookings(result.data);
        setError(null);
      }
    } catch {
      setError('Lỗi kết nối đến server');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── mount: load data ──────────────────────────────────────────────
  useEffect(() => {
    fetchBookings();
    fetchStatistics();
  }, [fetchBookings, fetchStatistics]);

  // ── search: debounce 400ms ────────────────────────────────────────
  useEffect(() => {
    if (!search.trim()) {
      fetchBookings();
      return;
    }
    const timer = setTimeout(() => searchBookings(search), 400);
    return () => clearTimeout(timer);
  }, [search, fetchBookings, searchBookings]);

  // ── filter client-side theo tab status ────────────────────────────
  const filtered = useMemo(() => {
    if (filterStatus === 'all') return bookings;
    return bookings.filter(b => b.status === filterStatus);
  }, [bookings, filterStatus]);

  // ── actions ───────────────────────────────────────────────────────
  // Duyệt: PATCH /api/bookings/{id}/approve
  const approve = async (id) => {
    try {
      const res    = await fetch(`${API_BASE_URL}/bookings/${id}/approve`, { method: 'PATCH' });
      const result = await res.json();

      if (result.success) {
        // optimistic update: đổi status ngay trên UI
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'approved', rejectedReason: '' } : b));
        setConfirmItem(null);
        // sync viewItem nếu đang mở detail modal của item này
        if (viewItem?.id === id) setViewItem(prev => ({ ...prev, status: 'approved', rejectedReason: '' }));
        // refresh stats
        await fetchStatistics();
      } else {
        alert(result.message || 'Duyệt thất bại');
      }
    } catch {
      alert('Lỗi kết nối đến server');
    }
  };

  // Từ chối: PATCH /api/bookings/{id}/reject  body: { reason }
  const reject = async (id) => {
    // Build reason string: nếu chọn "Lý do khác" → dùng rejNote, nếu có note thêm → append
    const reason = rejReason === 'Lý do khác'
      ? (rejNote.trim() || 'Lý do khác')
      : rejReason + (rejNote.trim() ? ` — ${rejNote.trim()}` : '');

    try {
      const res = await fetch(`${API_BASE_URL}/bookings/${id}/reject`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ reason })   // → maps to RejectBookingDto.Reason
      });
      const result = await res.json();

      if (result.success) {
        // optimistic update
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'rejected', rejectedReason: reason } : b));
        setRejectItem(null);
        setRejReason(REJECT_REASONS[0]);
        setRejNote('');
        if (viewItem?.id === id) setViewItem(prev => ({ ...prev, status: 'rejected', rejectedReason: reason }));
        await fetchStatistics();
      } else {
        alert(result.message || 'Từ chối thất bại');
      }
    } catch {
      alert('Lỗi kết nối đến server');
    }
  };

  // Đánh dấu dùng phòng: PATCH /api/bookings/{id}/mark-used
  const markAsUsed = async (id) => {
    try {
      const res    = await fetch(`${API_BASE_URL}/bookings/${id}/mark-used`, { method: 'PATCH' });
      const result = await res.json();

      if (result.success) {
        // optimistic update
        setBookings(prev => prev.map(b => b.id === id ? { ...b, isUsed: true } : b));
        // sync viewItem nếu đang mở detail modal
        if (viewItem?.id === id) setViewItem(prev => ({ ...prev, isUsed: true }));
      } else {
        alert(result.message || 'Đánh dấu sử dụng thất bại');
      }
    } catch {
      alert('Lỗi kết nối đến server');
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="bk-wrap">

        {/* Header */}
        <div className="rm-header">
          <h1><Calendar size={19} style={{ marginRight: 8, verticalAlign: 'middle' }}/> Quản lý Đặt Phòng Máy</h1>
          <p>Duyệt, từ chối và theo dõi các yêu cầu đặt phòng từ khách hàng</p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="bk-error">
            <span>⚠️ {error}</span>
            <button onClick={() => { setError(null); fetchBookings(); }}>×</button>
          </div>
        )}

        {/* Stats ── dùng statistics từ API ──────────────────────────── */}
        <div className="bk-stats">
          <div className="bk-sc bk-blue">
            <div><div className="sv">{statistics.total}</div><div className="sl">Tổng đặt phòng</div></div>
            <div className="si"><Calendar size={18}/></div>
          </div>
          <div className="bk-sc bk-amber">
            <div><div className="sv">{statistics.pending}</div><div className="sl">Chờ duyệt</div></div>
            <div className="si"><Clock size={18}/></div>
          </div>
          <div className="bk-sc bk-green">
            <div><div className="sv">{statistics.approved}</div><div className="sl">Đã duyệt</div></div>
            <div className="si"><CheckCircle2 size={18}/></div>
          </div>
          <div className="bk-sc bk-red">
            <div><div className="sv">{statistics.rejected}</div><div className="sl">Từ chối</div></div>
            <div className="si"><XCircle size={18}/></div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bk-toolbar">
          <div className="bk-search">
            <Search className="bk-si" size={16} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, mã đặt, phòng, mục đích..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="bk-tabs">
            {['all','pending','approved','rejected'].map(s => (
              <button key={s} className={`bk-tab${filterStatus === s ? ' act' : ''}`} onClick={() => setFilterStatus(s)}>
                {s !== 'all' && <StatusIcon status={s} sz={13} />}
                {s === 'all' ? 'Tất cả' : statusLabel(s)}
                <span className="tbadge">{s === 'all' ? bookings.length : bookings.filter(b => b.status === s).length}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bk-tw">
          <div style={{ overflowX:'auto' }}>
            <table className="bk-tbl">
              <thead>
                <tr>
                  <th>Họ tên</th>
                  <th>Mã phòng</th>
                  <th>Ngày đặt</th>
                  <th>Giờ vào</th>
                  <th>Giờ ra</th>
                  <th style={{ textAlign:'center' }}>Số người</th>
                  <th>Mục đích</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign:'center', width:120 }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {/* Loading */}
                {loading && (
                  <tr>
                    <td colSpan={9} style={{ textAlign:'center', padding:'48px 0' }}>
                      <div className="bk-spinner"></div>
                    </td>
                  </tr>
                )}

                {/* Data rows */}
                {!loading && filtered.length > 0 && filtered.map(b => (
                  <tr key={b.id} className={rowCls(b.status)}>
                    <td>
                      <div className="bk-name">{b.name}</div>
                      <div className="bk-sub">{b.code}</div>
                    </td>
                    <td><span className="bk-code">{b.roomCode}</span></td>
                    <td><div className="bk-time"><Calendar size={13}/>{b.date}</div></td>
                    <td><div className="bk-time"><Clock size={13}/>{b.timeIn}</div></td>
                    <td><div className="bk-time"><Clock size={13}/>{b.timeOut}</div></td>
                    <td style={{ textAlign:'center' }}>
                      <div className="bk-people"><Users size={14}/>{b.people}</div>
                    </td>
                    <td><span style={{ color:'#475569' }}>{b.purpose}</span></td>
                    <td>
                      <span className={`bk-sbadge ${statusCls(b.status)}`}>
                        <StatusIcon status={b.status} sz={13} />
                        {statusLabel(b.status)}
                      </span>
                    </td>
                    <td>
                      <div className="bk-acts">
                        <button className="bk-abtn approve" title="Duyệt" disabled={b.status !== 'pending'} onClick={() => setConfirmItem({ booking: b, action:'approve' })}>
                          <CheckCircle2 size={15}/>
                        </button>
                        <button className="bk-abtn reject" title="Từ chối" disabled={b.status !== 'pending'} onClick={() => { setRejectItem(b); setRejReason(REJECT_REASONS[0]); setRejNote(''); }}>
                          <XCircle size={15}/>
                        </button>
                        <button className="bk-abtn reject" title="Từ chối" disabled={b.status !== 'pending'} onClick={() => { setRejectItem(b); setRejReason(REJECT_REASONS[0]); setRejNote(''); }}>
                          <XCircle size={15}/>
                        </button>
                        <button className="bk-abtn view" title="Xem chi tiết" onClick={() => setViewItem(b)}>
                          <Eye size={15}/>
                        </button>
                        
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Empty */}
                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="bk-empty">
                      <Calendar size={38}/><br/>Không tìm thấy yêu cầu đặt phòng nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ────────── DETAIL MODAL ────────── */}
      {viewItem && (
        <div className="bk-ov" onClick={() => setViewItem(null)}>
          <div className="bk-modal" onClick={e => e.stopPropagation()}>
            <div className="bk-mh">
              <h3><AlignLeft size={16}/> Chi tiết đặt phòng <span className="mh-code">{viewItem.code}</span></h3>
              <button className="bk-mcl" onClick={() => setViewItem(null)}><X size={15}/></button>
            </div>
            <div className="bk-mb">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
                <span className={`bk-sbadge ${statusCls(viewItem.status)}`} style={{ fontSize:13, padding:'5px 12px' }}>
                  <StatusIcon status={viewItem.status} sz={15} />
                  {statusLabel(viewItem.status)}
                </span>
                <span style={{ fontSize:12, color:'#94a3b8' }}>Ngày đặt: {viewItem.createdAt}</span>
              </div>

              <div className="bk-dg">
                <div className="bk-di">
                  <div className="di-label"><Users size={11}/> Họ tên</div>
                  <div className="di-val">{viewItem.name}</div>
                </div>
                <div className="bk-di">
                  <div className="di-label"><Calendar size={11}/> Mã phòng</div>
                  <div className="di-val" style={{ fontFamily:"'JetBrains Mono',monospace", color:'#6366f1', fontSize:14 }}>{viewItem.roomCode}</div>
                </div>
                <div className="bk-di">
                  <div className="di-label"><Calendar size={11}/> Ngày đặt</div>
                  <div className="di-val">{viewItem.date}</div>
                </div>
                <div className="bk-di">
                  <div className="di-label"><Users size={11}/> Số người</div>
                  <div className="di-val">{viewItem.people} người</div>
                </div>
                <div className="bk-di">
                  <div className="di-label"><Clock size={11}/> Giờ vào</div>
                  <div className="di-val">{viewItem.timeIn}</div>
                </div>
                <div className="bk-di">
                  <div className="di-label"><Clock size={11}/> Giờ ra</div>
                  <div className="di-val">{viewItem.timeOut}</div>
                </div>
                <div className="bk-di full">
                  <div className="di-label"><AlignLeft size={11}/> Mục đích sử dụng</div>
                  <div className="di-val di-purpose">{viewItem.purpose}</div>
                </div>
              </div>

              {viewItem.status === 'rejected' && viewItem.rejectedReason && (
                <div className="bk-rej-box">
                  <div className="rb-title"><XCircle size={13}/> Lý do từ chối</div>
                  <div className="rb-text">{viewItem.rejectedReason}</div>
                </div>
              )}

              {/* ── isUsed section: chỉ hiển thị khi status === approved ── */}
              {viewItem.status === 'approved' && (
                <div className="bk-used-box">
                  <div className="ub-title"><CheckCircle2 size={12}/> Trạng thái sử dụng phòng</div>

                  {/* Đã dùng → show badge */}
                  {viewItem.isUsed ? (
                    <div className="bk-used-badge">
                      <CheckCircle2 size={18}/>
                      <span>Phòng đã được sử dụng</span>
                    </div>
                  ) : (
                    // Chưa dùng → show 2 nút
                    <div className="bk-used-btns">
                      <button className="bk-used-btn cancel" onClick={() => setViewItem(null)}>
                        <XCircle size={15}/> Không dùng
                      </button>
                      <button className="bk-used-btn confirm" onClick={() => markAsUsed(viewItem.id)}>
                        <CheckCircle2 size={15}/> Xác nhận dùng phòng
                      </button>
                    </div>
                  )}
                </div>
              )}

              {viewItem.status === 'pending' && (
                <div className="bk-fac">
                  <button className="bk-bsb btn-reject" onClick={() => { setRejectItem(viewItem); setRejReason(REJECT_REASONS[0]); setRejNote(''); }}>
                    <XCircle size={15}/> Từ chối
                  </button>
                  <button className="bk-bsb btn-approve" onClick={() => setConfirmItem({ booking: viewItem, action:'approve' })}>
                    <CheckCircle2 size={15}/> Duyệt
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ────────── REJECT MODAL ────────── */}
      {rejectItem && (
        <div className="bk-ov" onClick={() => setRejectItem(null)}>
          <div className="bk-modal" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
            <div className="bk-mh">
              <h3><XCircle size={16} style={{ color:'#ef4444' }}/> Từ chối đặt phòng <span className="mh-code">{rejectItem.code}</span></h3>
              <button className="bk-mcl" onClick={() => setRejectItem(null)}><X size={15}/></button>
            </div>
            <div className="bk-mb">
              <div style={{ background:'#f8fafc', border:'1px solid #f1f5f9', borderRadius:10, padding:'12px 14px', marginBottom:18, display:'flex', gap:24, flexWrap:'wrap' }}>
                <div><span style={{ fontSize:11, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.04em', fontWeight:600 }}>Người đặt</span><br/><span style={{ fontSize:13, fontWeight:600, color:'#1e293b' }}>{rejectItem.name}</span></div>
                <div><span style={{ fontSize:11, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.04em', fontWeight:600 }}>Phòng</span><br/><span style={{ fontSize:13, fontWeight:600, color:'#6366f1', fontFamily:"'JetBrains Mono',monospace" }}>{rejectItem.roomCode}</span></div>
                <div><span style={{ fontSize:11, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'.04em', fontWeight:600 }}>Ngày / Giờ</span><br/><span style={{ fontSize:13, fontWeight:600, color:'#1e293b' }}>{rejectItem.date} • {rejectItem.timeIn}–{rejectItem.timeOut}</span></div>
              </div>

              <div className="bk-rej-title"><XCircle size={15}/> Chọn lý do từ chối</div>
              <label className="bk-rej-label">Lý do chính <span style={{ color:'#ef4444' }}>*</span></label>
              <select className="bk-rej-sel" value={rejReason} onChange={e => setRejReason(e.target.value)}>
                {REJECT_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <label className="bk-rej-label">Ghi chú thêm {rejReason === 'Lý do khác' && <span style={{ color:'#ef4444' }}>*</span>}</label>
              <textarea className="bk-rej-ta" value={rejNote} onChange={e => setRejNote(e.target.value)} placeholder="Nhập chi tiết lý do từ chối..." />

              <div className="bk-fac">
                <button className="bk-bcn" onClick={() => setRejectItem(null)}>Hủy</button>
                <button className="bk-bsb btn-reject" disabled={rejReason === 'Lý do khác' && !rejNote.trim()} onClick={() => reject(rejectItem.id)}>
                  <XCircle size={15}/> Xác nhận từ chối
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────────── APPROVE CONFIRM MODAL ────────── */}
      {confirmItem && (
        <div className="bk-ov" onClick={() => setConfirmItem(null)}>
          <div className="bk-modal bk-confirm" onClick={e => e.stopPropagation()}>
            <div className="bk-mh">
              <h3><CheckCircle2 size={16} style={{ color:'#10b981' }}/> Xác nhận duyệt</h3>
              <button className="bk-mcl" onClick={() => setConfirmItem(null)}><X size={15}/></button>
            </div>
            <div className="bk-mb">
              <div className="bk-confirm-icon ci-approve"><CheckCircle2 size={26}/></div>
              <h4>Duyệt đặt phòng?</h4>
              <p>
                Bạn sẽ duyệt yêu cầu đặt phòng <strong style={{ color:'#1e293b' }}>{confirmItem.booking.code}</strong> của{' '}
                <strong style={{ color:'#1e293b' }}>{confirmItem.booking.name}</strong> cho phòng{' '}
                <strong style={{ color:'#6366f1' }}>{confirmItem.booking.roomCode}</strong> vào ngày {confirmItem.booking.date},{' '}
                từ {confirmItem.booking.timeIn} đến {confirmItem.booking.timeOut}.
              </p>
              <div className="bk-fac">
                <button className="bk-bcn" onClick={() => setConfirmItem(null)}>Hủy</button>
                <button className="bk-bsb btn-approve" onClick={() => approve(confirmItem.booking.id)}>
                  <CheckCircle2 size={15}/> Duyệt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}