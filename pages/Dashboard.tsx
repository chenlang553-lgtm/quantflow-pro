import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Wallet, TrendingUp, TrendingDown, Clock, AlertTriangle } from 'lucide-react';
import { getAccountBalance, getPositions } from '../services/api';
import { AccountBalance, Position } from '../types';

// 格式化货币
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(value);
};

// 模拟 PnL 数据
const pnlData = [
  { name: '00:00', uv: 1200 },
  { name: '04:00', uv: 1350 },
  { name: '08:00', uv: 1100 },
  { name: '12:00', uv: 1580 },
  { name: '16:00', uv: 1420 },
  { name: '20:00', uv: 1600 },
  { name: '24:00', uv: 1850 },
];

const Dashboard: React.FC = () => {
  const [balance, setBalance] = useState<AccountBalance | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [balData, posData] = await Promise.all([
          getAccountBalance(),
          getPositions()
        ]);
        setBalance(balData);
        setPositions(posData);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center text-gray-500 mt-20">正在加载账户数据...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white mb-6">概览监控</h1>

      {/* Asset Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-850 p-6 rounded-xl border border-gray-750 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 text-sm">账户总权益 (USDT)</span>
            <Wallet className="text-primary-500" size={20} />
          </div>
          <div className="text-2xl font-bold text-white">{formatCurrency(balance?.totalWalletBalance || 0)}</div>
        </div>

        <div className="bg-gray-850 p-6 rounded-xl border border-gray-750 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 text-sm">未实现盈亏</span>
            <TrendingUp className={balance && balance.unrealizedPNL >= 0 ? "text-green-500" : "text-red-500"} size={20} />
          </div>
          <div className={`text-2xl font-bold ${balance && balance.unrealizedPNL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {balance && balance.unrealizedPNL > 0 ? '+' : ''}{formatCurrency(balance?.unrealizedPNL || 0)}
          </div>
        </div>

        <div className="bg-gray-850 p-6 rounded-xl border border-gray-750 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 text-sm">保证金余额</span>
            <AlertTriangle className="text-yellow-500" size={20} />
          </div>
          <div className="text-2xl font-bold text-white">{formatCurrency(balance?.marginBalance || 0)}</div>
        </div>

        <div className="bg-gray-850 p-6 rounded-xl border border-gray-750 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 text-sm">可用余额</span>
            <Clock className="text-purple-500" size={20} />
          </div>
          <div className="text-2xl font-bold text-white">{formatCurrency(balance?.availableBalance || 0)}</div>
        </div>
      </div>

      {/* Charts & Positions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-gray-850 p-6 rounded-xl border border-gray-750">
          <h2 className="text-lg font-bold text-white mb-6">24H 收益曲线</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pnlData}>
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" tick={{fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Area type="monotone" dataKey="uv" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorUv)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Positions Table (Compact) */}
        <div className="lg:col-span-3 bg-gray-850 p-6 rounded-xl border border-gray-750 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">当前持仓</h2>
            <span className="text-xs text-gray-500">数据延迟约 500ms</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-sm border-b border-gray-750">
                  <th className="pb-3 pl-2">合约</th>
                  <th className="pb-3">方向/杠杆</th>
                  <th className="pb-3">持仓量</th>
                  <th className="pb-3">开仓价</th>
                  <th className="pb-3">标记价</th>
                  <th className="pb-3">强平价</th>
                  <th className="pb-3 text-right pr-2">未实现盈亏 (ROE)</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {positions.length === 0 ? (
                    <tr>
                        <td colSpan={7} className="text-center py-8 text-gray-500">无活动持仓</td>
                    </tr>
                ) : positions.map((pos) => (
                  <tr key={pos.symbol} className="border-b border-gray-750/50 hover:bg-gray-800 transition-colors last:border-0">
                    <td className="py-4 pl-2 font-medium text-white">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        <span>{pos.symbol}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${pos.positionSide === 'LONG' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                        {pos.positionSide === 'LONG' ? '做多' : '做空'}
                      </span>
                      <span className="ml-2 text-gray-400 text-xs">x{pos.leverage}</span>
                    </td>
                    <td className="py-4 text-gray-300">{pos.amount}</td>
                    <td className="py-4 text-gray-300">${pos.entryPrice.toLocaleString()}</td>
                    <td className="py-4 text-gray-300">${pos.markPrice.toLocaleString()}</td>
                    <td className="py-4 text-orange-400">${pos.liquidationPrice.toLocaleString()}</td>
                    <td className="py-4 text-right pr-2">
                      <div className={`font-bold ${pos.unrealizedPNL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {pos.unrealizedPNL >= 0 ? '+' : ''}{pos.unrealizedPNL.toFixed(2)} USDT
                      </div>
                      <div className={`text-xs ${pos.roe >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        ({pos.roe >= 0 ? '+' : ''}{pos.roe.toFixed(2)}%)
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
