import { useEffect, useState } from 'react';
import api from '../utils/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentBills, setRecentBills] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, billsRes] = await Promise.all([
          api.get('/bills/analytics'),
          api.get('/bills?limit=5'),
        ]);
        setStats(analyticsRes.data.overall);
        setRecentBills(billsRes.data.bills);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const cards = [
    { label: 'Total Bills', value: stats?.totalBills || 0, icon: '🧾', color: 'bg-blue-50 border-blue-200' },
    { label: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: '💰', color: 'bg-green-50 border-green-200' },
    { label: 'Total Profit', value: `₹${(stats?.totalProfit || 0).toLocaleString()}`, icon: '📈', color: 'bg-purple-50 border-purple-200' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm">Welcome back, Sagar 👋</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className={`${card.color} border rounded-xl p-5`}>
            <div className="text-3xl mb-2">{card.icon}</div>
            <div className="text-2xl font-bold text-gray-800">{card.value}</div>
            <div className="text-sm text-gray-500 mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Bills */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Bills</h2>
        {recentBills.length === 0 ? (
          <p className="text-gray-400 text-sm">No bills yet. Create your first bill!</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Bill No.</th>
                <th className="pb-2">Customer</th>
                <th className="pb-2">Date</th>
                <th className="pb-2">Total</th>
                <th className="pb-2">Warranty</th>
              </tr>
            </thead>
            <tbody>
              {recentBills.map((bill) => (
                <tr key={bill._id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 font-bold text-primary">#{bill.billNo}</td>
                  <td className="py-3">{bill.customer.name}</td>
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}