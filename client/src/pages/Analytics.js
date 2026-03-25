import { useEffect, useState } from 'react';
import api from '../utils/api';

const MONTHS = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function Analytics() {
  const [data, setData] = useState({ monthly: [], overall: null });

  useEffect(() => {
    api.get('/bills/analytics').then(res => setData(res.data)).catch(console.error);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Analytics & Profit</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <div className="text-3xl mb-2">💰</div>
          <div className="text-2xl font-bold text-gray-800">₹{(data.overall?.totalRevenue || 0).toLocaleString()}</div>
          <div className="text-sm text-gray-500">Total Revenue</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
          <div className="text-3xl mb-2">📈</div>
          <div className="text-2xl font-bold text-gray-800">₹{(data.overall?.totalProfit || 0).toLocaleString()}</div>
          <div className="text-sm text-gray-500">Total Profit</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <div className="text-3xl mb-2">🧾</div>
          <div className="text-2xl font-bold text-gray-800">{data.overall?.totalBills || 0}</div>
          <div className="text-sm text-gray-500">Total Bills</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
        <h2 className="font-bold text-gray-800 mb-4">Monthly Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2">Month</th>
                <th className="pb-2">Bills</th>
                <th className="pb-2">Revenue</th>
                <th className="pb-2">Profit</th>
              </tr>
            </thead>
            <tbody>
              {data.monthly.map((m) => (
                <tr key={`${m._id.year}-${m._id.month}`} className="border-b last:border-0">
                  <td className="py-3 font-medium">{MONTHS[m._id.month]} {m._id.year}</td>
                  <td className="py-3">{m.totalBills}</td>
                  <td className="py-3 text-green-600 font-semibold">₹{m.totalRevenue.toLocaleString()}</td>
                  <td className="py-3 text-purple-600 font-semibold">₹{m.totalProfit.toLocaleString()}</td>
                </tr>
              ))}
              {data.monthly.length === 0 && (
                <tr><td colSpan="4" className="text-center py-6 text-gray-400">No data yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}