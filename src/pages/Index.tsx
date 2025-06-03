
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Plus, TrendingUp, TrendingDown, Target } from 'lucide-react';
import SessionForm from '@/components/SessionForm';
import SessionList from '@/components/SessionList';
import Analytics from '@/components/Analytics';
import BankrollSetup from '@/components/BankrollSetup';

export interface Session {
  id: string;
  date: string;
  gameType: 'cash' | 'tournament';
  stakes: string;
  location: string;
  buyIn: number;
  cashOut: number;
  profit: number;
  notes: string;
}

export interface BankrollData {
  startingAmount: number;
  goalAmount: number;
  currentAmount: number;
}

const Index = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [bankroll, setBankroll] = useState<BankrollData | null>(null);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showBankrollSetup, setShowBankrollSetup] = useState(false);

  useEffect(() => {
    const savedSessions = localStorage.getItem('pokerSessions');
    const savedBankroll = localStorage.getItem('pokerBankroll');
    
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    }
    
    if (savedBankroll) {
      setBankroll(JSON.parse(savedBankroll));
    }
  }, []);

  const addSession = (session: Omit<Session, 'id' | 'profit'>) => {
    const profit = session.cashOut - session.buyIn;
    const newSession: Session = {
      ...session,
      id: Date.now().toString(),
      profit
    };
    
    const updatedSessions = [...sessions, newSession];
    setSessions(updatedSessions);
    localStorage.setItem('pokerSessions', JSON.stringify(updatedSessions));
    
    if (bankroll) {
      const updatedBankroll = {
        ...bankroll,
        currentAmount: bankroll.currentAmount + profit
      };
      setBankroll(updatedBankroll);
      localStorage.setItem('pokerBankroll', JSON.stringify(updatedBankroll));
    }
    
    setShowSessionForm(false);
  };

  const setupBankroll = (data: BankrollData) => {
    setBankroll(data);
    localStorage.setItem('pokerBankroll', JSON.stringify(data));
    setShowBankrollSetup(false);
  };

  const totalProfit = sessions.reduce((sum, session) => sum + session.profit, 0);
  const progressPercentage = bankroll ? 
    Math.min(100, Math.max(0, ((bankroll.currentAmount - bankroll.startingAmount) / (bankroll.goalAmount - bankroll.startingAmount)) * 100)) : 0;

  if (!bankroll) {
    return <BankrollSetup onSetup={setupBankroll} />;
  }

  if (showBankrollSetup) {
    return <BankrollSetup onSetup={setupBankroll} initialData={bankroll} />;
  }

  if (showSessionForm) {
    return <SessionForm onAddSession={addSession} onCancel={() => setShowSessionForm(false)} />;
  }

  if (showAnalytics) {
    return <Analytics sessions={sessions} bankroll={bankroll} onBack={() => setShowAnalytics(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center pt-6 pb-4">
          <h1 className="text-3xl font-bold text-white mb-2">Poker Tracker</h1>
          <p className="text-slate-400">Track your live poker journey</p>
        </div>

        {/* Bankroll Overview */}
        <Card className="p-6 bg-slate-800 border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Bankroll</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBankrollSetup(true)}
              className="text-slate-400 hover:text-white"
            >
              Edit
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">
                ${bankroll.currentAmount.toLocaleString()}
              </div>
              <div className={`text-lg ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totalProfit >= 0 ? '+' : ''}${totalProfit.toLocaleString()}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-slate-400">
                <span>Goal Progress</span>
                <span>${bankroll.goalAmount.toLocaleString()}</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              <div className="text-center text-sm text-slate-400">
                {progressPercentage.toFixed(1)}% to goal
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-slate-800 border-slate-700">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              <div>
                <div className="text-slate-400 text-sm">Sessions</div>
                <div className="text-xl font-bold text-white">{sessions.length}</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-slate-800 border-slate-700">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-400" />
              <div>
                <div className="text-slate-400 text-sm">Win Rate</div>
                <div className="text-xl font-bold text-white">
                  {sessions.length > 0 ? 
                    `${((sessions.filter(s => s.profit > 0).length / sessions.length) * 100).toFixed(0)}%` : 
                    '0%'
                  }
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={() => setShowSessionForm(true)}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-semibold"
          >
            <Plus className="h-6 w-6 mr-2" />
            Add Session
          </Button>
          
          <Button 
            onClick={() => setShowAnalytics(true)}
            variant="outline"
            className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 py-3"
          >
            View Analytics
          </Button>
        </div>

        {/* Recent Sessions */}
        <SessionList sessions={sessions.slice(-5).reverse()} />
      </div>
    </div>
  );
};

export default Index;
