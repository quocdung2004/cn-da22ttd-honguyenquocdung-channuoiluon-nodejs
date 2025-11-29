import { useEffect, useState, useMemo } from "react";
import axios from "axios";
// ⚠️ KHI CHẠY DỰ ÁN THẬT: Bỏ chú thích dòng dưới đây
import Layout from "../components/Layout"; 

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Đăng ký thành phần Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

export default function FinanceManager() {
  // --- API ---
  const API_INCOME = "http://localhost:5000/api/NhatKyThu";
  const API_SPENDING = "http://localhost:5000/api/NhatKyChi";
  const API_TANK = "http://localhost:5000/api/tank";
  
  // const token = localStorage.getItem("token"); 
  // Code tạm để chạy preview (nếu không có localStorage thực)
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem("token") : "";

  // --- State ---
  const [incomes, setIncomes] = useState([]);
  const [spendings, setSpendings] = useState([]);
  const [tanks, setTanks] = useState([]);
  const [loading, setLoading] = useState(false);

  // State quản lý View (Dashboard hoặc Xem chi tiết)
  const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard' | 'detail'
  const [detailData, setDetailData] = useState(null); // Dữ liệu của đối tượng đang xem chi tiết

  // --- Helpers ---
  const formatCurrency = (amount) => amount?.toLocaleString('vi-VN') + ' VND';
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('vi-VN');

  // --- Fetch Data ---
  const fetchData = async () => {
    // Dữ liệu mẫu giả lập cho Preview nếu không có token/API
    if (!token) {
        setIncomes([
            { _id: '1', tankId: 't1', source: 'Bán lươn đợt 1', totalIncome: 50000000, date: '2023-10-01' },
            { _id: '2', tankId: null, source: 'Thanh lý máy bơm cũ', totalIncome: 2000000, date: '2023-10-05' }
        ]);
        setSpendings([
            { _id: '1', tankId: 't1', reason: 'Mua cám', totalCost: 12000000, date: '2023-09-01' },
            { _id: '2', tankId: 't2', reason: 'Thuốc trị bệnh', totalCost: 500000, date: '2023-09-10' },
            { _id: '3', tankId: null, reason: 'Tiền điện tháng 9', totalCost: 3000000, date: '2023-09-30' }
        ]);
        setTanks([
            { _id: 't1', name: 'Bể số 1 (Lươn)' },
            { _id: 't2', name: 'Bể số 2 (Cá)' }
        ]);
        return;
    }

    try {
      setLoading(true);
      const [resInc, resSpd, resTank] = await Promise.all([
        axios.get(API_INCOME, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(API_SPENDING, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(API_TANK, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setIncomes(resInc.data);
      setSpendings(resSpd.data);
      setTanks(resTank.data);
    } catch (err) {
      console.error("Lỗi tải dữ liệu tài chính:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- LOGIC TỔNG HỢP DỮ LIỆU ---
  const { 
    totalRevenue, 
    totalCost, 
    netProfit, 
    reportByTank, 
    reportGeneral, 
    chartData 
  } = useMemo(() => {
    let revenue = 0;
    let cost = 0;
    
    // 1. Khởi tạo báo cáo theo bể
    const reportMap = {}; 
    tanks.forEach(t => {
      reportMap[t._id] = { 
        id: t._id, 
        name: t.name, 
        revenue: 0, 
        cost: 0, 
        history: [] 
      };
    });

    // 2. Khởi tạo báo cáo chung
    const general = { 
      id: 'general', 
      name: 'Hoạt động chung (Điện/Nước/Khác)', 
      revenue: 0, 
      cost: 0, 
      history: [] 
    };

    // 3. Xử lý Thu
    incomes.forEach(inc => {
      revenue += inc.totalIncome;
      const transaction = {
        date: inc.date,
        type: 'thu',
        description: inc.source,
        amount: inc.totalIncome,
        note: inc.note
      };

      const tId = typeof inc.tankId === 'object' && inc.tankId !== null ? inc.tankId._id : inc.tankId;

      if (tId && reportMap[tId]) {
        reportMap[tId].revenue += inc.totalIncome;
        reportMap[tId].history.push(transaction);
      } else {
        general.revenue += inc.totalIncome;
        general.history.push(transaction);
      }
    });

    // 4. Xử lý Chi
    spendings.forEach(spd => {
      cost += spd.totalCost;
      const transaction = {
        date: spd.date,
        type: 'chi',
        description: spd.reason,
        amount: spd.totalCost,
        note: spd.note
      };

      const tId = typeof spd.tankId === 'object' && spd.tankId !== null ? spd.tankId._id : spd.tankId;

      if (tId && reportMap[tId]) {
        reportMap[tId].cost += spd.totalCost;
        reportMap[tId].history.push(transaction);
      } else {
        general.cost += spd.totalCost;
        general.history.push(transaction);
      }
    });

    // 5. Sắp xếp lịch sử
    Object.values(reportMap).forEach(item => {
        item.history.sort((a, b) => new Date(b.date) - new Date(a.date));
    });
    general.history.sort((a, b) => new Date(b.date) - new Date(a.date));

    // 6. Dữ liệu biểu đồ
    const dataChart = {
      labels: ['Tổng Thu', 'Tổng Chi'],
      datasets: [{
        data: [revenue, cost],
        backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(239, 68, 68, 0.8)'],
        borderColor: ['rgba(34, 197, 94, 1)', 'rgba(239, 68, 68, 1)'],
        borderWidth: 1,
      }],
    };

    return {
      totalRevenue: revenue,
      totalCost: cost,
      netProfit: revenue - cost,
      reportByTank: reportMap,
      reportGeneral: general,
      chartData: dataChart
    };
  }, [incomes, spendings, tanks]);

  // --- Handlers ---
  const handleViewDetail = (data) => {
    setDetailData(data);
    setViewMode('detail');
  };

  const handleBack = () => {
    setViewMode('dashboard');
    setDetailData(null);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: 'Tỷ lệ Thu/Chi Toàn Trại', font: { size: 16 } }
    },
  };

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-blue-600 mb-6">
            {viewMode === 'dashboard' ? 'Tổng Quan Tài Chính' : `Chi Tiết: ${detailData?.name}`}
        </h1>

        {loading ? (
          <p className="text-center text-gray-500">Đang tổng hợp dữ liệu...</p>
        ) : (
          <>
            {/* ================= DASHBOARD VIEW ================= */}
            {viewMode === 'dashboard' && (
              <div className="space-y-8">
                
                {/* 1. Cards Tổng quan */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-green-50 p-5 rounded-xl shadow-sm border-l-4 border-green-500">
                    <p className="text-green-800 font-medium">Tổng Doanh Thu</p>
                    <h2 className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</h2>
                  </div>
                  <div className="bg-red-50 p-5 rounded-xl shadow-sm border-l-4 border-red-500">
                    <p className="text-red-800 font-medium">Tổng Chi Phí</p>
                    <h2 className="text-2xl font-bold text-red-600">{formatCurrency(totalCost)}</h2>
                  </div>
                  <div className={`p-5 rounded-xl shadow-sm border-l-4 ${netProfit >= 0 ? 'bg-blue-50 border-blue-500' : 'bg-yellow-50 border-yellow-500'}`}>
                    <p className="text-gray-800 font-medium">Lợi Nhuận Ròng</p>
                    <h2 className={`text-2xl font-bold ${netProfit >= 0 ? 'text-blue-600' : 'text-yellow-600'}`}>
                      {formatCurrency(Math.abs(netProfit))} {netProfit >= 0 ? '(Lãi)' : '(Lỗ)'}
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* 2. Biểu đồ */}
                    <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg flex items-center justify-center h-80">
                        {totalRevenue > 0 || totalCost > 0 ? (
                            <div className="w-full h-full">
                                <Doughnut data={chartData} options={chartOptions} />
                            </div>
                        ) : (
                            <p className="text-gray-400 italic">Chưa có dữ liệu.</p>
                        )}
                    </div>

                    {/* 3. Danh sách Báo cáo chi tiết */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* A. Chi phí chung */}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="bg-gray-100 px-4 py-3 border-b flex justify-between items-center">
                                <h3 className="font-bold text-gray-700">🏢 Hoạt động chung</h3>
                                <button 
                                    onClick={() => handleViewDetail(reportGeneral)}
                                    className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                                >
                                    Xem lịch sử
                                </button>
                            </div>
                            <div className="p-4 grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="text-xs text-gray-500">Thu</p>
                                    <p className="font-bold text-green-600">{formatCurrency(reportGeneral.revenue)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Chi</p>
                                    <p className="font-bold text-red-600">{formatCurrency(reportGeneral.cost)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Cân đối</p>
                                    <p className={`font-bold ${reportGeneral.revenue - reportGeneral.cost >= 0 ? 'text-blue-600' : 'text-yellow-600'}`}>
                                        {formatCurrency(reportGeneral.revenue - reportGeneral.cost)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* B. Danh sách Bể Nuôi */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">🐟 Hiệu quả từng Bể nuôi</h3>
                            <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-2">
                                {Object.values(reportByTank).map(tank => {
                                    const net = tank.revenue - tank.cost;
                                    const borderColor = net >= 0 ? '#3b82f6' : '#d97706';
                                    const cardBgColor = net >= 0 ? 'bg-blue-50' : 'bg-yellow-50';

                                    return (
                                        <div 
                                            key={tank.id} 
                                            className={`p-3 rounded-lg shadow-sm border-l-4 ${cardBgColor}`}
                                            style={{ borderColor: borderColor }}
                                        >
                                            <div className="flex justify-between items-start mb-2 border-b border-gray-200 pb-2">
                                                <h4 className="font-bold text-lg text-gray-800">{tank.name}</h4>
                                                <button 
                                                    onClick={() => handleViewDetail(tank)}
                                                    className="text-xs bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-100 transition"
                                                >
                                                    Chi tiết
                                                </button>
                                            </div>
                                            
                                            <div className="space-y-1 text-sm">
                                                <p className="flex justify-between items-center text-gray-700">
                                                    <span className="font-medium">💰 Thu:</span> 
                                                    <span className="font-bold text-green-600">{formatCurrency(tank.revenue)}</span>
                                                </p>
                                                <p className="flex justify-between items-center text-gray-700">
                                                    <span className="font-medium">💸 Chi:</span> 
                                                    <span className="font-bold text-red-600">{formatCurrency(tank.cost)}</span>
                                                </p>
                                                <p className="flex justify-between items-center pt-1 mt-1 border-t border-gray-300">
                                                    <span className="font-normal text-gray-700">Lãi/Lỗ Ròng:</span>
                                                    <span className={`font-bold ${net >= 0 ? 'text-blue-600' : 'text-yellow-700'}`}>
                                                        {formatCurrency(Math.abs(net))} {net >= 0 ? '(Lãi)' : '(Lỗ)'}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                {Object.keys(reportByTank).length === 0 && <p className="text-gray-500 text-center">Chưa có bể nuôi nào.</p>}
                            </div>
                        </div>

                    </div>
                </div>
              </div>
            )}

            {/* ================= DETAIL VIEW ================= */}
            {viewMode === 'detail' && detailData && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">{detailData.name}</h2>
                            <div className="flex gap-4 mt-2 text-sm">
                                <span className="text-green-600 font-bold">Tổng Thu: {formatCurrency(detailData.revenue)}</span>
                                <span className="text-red-600 font-bold">Tổng Chi: {formatCurrency(detailData.cost)}</span>
                                <span className={`font-bold ${detailData.revenue - detailData.cost >= 0 ? 'text-blue-600' : 'text-yellow-600'}`}>
                                    Kết quả: {formatCurrency(detailData.revenue - detailData.cost)}
                                </span>
                            </div>
                        </div>
                        <button 
                            onClick={handleBack}
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                        >
                            ← Quay lại
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                                    <th className="py-3 px-4 text-center">Ngày</th>
                                    <th className="py-3 px-4 text-center">Loại</th>
                                    <th className="py-3 px-4">Nội dung / Nguồn</th>
                                    <th className="py-3 px-4 text-right">Số tiền</th>
                                    <th className="py-3 px-4">Ghi chú</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-700 text-sm">
                                {detailData.history.map((item, index) => (
                                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="py-3 px-4 text-center whitespace-nowrap">{formatDate(item.date)}</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                item.type === 'thu' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                                {item.type === 'thu' ? 'THU' : 'CHI'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 font-medium">{item.description}</td>
                                        <td className={`py-3 px-4 text-right font-bold ${
                                            item.type === 'thu' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {item.type === 'thu' ? '+' : '-'}{formatCurrency(item.amount)}
                                        </td>
                                        <td className="py-3 px-4 text-gray-500 italic max-w-xs truncate" title={item.note}>{item.note || '-'}</td>
                                    </tr>
                                ))}
                                {detailData.history.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4 text-gray-500">Chưa có giao dịch nào.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

