import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function AllBills() {
  const [bills, setBills] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchBills = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/bills?search=${search}`);
      setBills(res.data.bills);
    } catch (err) {
      toast.error('Failed to load bills');
    }
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchBills(); }, [fetchBills]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this bill?')) return;
    try {
      await api.delete(`/bills/${id}`);
      toast.success('Bill deleted');
      fetchBills();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleWhatsApp = (bill) => {
    const msg = `Dear ${bill.customer.name}, your bill #${bill.billNo} from Shree Chintamani Electricals is ready. Total: Rs.${bill.total}. Warranty valid till: ${new Date(bill.warrantyExpiry).toLocaleDateString('en-IN')}. Contact: 9527370207`;
    window.open(`https://wa.me/91${bill.customer.mobile}?text=${encodeURIComponent(msg)}`);
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">All Bills</h1>
          <p className="text-gray-500 text-sm">{bills.length} bills found</p>
        </div>
        <button
          onClick={() => navigate('/bills/new')}
          className="bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-800 transition text-sm w-full sm:w-auto"
        >
          ➕ New Bill
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
        <input
          type="text"
          placeholder="🔍 Search by customer name or mobile..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 mb-5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />

        {loading ? (
          <p className="text-center text-gray-400 py-8">Loading...</p>
        ) : bills.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No bills found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-3">Bill No.</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Mobile</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Warranty</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((bill) => (
                  <tr key={bill._id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 font-bold text-primary">#{bill.billNo}</td>
                    <td className="py-3 font-medium">{bill.customer.name}</td>
                    <td className="py-3 text-gray-500">{bill.customer.mobile}</td>
                    <td className="py-3">{new Date(bill.date).toLocaleDateString('en-IN')}</td>
                    <td className="py-3 font-semibold">₹{bill.total.toLocaleString()}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        new Date(bill.warrantyExpiry) > new Date()
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {new Date(bill.warrantyExpiry) > new Date() ? '✅ Active' : '❌ Expired'}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleWhatsApp(bill)}
                          className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                        >
                          📱 WA
                        </button>
                        <button
                          onClick={() => handleDelete(bill._id)}
                          className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs hover:bg-red-200"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}