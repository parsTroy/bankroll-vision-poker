
import { Card } from '@/components/ui/card';
import { Session } from '@/pages/Index';
import { Calendar, MapPin, TrendingUp, TrendingDown } from 'lucide-react';

interface SessionListProps {
  sessions: Session[];
}

const SessionList = ({ sessions }: SessionListProps) => {
  if (sessions.length === 0) {
    return (
      <Card className="p-6 bg-slate-800 border-slate-700">
        <div className="text-center text-slate-400">
          <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No sessions yet. Add your first session to start tracking!</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-slate-800 border-slate-700">
      <h3 className="text-lg font-semibold text-white mb-4">Recent Sessions</h3>
      <div className="space-y-4">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="p-4 bg-slate-700 rounded-lg border border-slate-600"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-white font-medium">{session.stakes}</span>
                  <span className="text-xs bg-slate-600 text-slate-300 px-2 py-1 rounded">
                    {session.gameType === 'cash' ? 'Cash' : 'Tournament'}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-slate-400">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>{session.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(session.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${session.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {session.profit >= 0 ? '+' : ''}${session.profit.toLocaleString()}
                </div>
                <div className="text-xs text-slate-400">
                  ${session.buyIn} → ${session.cashOut}
                </div>
              </div>
            </div>
            {session.notes && (
              <div className="text-sm text-slate-300 mt-2 p-2 bg-slate-600 rounded">
                {session.notes}
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default SessionList;
