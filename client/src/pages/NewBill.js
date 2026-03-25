import { useState, useRef } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import signImg from '../assets/sign.jpg';
import motorLeft from '../assets/motor-left.jpg';
import motorRight from '../assets/motor-right.jpg';

// ─── Default items ───
const DEFAULT_ITEMS = [
  { label: 'Laxmi Pump',       description: 'Laxmi ___ HP ___ Stage Pump', qty: 1,  rate: '', amount: 0, checked: false },
  { label: 'Pipe ISI Brand',   description: 'Pipe ISI Brand ___ Fut',       qty: 1,  rate: '', amount: 0, checked: false },
  { label: 'Cable ISI',        description: '2.5 Sq mm ISI Brand Cable',    qty: '', rate: '', amount: 0, checked: false, unit: 'Miter' },
  { label: 'Rope 10mm',        description: 'Rope 10mm',                    qty: 1,  rate: '', amount: 0, checked: false },
  { label: 'Dry Run Panel',    description: 'Dry Run Panel Kissan',         qty: 1,  rate: '', amount: 0, checked: false },
  { label: 'Fitting Material', description: 'Fitting Material',             qty: 1,  rate: '', amount: 0, checked: false },
  { label: 'Panel Box',        description: 'Panel Box',                    qty: 1,  rate: '', amount: 0, checked: false },
  { label: 'Fitting Charges',  description: 'Fitting Charges',              qty: 1,  rate: '', amount: 0, checked: false },
];

// ─── Language content ───
const LANG = {
  mr: {
    cashMemo:    'कॅश मेमो',
    tagline:     '|| श्री चिंतामणी प्रसन्न ||',
    company:     'चिंतामणी इलेक्ट्रिकल्स ॲण्ड मोटार वायडिंग',
    subtext:     'आमच्याकडे सर्व प्रकारच्या मोटार वायडिंग व दुरुस्ती करुन मिळेल.',
    address:     'मु.पो.कुंजीरवाडी,(थेऊरफाटा),ता.हवेली,जि.पुणे– ४१२११०',
    propr:       'प्रोप्रा.:कैलास काळे',
    shri:        'श्री.',
    billNo:      'बिल नं.',
    date:        'दि:',
    srNo:        'क्र.',
    details:     'तपशील',
    qty:         'नग',
    rate:        'दर',
    amount:      'रक्कम',
    total:       'एकूण',
    custSign:    'ग्राहकाची सही',
    forSign:     'चिंतामणी इलेक्ट्रिकल्स ॲण्ड मोटार वायडिंग किरता',
    warranty:    '१८ महिने वॉरंटी',
    replacement: 'रु. ८०० बदली शुल्क',
  },
  en: {
    cashMemo:    'CASH MEMO',
    tagline:     '|| Shree Chintamani Prasanna ||',
    company:     'Chintamani Electricals & Motor Winding',
    subtext:     'All types of motor winding & repair services available.',
    address:     'Muje Kunjirwadi (Theurphata), Tal. Haveli, Dist. Pune – 412110',
    propr:       'Propr.: Kailas Kale',
    shri:        'Mr./Ms.',
    billNo:      'Bill No.',
    date:        'Date:',
    srNo:        'Sr.',
    details:     'Description',
    qty:         'Qty',
    rate:        'Rate',
    amount:      'Amount',
    total:       'Total',
    custSign:    'Customer Signature',
    forSign:     'For Chintamani Electricals & Motor Winding',
    warranty:    '18 Months Warranty',
    replacement: 'Rs. 800 Replacement Charges',
  },
};

export default function NewBill() {
  const memoRef = useRef();
  const [lang, setLang] = useState('mr');
  const [customer, setCustomer] = useState({ name: '', mobile: '', address: '' });
  const [items, setItems] = useState(DEFAULT_ITEMS.map(i => ({ ...i })));
  const [customItems, setCustomItems] = useState([]);
  const [costPrice, setCostPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [savedBill, setSavedBill] = useState(null);

  const L = LANG[lang];
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  // ── Item handlers ──
  const toggleItem = (idx) =>
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, checked: !item.checked } : item));

  const updateItem = (idx, field, value) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [field]: value };
      if (field === 'qty' || field === 'rate') {
        const q = parseFloat(field === 'qty' ? value : item.qty) || 0;
        const r = parseFloat(field === 'rate' ? value : item.rate) || 0;
        updated.amount = q * r;
      }
      return updated;
    }));
  };

  const addCustomItem = () =>
    setCustomItems(prev => [...prev, { description: '', qty: 1, rate: '', amount: 0 }]);

  const updateCustomItem = (idx, field, value) => {
    setCustomItems(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [field]: value };
      if (field === 'qty' || field === 'rate') {
        const q = parseFloat(field === 'qty' ? value : item.qty) || 0;
        const r = parseFloat(field === 'rate' ? value : item.rate) || 0;
        updated.amount = q * r;
      }
      return updated;
    }));
  };

  const removeCustomItem = (idx) =>
    setCustomItems(prev => prev.filter((_, i) => i !== idx));

  const allBillItems = [...items.filter(i => i.checked), ...customItems];
  const total = allBillItems.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);

  // ── Generate PDF using html2canvas + jsPDF ──
  const generatePDF = async (billData) => {
    try {
      const { default: html2canvas } = await import('html2canvas');
      const { default: jsPDF } = await import('jspdf');

      const element = memoRef.current;
      if (!element) throw new Error('Memo ref not found');

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a5', // A5 = exactly like cash memo size
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Fit entire memo in one page
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

      // Filename = customer name
      const customerName = billData?.customer?.name || customer.name || 'bill';
      const billNo = billData?.billNo || '';
      const filename = `${customerName.replace(/\s+/g, '_')}_Bill_${billNo}.pdf`;

      return { pdf, filename };
    } catch (err) {
      console.error('PDF generation error:', err);
      throw err;
    }
  };

  // ── Save Bill ──
  const handleSave = async () => {
    if (!customer.name || !customer.mobile) { toast.error('Please enter customer name and mobile!'); return; }
    if (allBillItems.length === 0) { toast.error('Please select at least one item!'); return; }

    setLoading(true);
    try {
      const res = await api.post('/bills', {
        customer,
        items: allBillItems.map(i => ({
          description: i.description,
          qty: parseFloat(i.qty) || 1,
          rate: parseFloat(i.rate) || 0,
          amount: parseFloat(i.amount) || 0,
        })),
        notes: `${L.warranty}. ${L.replacement}.`,
        costPrice: parseFloat(costPrice) || 0,
        language: lang,
      });
      setSavedBill(res.data.bill);
      toast.success(`Bill #${res.data.bill.billNo} created! 🎉`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create bill');
    }
    setLoading(false);
  };

  // ── Print (browser print dialog) ──
  const handlePrint = () => window.print();

  // ── Download PDF ──
  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      const { pdf, filename } = await generatePDF(savedBill);
      pdf.save(filename);
      toast.success(`PDF saved as "${filename}" ✅`);
    } catch {
      toast.error('PDF generation failed. Try Print instead.');
    }
    setPdfLoading(false);
  };

  // ── WhatsApp: Download PDF first → then open WhatsApp ──
  const handleWhatsApp = async () => {
    if (!savedBill) return;
    setPdfLoading(true);
    try {
      // Step 1: Generate & download PDF automatically
      const { pdf, filename } = await generatePDF(savedBill);
      pdf.save(filename);

      // Step 2: Short delay then open WhatsApp
      await new Promise(r => setTimeout(r, 800));

      const msg = lang === 'mr'
        ? `🙏 नमस्कार ${savedBill.customer.name} जी,\n\nश्री चिंतामणी इलेक्ट्रिकल्स\nBill No: #${savedBill.billNo}\nदिनांक: ${dateStr}\nएकूण: रु. ${savedBill.total.toLocaleString()}\n\n✅ १८ महिने वॉरंटी\n💰 रु.८०० बदली शुल्क\n\n(Bill PDF attached separately)\n\nधन्यवाद 🙏\nSagar Kale: 9527370207`
        : `Dear ${savedBill.customer.name},\n\nChintamani Electricals & Motor Winding\nBill No: #${savedBill.billNo}\nDate: ${dateStr}\nTotal: Rs. ${savedBill.total.toLocaleString()}\n\n✅ 18 Months Warranty\n💰 Rs.800 Replacement Charges\n\n(Bill PDF attached separately)\n\nThank you!\nSagar Kale: 9527370207`;

      window.open(`https://wa.me/91${savedBill.customer.mobile}?text=${encodeURIComponent(msg)}`);
      toast.success('PDF downloaded! Now attach it in WhatsApp 📎');
    } catch {
      toast.error('Failed. Try Download PDF button instead.');
    }
    setPdfLoading(false);
  };

  const handleNewBill = () => {
    setSavedBill(null);
    setCustomer({ name: '', mobile: '', address: '' });
    setItems(DEFAULT_ITEMS.map(i => ({ ...i })));
    setCustomItems([]);
    setCostPrice('');
  };

  // ─────────────────────────────────────────────────────────
  // ── THE CASH MEMO COMPONENT (used for preview + PDF) ──
  // ─────────────────────────────────────────────────────────
  const CashMemo = () => (
    <div
      ref={memoRef}
      id="cash-memo"
      style={{
        fontFamily: lang === 'mr'
          ? "'Noto Sans Devanagari', 'Mangal', sans-serif"
          : "'Georgia', serif",
        fontSize: '11px',
        background: 'white',
        border: '2.5px solid #111',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* ── HEADER ── */}
      <div style={{ borderBottom: '2px solid #111', padding: '7px 10px 5px' }}>
        {/* Top row: Cash Memo | tagline | phone */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
          <span style={{ border: '1px solid #333', padding: '1px 5px', fontSize: '9.5px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
            {L.cashMemo}
          </span>
          <span style={{ fontWeight: '700', fontSize: '11px', textAlign: 'center', flex: 1, margin: '0 8px' }}>
            {L.tagline}
          </span>
          <div style={{ textAlign: 'right', fontSize: '9.5px', lineHeight: '1.5', whiteSpace: 'nowrap' }}>
            <div>Mob : 9527370207</div>
            <div>9970780137</div>
          </div>
        </div>

        {/* Company row: left-image | company info | right-image */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
          {/* Left: submersible pumps group */}
          <img
            src={motorRight}
            alt="submersible pumps"
            style={{ height: '58px', width: '58px', objectFit: 'contain', flexShrink: 0 }}
          />

          {/* Center: company name + address */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{
              color: '#c0392b',
              fontWeight: '900',
              fontSize: '14.5px',
              lineHeight: '1.3',
              fontFamily: 'Georgia, serif',
            }}>
              {L.company}
            </div>
            <div style={{ fontSize: '9px', color: '#444', marginTop: '2px' }}>{L.subtext}</div>
            <div style={{ fontSize: '9px', color: '#444' }}>{L.address}</div>
            <div style={{ fontSize: '9.5px', fontWeight: 'bold', color: '#222', marginTop: '1px' }}>{L.propr}</div>
          </div>

          {/* Right: single motor */}
          <img
            src={motorLeft}
            alt="motor"
            style={{ height: '58px', width: '58px', objectFit: 'contain', flexShrink: 0 }}
          />
        </div>
      </div>

      {/* ── CUSTOMER + BILL INFO ── */}
      <div style={{
        borderBottom: '1px solid #666',
        padding: '6px 10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '10px',
      }}>
        {/* Customer details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '12px', flexShrink: 0 }}>{L.shri}</span>
            <span style={{ fontWeight: '600', borderBottom: '1px solid #666', flex: 1, paddingBottom: '1px', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {savedBill ? savedBill.customer.name : customer.name}
            </span>
          </div>
          {(savedBill ? savedBill.customer.address : customer.address) && (
            <div style={{ fontSize: '9px', color: '#555', marginLeft: '24px', marginTop: '2px' }}>
              {savedBill ? savedBill.customer.address : customer.address}
            </div>
          )}
          {(savedBill ? savedBill.customer.mobile : customer.mobile) && (
            <div style={{ fontSize: '9px', color: '#666', marginLeft: '24px' }}>
              📱 {savedBill ? savedBill.customer.mobile : customer.mobile}
            </div>
          )}
        </div>

        {/* Bill No + Date — fixed width to prevent overflow */}
        <div style={{ textAlign: 'right', flexShrink: 0, minWidth: '90px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '3px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '9.5px', whiteSpace: 'nowrap' }}>{L.billNo}</span>
            <span style={{ fontWeight: '900', fontSize: '17px', color: '#111', lineHeight: 1 }}>
              {savedBill ? savedBill.billNo : '___'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '3px', marginTop: '3px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '9.5px', whiteSpace: 'nowrap' }}>{L.date}</span>
            <span style={{ fontSize: '9.5px', whiteSpace: 'nowrap' }}>{dateStr}</span>
          </div>
        </div>
      </div>

      {/* ── ITEMS TABLE ── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: '24px' }} />
          <col style={{ width: 'auto' }} />
          <col style={{ width: '38px' }} />
          <col style={{ width: '46px' }} />
          <col style={{ width: '58px' }} />
        </colgroup>
        <thead>
          <tr style={{ borderBottom: '2px solid #111', background: '#f5f5f5' }}>
            <th style={{ borderRight: '1px solid #888', padding: '4px 2px', textAlign: 'center', fontWeight: 'bold', fontSize: '10px' }}>{L.srNo}</th>
            <th style={{ borderRight: '1px solid #888', padding: '4px 6px', textAlign: 'left', fontWeight: 'bold', fontSize: '10px' }}>{L.details}</th>
            <th style={{ borderRight: '1px solid #888', padding: '4px 2px', textAlign: 'center', fontWeight: 'bold', fontSize: '10px' }}>{L.qty}</th>
            <th style={{ borderRight: '1px solid #888', padding: '4px 2px', textAlign: 'center', fontWeight: 'bold', fontSize: '10px' }}>{L.rate}</th>
            <th style={{ padding: '4px 2px', textAlign: 'right', fontWeight: 'bold', fontSize: '10px', paddingRight: '4px' }}>{L.amount}</th>
          </tr>
        </thead>
        <tbody>
          {allBillItems.length > 0 ? (
            <>
              {allBillItems.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #ccc' }}>
                  <td style={{ borderRight: '1px solid #ccc', padding: '4px 2px', textAlign: 'center' }}>{idx + 1}</td>
                  <td style={{ borderRight: '1px solid #ccc', padding: '4px 6px', wordBreak: 'break-word' }}>{item.description}</td>
                  <td style={{ borderRight: '1px solid #ccc', padding: '4px 2px', textAlign: 'center' }}>{item.qty}</td>
                  <td style={{ borderRight: '1px solid #ccc', padding: '4px 2px', textAlign: 'right', paddingRight: '4px' }}>
                    {item.rate ? parseFloat(item.rate).toLocaleString('en-IN') : ''}
                  </td>
                  <td style={{ padding: '4px 4px', textAlign: 'right', fontWeight: '600' }}>
                    {item.amount ? `${parseFloat(item.amount).toLocaleString('en-IN')}/-` : ''}
                  </td>
                </tr>
              ))}
              {/* Fill empty rows to make memo look full */}
              {allBillItems.length < 8 && Array.from({ length: 8 - allBillItems.length }).map((_, i) => (
                <tr key={`e${i}`} style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <td style={{ borderRight: '1px solid #e0e0e0', padding: '8px 2px' }}></td>
                  <td style={{ borderRight: '1px solid #e0e0e0', padding: '8px 6px' }}></td>
                  <td style={{ borderRight: '1px solid #e0e0e0', padding: '8px 2px' }}></td>
                  <td style={{ borderRight: '1px solid #e0e0e0', padding: '8px 2px' }}></td>
                  <td style={{ padding: '8px 4px' }}></td>
                </tr>
              ))}
            </>
          ) : (
            Array.from({ length: 10 }).map((_, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #e0e0e0' }}>
                <td style={{ borderRight: '1px solid #e0e0e0', padding: '8px 2px', textAlign: 'center', color: '#ddd', fontSize: '9px' }}>{i + 1}</td>
                <td style={{ borderRight: '1px solid #e0e0e0', padding: '8px 6px' }}></td>
                <td style={{ borderRight: '1px solid #e0e0e0', padding: '8px 2px' }}></td>
                <td style={{ borderRight: '1px solid #e0e0e0', padding: '8px 2px' }}></td>
                <td style={{ padding: '8px 4px' }}></td>
              </tr>
            ))
          )}

          {/* Total row */}
          <tr style={{ borderTop: '2px solid #111' }}>
            <td colSpan={3} style={{ borderRight: '1px solid #888', padding: '5px 8px' }}>
              <div style={{ border: '1px solid #888', padding: '3px 6px', display: 'inline-block', borderRadius: '2px', fontSize: '9px' }}>
                <div style={{ fontWeight: 'bold' }}>{L.warranty}</div>
                <div>{L.replacement}</div>
              </div>
            </td>
            <td style={{ borderRight: '1px solid #888', padding: '5px 2px', textAlign: 'center', fontWeight: '900', color: '#c0392b', fontSize: '12px' }}>
              {L.total}
            </td>
            <td style={{ padding: '5px 4px', textAlign: 'right', fontWeight: '900', fontSize: '13px' }}>
              {total > 0 ? `${total.toLocaleString('en-IN')}/-` : (savedBill ? `${savedBill.total.toLocaleString('en-IN')}/-` : '')}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── FOOTER: signatures ── */}
      <div style={{ borderTop: '1px solid #888', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '8px 12px 10px' }}>
        <div>
          <p style={{ fontWeight: 'bold', fontSize: '9.5px', margin: '0 0 2px 0' }}>{L.custSign}</p>
          <div style={{ width: '90px', borderBottom: '1px solid #666', marginTop: '28px' }}></div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <img
            src={signImg}
            alt="Sagar Kale Signature"
            style={{ height: '38px', objectFit: 'contain', display: 'block', margin: '0 auto 2px' }}
          />
          <p style={{ color: '#c0392b', fontWeight: 'bold', fontSize: '9px', margin: 0 }}>{L.forSign}</p>
        </div>
      </div>
    </div>
  );

  // ──────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">New Bill / Cash Memo</h1>
          <p className="text-gray-400 text-sm mt-0.5">Fill in details to generate a cash memo</p>
        </div>
        <div className="flex gap-2 items-center flex-wrap w-full lg:w-auto">
          {/* Language Toggle */}
          {!savedBill && (
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-full sm:w-auto justify-center">
              <button onClick={() => setLang('mr')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${lang === 'mr' ? 'bg-primary text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}>
                मराठी
              </button>
              <button onClick={() => setLang('en')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${lang === 'en' ? 'bg-primary text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}>
                English
              </button>
            </div>
          )}

          {savedBill ? (
            <>
              <button onClick={handleWhatsApp} disabled={pdfLoading}
                className="flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-600 transition disabled:opacity-60 w-full sm:w-auto">
                {pdfLoading ? '⏳...' : '📱 WhatsApp + PDF'}
              </button>
              <button onClick={handleDownloadPDF} disabled={pdfLoading}
                className="flex items-center justify-center gap-2 bg-accent text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition disabled:opacity-60 w-full sm:w-auto">
                {pdfLoading ? '⏳...' : '⬇️ Download PDF'}
              </button>
              <button onClick={handlePrint}
                className="flex items-center justify-center gap-2 bg-gray-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition w-full sm:w-auto">
                🖨️ Print
              </button>
              <button onClick={handleNewBill}
                className="flex items-center justify-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition w-full sm:w-auto">
                ➕ New Bill
              </button>
            </>
          ) : (
            <button onClick={handleSave} disabled={loading}
              className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition disabled:opacity-50 w-full sm:w-auto">
              {loading ? '⏳ Saving...' : '💾 Save & Generate Bill'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* ══════════ LEFT — FORM ══════════ */}
        <div className="space-y-4">

          {/* Language banner */}
          {!savedBill && (
            <div className={`rounded-lg px-4 py-2.5 text-sm font-medium flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 ${lang === 'mr' ? 'bg-orange-50 text-orange-700 border border-orange-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
              {lang === 'mr' ? '🟠 मराठी भाषेत बिल तयार होईल' : '🔵 Bill will be generated in English'}
              <span className="sm:ml-auto text-xs opacity-60">{lang === 'mr' ? '(For rural/village customers)' : '(For educated/IT park customers)'}</span>
            </div>
          )}

          {/* 1. Customer Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <span className="bg-primary text-white w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold">1</span>
              Customer Details
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Customer Name *</label>
                <input type="text" placeholder="e.g. Rushi More" value={customer.name}
                  onChange={e => setCustomer({ ...customer, name: e.target.value })} disabled={!!savedBill}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50 transition" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Mobile Number *</label>
                <input type="tel" placeholder="e.g. 9876543210" value={customer.mobile}
                  onChange={e => setCustomer({ ...customer, mobile: e.target.value })} disabled={!!savedBill}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50 transition" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Address / Location</label>
                <input type="text" placeholder="e.g. More Vasti, Hadapsar, Pune" value={customer.address}
                  onChange={e => setCustomer({ ...customer, address: e.target.value })} disabled={!!savedBill}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50 transition" />
              </div>
            </div>
          </div>

          {/* 2. Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
              <span className="bg-primary text-white w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold">2</span>
              Select Items
            </h2>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className={`border rounded-lg transition-all ${item.checked ? 'border-primary bg-blue-50' : 'border-gray-100 bg-gray-50'}`}>
                  <div className="flex items-center gap-3 p-3">
                    <input type="checkbox" checked={item.checked} onChange={() => toggleItem(idx)} disabled={!!savedBill}
                      className="w-4 h-4 accent-primary cursor-pointer" />
                    <span className="text-sm font-medium text-gray-700 flex-1">{item.label}</span>
                    {item.checked && <span className="text-xs text-primary font-bold">₹{(item.amount || 0).toLocaleString('en-IN')}</span>}
                  </div>
                  {item.checked && (
                    <div className="px-3 pb-3 space-y-2 border-t border-blue-100 pt-2">
                      <input type="text" value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)}
                        disabled={!!savedBill} placeholder="Description"
                        className="w-full border border-blue-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary bg-white" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-gray-400 mb-0.5 block">Qty {item.unit ? `(${item.unit})` : ''}</label>
                          <input type="number" value={item.qty} onChange={e => updateItem(idx, 'qty', e.target.value)} disabled={!!savedBill}
                            className="w-full border border-blue-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary bg-white" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-0.5 block">Rate (₹)</label>
                          <input type="number" value={item.rate} onChange={e => updateItem(idx, 'rate', e.target.value)} disabled={!!savedBill}
                            className="w-full border border-blue-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary bg-white" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {customItems.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Custom Items</p>
                {customItems.map((item, idx) => (
                  <div key={idx} className="border border-orange-200 bg-orange-50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <input type="text" value={item.description} onChange={e => updateCustomItem(idx, 'description', e.target.value)}
                        disabled={!!savedBill} placeholder="Item description"
                        className="flex-1 border border-orange-200 rounded px-2 py-1.5 text-xs focus:outline-none bg-white" />
                      {!savedBill && <button onClick={() => removeCustomItem(idx)} className="text-red-400 hover:text-red-600 text-lg">✕</button>}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-400 mb-0.5 block">Qty</label>
                        <input type="number" value={item.qty} onChange={e => updateCustomItem(idx, 'qty', e.target.value)}
                          disabled={!!savedBill} className="w-full border border-orange-200 rounded px-2 py-1.5 text-xs bg-white" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-0.5 block">Rate (₹)</label>
                        <input type="number" value={item.rate} onChange={e => updateCustomItem(idx, 'rate', e.target.value)}
                          disabled={!!savedBill} className="w-full border border-orange-200 rounded px-2 py-1.5 text-xs bg-white" />
                      </div>
                    </div>
                    <p className="text-xs text-right font-semibold text-orange-600">₹{(item.amount || 0).toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
            )}
            {!savedBill && (
              <button onClick={addCustomItem}
                className="mt-4 w-full border-2 border-dashed border-gray-200 text-gray-400 py-2.5 rounded-lg text-sm hover:border-primary hover:text-primary transition">
                + Add Custom Item
              </button>
            )}
          </div>

          {/* 3. Profit */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-bold text-gray-700 mb-1 flex items-center gap-2">
              <span className="bg-purple-500 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold">3</span>
              Profit Tracking
              <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full ml-1">Private</span>
            </h2>
            <p className="text-xs text-gray-400 mb-3">Not shown on bill</p>
            <input type="number" placeholder="Your cost price (₹)" value={costPrice}
              onChange={e => setCostPrice(e.target.value)} disabled={!!savedBill}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:bg-gray-50" />
            {costPrice && (
              <div className="mt-3 bg-purple-50 rounded-lg p-3 flex flex-col sm:flex-row sm:justify-between gap-1 text-sm">
                <span className="text-gray-600">Estimated Profit:</span>
                <span className="font-bold text-purple-600">₹{(total - parseFloat(costPrice || 0)).toLocaleString('en-IN')}</span>
              </div>
            )}
          </div>

          {/* Total Card */}
          <div className="bg-primary rounded-xl p-5 text-white shadow-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-blue-200 text-sm">Total Amount</p>
                <p className="text-3xl font-black mt-1">₹{total.toLocaleString('en-IN')}</p>
              </div>
              <div className="text-right">
                <p className="text-blue-200 text-xs">Items selected</p>
                <p className="text-2xl font-bold">{allBillItems.length}</p>
              </div>
            </div>
          </div>

          {/* WhatsApp tip */}
          {savedBill && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
              <p className="font-bold mb-1">📱 How to send PDF on WhatsApp:</p>
              <p>1. Click <strong>"WhatsApp + PDF"</strong> — PDF auto-downloads to your device</p>
              <p>2. WhatsApp opens with message pre-filled</p>
              <p>3. Click 📎 attachment → select the downloaded PDF</p>
              <p>4. Send! Done ✅</p>
            </div>
          )}
        </div>

        {/* ══════════ RIGHT — LIVE PREVIEW ══════════ */}
        <div>
          <div className="xl:sticky xl:top-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">📄 Live Preview</p>
              <div className="flex items-center gap-2">
                {savedBill && (
                  <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-1 rounded-full">
                    ✅ Bill #{savedBill.billNo} Saved
                  </span>
                )}
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${lang === 'mr' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                  {lang === 'mr' ? '🟠 मराठी' : '🔵 English'}
                </span>
              </div>
            </div>

            {/* Render the memo */}
            <div className="overflow-x-auto">
              <div className="min-w-[520px]">
                <CashMemo />
              </div>
            </div>

            {/* Action buttons */}
            {!savedBill ? (
              <button onClick={handleSave} disabled={loading}
                className="mt-4 w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition disabled:opacity-50 text-sm shadow-lg">
                {loading ? '⏳ Saving...' : '💾 Save & Generate Bill'}
              </button>
            ) : (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button onClick={handleWhatsApp} disabled={pdfLoading}
                  className="bg-green-500 text-white py-2.5 rounded-xl font-bold hover:bg-green-600 transition text-xs shadow disabled:opacity-60">
                  {pdfLoading ? '⏳' : '📱 WhatsApp\n+ PDF'}
                </button>
                <button onClick={handleDownloadPDF} disabled={pdfLoading}
                  className="bg-accent text-white py-2.5 rounded-xl font-bold hover:opacity-90 transition text-xs shadow disabled:opacity-60">
                  {pdfLoading ? '⏳' : '⬇️ Download\nPDF'}
                </button>
                <button onClick={handlePrint}
                  className="bg-gray-700 text-white py-2.5 rounded-xl font-bold hover:bg-gray-800 transition text-xs shadow">
                  🖨️ Print
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Print CSS */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #cash-memo, #cash-memo * { visibility: visible !important; }
          #cash-memo {
            position: fixed !important;
            top: 0 !important; left: 0 !important;
            width: 148mm !important;
            border: 2px solid #111 !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          @page { size: A5 portrait; margin: 5mm; }
        }
      `}</style>
    </div>
  );
}