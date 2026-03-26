import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";
import signImg from "../assets/sign.jpg";
import motorLeft from "../assets/motor-left.jpg";
import motorRight from "../assets/motor-right.jpg";

const LANG = {
  mr: {
    cashMemo: "कॅश मेमो",
    tagline: "|| श्री चिंतामणी प्रसन्न ||",
    company: "चिंतामणी इलेक्ट्रिकल्स ॲण्ड मोटार वायडिंग",
    subtext: "आमच्याकडे सर्व प्रकारच्या मोटार वायडिंग व दुरुस्ती करुन मिळेल.",
    address: "लोकसेवा हनुमान मंदिराशेजारी, PMPML बस थांबा, हडपसर गाडीतळ.",
    propr: "प्रोप्रा.:सागर काळे",
    shri: "श्री.",
    billNo: "बिल नं.",
    date: "दि:",
    srNo: "क्र.",
    details: "तपशील",
    qty: "नग",
    rate: "दर",
    amount: "रक्कम",
    total: "एकूण",
    custSign: "ग्राहकाची सही",
    forSign: "चिंतामणी इलेक्ट्रिकल्स",
    warranty: "१ वर्षाची वॉरंटी",
    replacement: "रु. ८०० बदली शुल्क",
  },
  en: {
    cashMemo: "CASH MEMO",
    tagline: "|| Shree Chintamani Prasanna ||",
    company: "Chintamani Electricals & Motor Winding",
    subtext: "All types of motor winding & repair services available.",
    address: "Near Lokseva Hanuman Mandir, PMPML Bus Stop, Hadapsar",
    propr: "Propr.: Sagar Kale",
    shri: "Mr./Ms.",
    billNo: "Bill No.",
    date: "Date:",
    srNo: "Sr.",
    details: "Description",
    qty: "Qty",
    rate: "Rate",
    amount: "Amount",
    total: "Total",
    custSign: "Customer Signature",
    forSign: "Chintamani Electricals",
    warranty: "1 Year Warranty",
    replacement: "Rs. 800 Replacement Charges",
  },
};

function BillPreviewModal({ bill, onClose }) {
  const pdfRef = useRef();
  const lang = bill.language || "en";
  const L = LANG[lang] || LANG.en;
  const dateStr = new Date(bill.date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    toast.loading("Generating PDF...", { id: "pdf" });
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(pdfRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#fff",
        logging: false,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const maxW = pageW - margin * 2;
      const drawH = maxW * (canvas.height / canvas.width);
      const offsetY = Math.max(margin, (pageH - drawH) / 2);
      pdf.addImage(imgData, "PNG", margin, offsetY, maxW, drawH);
      const custName = (bill.customer?.name || "Bill").replace(/\s+/g, "_");
      pdf.save(`${custName}.pdf`);
      toast.success("PDF saved!", { id: "pdf" });
    } catch {
      toast.error("PDF failed", { id: "pdf" });
    }
  };

  const handleWhatsApp = () => {
    const { name, mobile } = bill.customer;
    const amt = bill.total.toLocaleString("en-IN");
    const msg =
      lang === "mr"
        ? `नमस्कार ${name}\n\nश्री चिंतामणी इलेक्ट्रिकल्स\nदिनांक: ${dateStr}\nएकूण: रु. ${amt}\n १ वर्ष वॉरंटी & रु.८०० बदली शुल्क\nकृपया GPay / PhonePe वापरून पैसे द्या.\nUPI No: 9527370207\nधन्यवाद....`
        : `Dear ${name}\nShree Chintamani Electricals\nDate: ${dateStr}\nTotal: Rs. ${amt}\n\n 01 Year Warranty & Rs.800 Replacement Charges\nPlease Pay using Gpay/PhonePe\nUPI No: 9527370207\nThank you....`;
    window.open(`https://wa.me/91${mobile}?text=${encodeURIComponent(msg)}`);
  };

  const emptyRows = Math.max(0, 8 - bill.items.length);
  const fontFamily =
    lang === "mr"
      ? "'Noto Sans Devanagari','Mangal',sans-serif"
      : "'Inter','Segoe UI',sans-serif";

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-screen overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-800">
              Bill No: {bill.billNo} - {bill.customer.name}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Bill Date: {dateStr}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleWhatsApp}
              className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-600"
            >
              WhatsApp Message
            </button>
            <button
              onClick={handleDownloadPDF}
              className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-600"
            >
              Download PDF
            </button>
            <button
              onClick={onClose}
              className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-200"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Bill Preview */}
        <div className="p-4">
          <div
            ref={pdfRef}
            style={{
              fontFamily,
              fontSize: "12px",
              background: "#fff",
              border: "2.5px solid #1a1a1a",
              color: "#111",
            }}
          >
            {/* Header */}
            <div
              style={{
                borderBottom: "2px solid #1a1a1a",
                padding: "8px 12px 6px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "6px",
                }}
              >
                <span
                  style={{
                    border: "1.5px solid #444",
                    padding: "2px 7px",
                    fontSize: "10px",
                    fontWeight: "800",
                  }}
                >
                  {L.cashMemo}
                </span>
                <span
                  style={{
                    fontWeight: "700",
                    fontSize: "13px",
                    flex: 1,
                    textAlign: "center",
                    margin: "0 10px",
                  }}
                >
                  {L.tagline}
                </span>
                <div
                  style={{
                    textAlign: "right",
                    fontSize: "10px",
                    lineHeight: "1.6",
                  }}
                >
                  <div>Mob : 9527370207</div>
                  <div>9970780137</div>
                </div>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <img
                  src={motorRight}
                  alt="pumps"
                  style={{
                    height: "64px",
                    width: "64px",
                    objectFit: "contain",
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div
                    style={{
                      color: "#c0392b",
                      fontWeight: "900",
                      fontSize: lang === "en" ? "18px" : "15px",
                      lineHeight: "1.3",
                    }}
                  >
                    {L.company}
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#555",
                      marginTop: "3px",
                    }}
                  >
                    {L.subtext}
                  </div>
                  <div style={{ fontSize: "10px", color: "#555" }}>
                    {L.address}
                  </div>
                  <div
                    style={{
                      fontSize: "10.5px",
                      fontWeight: "700",
                      color: "#222",
                      marginTop: "2px",
                    }}
                  >
                    {L.propr}
                  </div>
                </div>
                <img
                  src={motorLeft}
                  alt="motor"
                  style={{
                    height: "64px",
                    width: "64px",
                    objectFit: "contain",
                    flexShrink: 0,
                  }}
                />
              </div>
            </div>
            {/* Customer */}
            <div
              style={{
                borderBottom: "1px solid #888",
                padding: "8px 12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "12px",
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "4px",
                  }}
                >
                  <span style={{ fontWeight: "700", fontSize: "12px" }}>
                    {L.shri}
                  </span>
                  <span style={{ fontWeight: "700", fontSize: "12px" }}>
                    {bill.customer.name}
                  </span>
                </div>
                {bill.customer.address && (
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#555",
                      marginLeft: "28px",
                      marginTop: "2px",
                    }}
                  >
                    {bill.customer.address}
                  </div>
                )}
                {bill.customer.mobile && (
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#666",
                      marginLeft: "28px",
                    }}
                  >
                    📱 {bill.customer.mobile}
                  </div>
                )}
              </div>
              <div
                style={{ textAlign: "right", flexShrink: 0, minWidth: "110px" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: "4px",
                  }}
                >
                  <span style={{ fontWeight: "700", fontSize: "10px" }}>
                    {L.billNo}
                  </span>
                  <span
                    style={{
                      fontWeight: "900",
                      fontSize: "24px",
                      lineHeight: 1,
                    }}
                  >
                    {bill.billNo}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: "4px",
                    marginTop: "3px",
                  }}
                >
                  <span style={{ fontWeight: "700", fontSize: "10px" }}>
                    {L.date}
                  </span>
                  <span style={{ fontSize: "11px", fontWeight: "600" }}>
                    {dateStr}
                  </span>
                </div>
              </div>
            </div>
            {/* Table */}
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "11.5px",
                tableLayout: "fixed",
              }}
            >
              <colgroup>
                <col style={{ width: "28px" }} />
                <col />
                <col style={{ width: "42px" }} />
                <col style={{ width: "54px" }} />
                <col style={{ width: "72px" }} />
              </colgroup>
              <thead>
                <tr
                  style={{
                    borderBottom: "2px solid #1a1a1a",
                    background: "#f5f5f5",
                  }}
                >
                  {[L.srNo, L.details, L.qty, L.rate, L.amount].map((h, i) => (
                    <th
                      key={i}
                      style={{
                        borderRight: i < 4 ? "1px solid #888" : "none",
                        padding: "5px 4px",
                        textAlign:
                          i === 1 ? "left" : i === 4 ? "right" : "center",
                        fontWeight: "700",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bill.items.map((item, idx) => (
                  <tr
                    key={idx}
                    style={{ borderBottom: "1px solid #ccc", height: "28px" }}
                  >
                    <td
                      style={{
                        borderRight: "1px solid #ccc",
                        textAlign: "center",
                        padding: "3px 2px",
                        verticalAlign: "middle",
                      }}
                    >
                      {idx + 1}
                    </td>
                    <td
                      style={{
                        borderRight: "1px solid #ccc",
                        padding: "3px 8px",
                        verticalAlign: "middle",
                      }}
                    >
                      {item.description}
                    </td>
                    <td
                      style={{
                        borderRight: "1px solid #ccc",
                        textAlign: "center",
                        padding: "3px 2px",
                        verticalAlign: "middle",
                      }}
                    >
                      {item.qty}
                    </td>
                    <td
                      style={{
                        borderRight: "1px solid #ccc",
                        textAlign: "right",
                        padding: "3px 6px",
                        verticalAlign: "middle",
                      }}
                    >
                      {item.rate?.toLocaleString("en-IN")}
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        padding: "3px 6px",
                        fontWeight: "700",
                        verticalAlign: "middle",
                      }}
                    >
                      {item.amount?.toLocaleString("en-IN")}/-
                    </td>
                  </tr>
                ))}
                {Array.from({ length: emptyRows }).map((_, i) => (
                  <tr
                    key={`e${i}`}
                    style={{ borderBottom: "1px solid #ddd", height: "28px" }}
                  >
                    <td style={{ borderRight: "1px solid #ddd" }}></td>
                    <td style={{ borderRight: "1px solid #ddd" }}></td>
                    <td style={{ borderRight: "1px solid #ddd" }}></td>
                    <td style={{ borderRight: "1px solid #ddd" }}></td>
                    <td></td>
                  </tr>
                ))}
                <tr style={{ borderTop: "2px solid #1a1a1a" }}>
                  <td
                    colSpan={3}
                    style={{
                      borderRight: "1px solid #888",
                      padding: "6px 8px",
                    }}
                  >
                    <div
                      style={{
                        border: "1px solid #999",
                        padding: "4px 8px",
                        display: "inline-block",
                        borderRadius: "3px",
                        fontSize: "10px",
                      }}
                    >
                      <div style={{ fontWeight: "700" }}>{L.warranty}</div>
                      <div>{L.replacement}</div>
                    </div>
                  </td>
                  <td
                    style={{
                      borderRight: "1px solid #888",
                      textAlign: "center",
                      fontWeight: "900",
                      fontSize: "13px",
                      color: "#c0392b",
                    }}
                  >
                    {L.total}
                  </td>
                  <td
                    style={{
                      textAlign: "right",
                      fontWeight: "900",
                      fontSize: "14px",
                      padding: "6px 6px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {bill.total?.toLocaleString("en-IN")}/-
                  </td>
                </tr>
              </tbody>
            </table>
            {/* Footer */}
            <div
              style={{
                borderTop: "1px solid #888",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                padding: "10px 14px 12px",
              }}
            >
              <div>
                <p
                  style={{
                    fontWeight: "700",
                    fontSize: "10.5px",
                    margin: "0 0 2px 0",
                  }}
                >
                  {L.custSign}
                </p>
                <div
                  style={{
                    width: "100px",
                    borderBottom: "1.5px solid #666",
                    marginTop: "28px",
                  }}
                ></div>
              </div>
              <div style={{ textAlign: "center" }}>
                <img
                  src={signImg}
                  alt="sig"
                  style={{
                    height: "42px",
                    objectFit: "contain",
                    display: "block",
                    margin: "0 auto 3px",
                  }}
                />
                <p
                  style={{
                    color: "#c0392b",
                    fontWeight: "700",
                    fontSize: "10px",
                    margin: 0,
                  }}
                >
                  {L.forSign}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AllBills() {
  const [bills, setBills] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState(null);
  const navigate = useNavigate();

  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/bills?search=${search}&limit=100`);
      setBills(res.data.bills);
    } catch {
      toast.error("Failed to load bills");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBills();
  }, [search]); // eslint-disable-line

  const handleDelete = async (id) => {
    if (
      !window.confirm("Delete this bill? Customer data will also be removed.")
    )
      return;
    try {
      await api.delete(`/bills/${id}`);
      toast.success("Bill deleted");
      fetchBills();
    } catch {
      toast.error("Delete failed");
    }
  };

  const warrantyStatus = (expiry) => {
    const now = new Date();
    const exp = new Date(expiry);
    const days = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
    const months = Math.round(days / 30.44);
    if (days <= 0)
      return { label: "Expired", color: "bg-red-100 text-red-700" };
    if (months <= 3)
      return {
        label: `${months}m left`,
        color: "bg-yellow-100 text-yellow-700",
      };
    return { label: `${months}m left`, color: "bg-green-100 text-green-700" };
  };

  return (
    <div>
      {selectedBill && (
        <BillPreviewModal
          bill={selectedBill}
          onClose={() => setSelectedBill(null)}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">All Bills</h1>
          <p className="text-gray-400 text-sm">{bills.length} bills total</p>
        </div>
        <button
          onClick={() => navigate("/bills/new")}
          className="bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition"
        >
          Add New Bill
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <input
          type="text"
          placeholder="Search by customer name or mobile..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 mb-5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />

        {loading ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-3xl mb-2"></div>Loading bills...
          </div>
        ) : bills.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-3xl mb-2"></div>No bills found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b text-xs uppercase tracking-wide">
                  <th className="pb-3 pr-4">Bill No.</th>
                  <th className="pb-3 pr-4">Customer Name</th>
                  <th className="pb-3 pr-4">Mobile No.</th>
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 pr-4">Total</th>
                  <th className="pb-3 pr-4">Warranty</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((bill) => {
                  const ws = warrantyStatus(bill.warrantyExpiry);
                  return (
                    <tr
                      key={bill._id}
                      className="border-b last:border-0 hover:bg-gray-50 transition"
                    >
                      <td className="py-3 pr-4">
                        <span className="font-black text-primary text-base">
                          {bill.billNo}
                        </span>
                      </td>
                      <td className="py-3 pr-4 font-semibold text-gray-800">
                        {bill.customer.name}
                      </td>
                      <td className="py-3 pr-4 text-gray-500">
                        {bill.customer.mobile}
                      </td>
                      <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">
                        {new Date(bill.date).toLocaleDateString("en-IN")}
                      </td>
                      <td className="py-3 pr-4 font-bold text-gray-800">
                        ₹{bill.total?.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${ws.color}`}
                        >
                          {ws.label}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-1.5 flex-wrap">
                          <button
                            onClick={() => setSelectedBill(bill)}
                            className="bg-blue-100 text-blue-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-200 transition"
                          >
                            View Bill
                          </button>
                          <button
                            onClick={() => {
                              const { name, mobile } = bill.customer;
                              const dateStr = new Date(
                                bill.date,
                              ).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              });
                              const msg = `Dear ${name}\n\nShree Chintamani Electricals\nDate: ${dateStr}\nTotal: Rs. ${bill.total?.toLocaleString("en-IN")}\nPlease Pay using Gpay/PhonePe\nUPI No: 9527370207\nThank you....`;
                              window.open(
                                `https://wa.me/91${mobile}?text=${encodeURIComponent(msg)}`,
                              );
                            }}
                            className="bg-green-100 text-green-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-200 transition"
                          >
                            WhatsApp
                          </button>
                          <button
                            onClick={() => handleDelete(bill._id)}
                            className="bg-red-100 text-red-600 px-2.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-200 transition"
                          >
                            Delete Bill
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
