
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, MapPin, Trophy } from 'lucide-react';
import { Session, BankrollData } from '@/pages/Index';

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
