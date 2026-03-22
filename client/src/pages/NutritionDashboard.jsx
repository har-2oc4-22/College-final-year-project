import { useState, useEffect } from 'react';
import { getNutritionDashboard } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7'];

const NutritionDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getNutritionDashboard();
        setData(res.data);
      } catch (err) {
        if (err.response?.status === 401) {
          toast.error('Please log in to see your nutrition dashboard.');
        } else {
          toast.error('Failed to load nutrition data. Place some orders first!');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-20 flex justify-center">
      <div className="w-12 h-12 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
    </div>
  );

  const scoreColor = data?.nutritionScore >= 80 ? 'text-green-400' : data?.nutritionScore >= 60 ? 'text-yellow-400' : 'text-red-400';

  const macros = data ? [
    { name: 'Protein', value: data.totals.protein, color: '#3b82f6', icon: '💪', unit: 'g' },
    { name: 'Carbs', value: data.totals.carbs, color: '#f59e0b', icon: '🌾', unit: 'g' },
    { name: 'Fat', value: data.totals.fat, color: '#ef4444', icon: '🥑', unit: 'g' },
    { name: 'Fiber', value: data.totals.fiber, color: '#22c55e', icon: '🥦', unit: 'g' },
  ] : [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-10 animate-fadeInUp">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500 mb-4 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
          <span className="text-4xl">📊</span>
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-3">Nutrition Dashboard</h1>
        <p className="text-gray-400">Insights from your last {data?.ordersAnalyzed || 0} orders</p>
      </div>

      {!data || data.ordersAnalyzed === 0 ? (
        <div className="text-center py-24 card p-12">
          <div className="text-6xl mb-6">📦</div>
          <h2 className="text-xl font-bold text-white mb-3">No Orders Yet</h2>
          <p className="text-gray-400">Place some orders to see your personalized nutrition breakdown!</p>
        </div>
      ) : (
        <>
          {/* Score + Advice Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Health Score */}
            <div className="card p-6 animate-fadeInUp flex flex-col items-center justify-center text-center">
              <p className="text-gray-400 text-sm uppercase tracking-widest mb-2">Health Score</p>
              <div className={`text-7xl font-extrabold ${scoreColor} mb-2`}>{data.nutritionScore}</div>
              <div className="text-gray-500 text-sm">/100</div>
              <div className="w-full mt-4 bg-gray-800 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-1000 ${data.nutritionScore >= 80 ? 'bg-green-500' : data.nutritionScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${data.nutritionScore}%` }}
                />
              </div>
            </div>

            {/* Calories Big Card */}
            <div className="card p-6 animate-fadeInUp flex flex-col items-center justify-center text-center border-orange-500/20">
              <span className="text-4xl mb-2">🔥</span>
              <p className="text-gray-400 text-sm uppercase tracking-widest mb-1">Total Calories</p>
              <p className="text-5xl font-extrabold text-orange-400">{(data.totals.calories).toLocaleString()}</p>
              <p className="text-gray-500 text-xs mt-1">from last {data.ordersAnalyzed} orders</p>
            </div>

            {/* Advice Card */}
            <div className="card p-6 animate-fadeInUp border-primary-500/20">
              <p className="text-gray-400 text-sm uppercase tracking-widest mb-3">AI Advice</p>
              <p className="text-white text-base leading-relaxed">{data.advice}</p>
            </div>
          </div>

          {/* Macros Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {macros.map(macro => (
              <div key={macro.name} className="card p-5 animate-fadeInUp text-center hover:scale-105 transition-transform">
                <div className="text-3xl mb-2">{macro.icon}</div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">{macro.name}</p>
                <p className="font-extrabold text-2xl" style={{ color: macro.color }}>
                  {macro.value}<span className="text-xs text-gray-500 font-normal">{macro.unit}</span>
                </p>
              </div>
            ))}
          </div>

          {/* Category Pie Chart */}
          {data.categoryBreakdown?.length > 0 && (
            <div className="card p-6 animate-fadeInUp">
              <h3 className="font-bold text-white text-lg mb-6">🥗 Shopping Category Breakdown</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="count"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {data.categoryBreakdown.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '10px' }}
                      labelStyle={{ color: '#f9fafb' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NutritionDashboard;
