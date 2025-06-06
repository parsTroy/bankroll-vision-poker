import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, MapPin, Trophy } from 'lucide-react';
import { Session, BankrollData } from '@/pages/Index';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface AnalyticsProps {
  sessions: Session[];
  bankroll: BankrollData;
  onBack: () => void;
}

const Analytics = ({ sessions, bankroll, onBack }: AnalyticsProps) => {
  // Calculate analytics
  const totalProfit = sessions.reduce((sum, session) => sum + session.profit, 0);
  const totalBuyIns = sessions.reduce((sum, session) => sum + session.buyIn, 0);
  const winRate = sessions.length > 0 ? (sessions.filter(s => s.profit > 0).length / sessions.length) * 100 : 0;
  
  // Prepare chart data
  const sessionsByDate = [...sessions]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((session, index) => {
      const runningTotal = sessions
        .slice()
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, index + 1)
        .reduce((sum, s) => sum + s.profit, 0);
      
      return {
        date: new Date(session.date).toLocaleDateString(),
        profit: session.profit,
        runningTotal,
        shortDate: new Date(session.date).getMonth() + 1 + '/' + new Date(session.date).getDate()
      };
    });

  // Win/Loss data for pie chart
  const winLossData = [
    { name: 'Wins', value: sessions.filter(s => s.profit > 0).length, color: '#10b981' },
    { name: 'Losses', value: sessions.filter(s => s.profit < 0).length, color: '#ef4444' },
    { name: 'Break Even', value: sessions.filter(s => s.profit === 0).length, color: '#6b7280' }
  ].filter(item => item.value > 0);

  // Monthly profit data
  const monthlyData = sessions.reduce((acc, session) => {
    const month = new Date(session.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    if (!acc[month]) {
      acc[month] = { month, profit: 0, sessions: 0 };
    }
    acc[month].profit += session.profit;
    acc[month].sessions += 1;
    return acc;
  }, {} as Record<string, { month: string; profit: number; sessions: number }>);

  const monthlyChartData = Object.values(monthlyData)
    .sort((a, b) => new Date('01 ' + a.month).getTime() - new Date('01 ' + b.month).getTime());

  // Game type chart data
  const gameTypeChartData = Object.values(sessions.reduce((acc, session) => {
    const key = `${session.gameType}_${session.stakes}`;
    if (!acc[key]) {
      acc[key] = { 
        name: session.stakes,
        gameType: session.gameType === 'cash' ? 'Cash' : 'Tournament',
        profit: 0, 
        sessions: 0 
      };
    }
    acc[key].profit += session.profit;
    acc[key].sessions += 1;
    return acc;
  }, {} as Record<string, { name: string; gameType: string; profit: number; sessions: number }>))
  .sort((a, b) => b.profit - a.profit);

  // Profit by location
  const locationStats = sessions.reduce((acc, session) => {
    if (!acc[session.location]) {
      acc[session.location] = { profit: 0, sessions: 0 };
    }
    acc[session.location].profit += session.profit;
    acc[session.location].sessions += 1;
    return acc;
  }, {} as Record<string, { profit: number; sessions: number }>);

  // Profit by game type
  const gameTypeStats = sessions.reduce((acc, session) => {
    const key = `${session.gameType}_${session.stakes}`;
    if (!acc[key]) {
      acc[key] = { profit: 0, sessions: 0, gameType: session.gameType, stakes: session.stakes };
    }
    acc[key].profit += session.profit;
    acc[key].sessions += 1;
    return acc;
  }, {} as Record<string, { profit: number; sessions: number; gameType: string; stakes: string }>);

  const bestLocation = Object.entries(locationStats)
    .sort(([,a], [,b]) => b.profit - a.profit)[0];
  
  const bestGameType = Object.values(gameTypeStats)
    .sort((a, b) => b.profit - a.profit)[0];

  const avgSession = sessions.length > 0 ? totalProfit / sessions.length : 0;

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-700 p-2 rounded border border-slate-600 text-white text-sm">
          <p className="text-slate-300">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: ${entry.value?.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6 pt-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-slate-400 hover:text-white p-2 mr-3"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
        </div>

        <div className="space-y-6">
          {/* Overview Stats */}
          <Card className="p-6 bg-slate-800 border-slate-700">
            <h2 className="text-lg font-semibold text-white mb-4">Overview</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{sessions.length}</div>
                <div className="text-sm text-slate-400">Total Sessions</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                  {winRate.toFixed(0)}%
                </div>
                <div className="text-sm text-slate-400">Win Rate</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {totalProfit >= 0 ? '+' : ''}${totalProfit.toLocaleString()}
                </div>
                <div className="text-sm text-slate-400">Total Profit</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${avgSession >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {avgSession >= 0 ? '+' : ''}${avgSession.toFixed(0)}
                </div>
                <div className="text-sm text-slate-400">Avg Session</div>
              </div>
            </div>
          </Card>

          {/* Profit Over Time Chart */}
          {sessions.length > 1 && (
            <Card className="p-6 bg-slate-800 border-slate-700">
              <h2 className="text-lg font-semibold text-white mb-4">Profit Over Time</h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sessionsByDate}>
                    <XAxis 
                      dataKey="shortDate" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#94a3b8' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#94a3b8' }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="runningTotal" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {/* Win/Loss Distribution */}
          {sessions.length > 0 && (
            <Card className="p-6 bg-slate-800 border-slate-700">
              <h2 className="text-lg font-semibold text-white mb-4">Win/Loss Distribution</h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={winLossData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={false}
                      fontSize={12}
                      fill="#8884d8"
                    >
                      {winLossData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#374151', 
                        border: '1px solid #4b5563',
                        borderRadius: '6px',
                        color: 'white'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {/* Monthly Performance */}
          {monthlyChartData.length > 1 && (
            <Card className="p-6 bg-slate-800 border-slate-700">
              <h2 className="text-lg font-semibold text-white mb-4">Monthly Performance</h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyChartData}>
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#94a3b8' }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#94a3b8' }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="profit" 
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {/* Game Type Performance */}
          {gameTypeChartData.length > 1 && (
            <Card className="p-6 bg-slate-800 border-slate-700">
              <h2 className="text-lg font-semibold text-white mb-4">Performance by Game Type</h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gameTypeChartData} layout="horizontal">
                    <XAxis 
                      type="number"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#94a3b8' }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <YAxis 
                      type="category"
                      dataKey="name" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#94a3b8' }}
                      width={60}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="profit" 
                      fill="#ef4444"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {/* Best Performers */}
          {bestLocation && (
            <Card className="p-6 bg-slate-800 border-slate-700">
              <h2 className="text-lg font-semibold text-white mb-4">Best Location</h2>
              <div className="flex items-center space-x-3">
                <MapPin className="h-8 w-8 text-blue-400" />
                <div className="flex-1">
                  <div className="text-white font-medium">{bestLocation[0]}</div>
                  <div className="text-sm text-slate-400">
                    {bestLocation[1].sessions} sessions
                  </div>
                </div>
                <div className={`text-right ${bestLocation[1].profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  <div className="font-bold">
                    {bestLocation[1].profit >= 0 ? '+' : ''}${bestLocation[1].profit.toLocaleString()}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {bestGameType && (
            <Card className="p-6 bg-slate-800 border-slate-700">
              <h2 className="text-lg font-semibold text-white mb-4">Best Game Type</h2>
              <div className="flex items-center space-x-3">
                <Trophy className="h-8 w-8 text-yellow-400" />
                <div className="flex-1">
                  <div className="text-white font-medium">{bestGameType.stakes}</div>
                  <div className="text-sm text-slate-400">
                    {bestGameType.gameType === 'cash' ? 'Cash Game' : 'Tournament'} • {bestGameType.sessions} sessions
                  </div>
                </div>
                <div className={`text-right ${bestGameType.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  <div className="font-bold">
                    {bestGameType.profit >= 0 ? '+' : ''}${bestGameType.profit.toLocaleString()}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Location Breakdown */}
          {Object.keys(locationStats).length > 1 && (
            <Card className="p-6 bg-slate-800 border-slate-700">
              <h2 className="text-lg font-semibold text-white mb-4">By Location</h2>
              <div className="space-y-3">
                {Object.entries(locationStats)
                  .sort(([,a], [,b]) => b.profit - a.profit)
                  .map(([location, stats]) => (
                    <div key={location} className="flex justify-between items-center p-3 bg-slate-700 rounded">
                      <div>
                        <div className="text-white font-medium">{location}</div>
                        <div className="text-sm text-slate-400">{stats.sessions} sessions</div>
                      </div>
                      <div className={`font-bold ${stats.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {stats.profit >= 0 ? '+' : ''}${stats.profit.toLocaleString()}
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
          )}

          {/* Game Type Breakdown */}
          {Object.keys(gameTypeStats).length > 1 && (
            <Card className="p-6 bg-slate-800 border-slate-700">
              <h2 className="text-lg font-semibold text-white mb-4">By Game Type</h2>
              <div className="space-y-3">
                {Object.values(gameTypeStats)
                  .sort((a, b) => b.profit - a.profit)
                  .map((stats, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-slate-700 rounded">
                      <div>
                        <div className="text-white font-medium">{stats.stakes}</div>
                        <div className="text-sm text-slate-400">
                          {stats.gameType === 'cash' ? 'Cash' : 'Tournament'} • {stats.sessions} sessions
                        </div>
                      </div>
                      <div className={`font-bold ${stats.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {stats.profit >= 0 ? '+' : ''}${stats.profit.toLocaleString()}
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
