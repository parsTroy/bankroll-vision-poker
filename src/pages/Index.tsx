
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Plus, TrendingUp, Target, LogOut, Spade } from 'lucide-react';
import SessionForm from '@/components/SessionForm';
import SessionList from '@/components/SessionList';
import Analytics from '@/components/Analytics';
import BankrollSetup from '@/components/BankrollSetup';
import Auth from '@/components/Auth';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const { user, loading, signOut } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [bankroll, setBankroll] = useState<BankrollData | null>(null);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showBankrollSetup, setShowBankrollSetup] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const { toast } = useToast();

  // Load user data when authenticated
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      setLoadingData(true);
      
      // Load sessions from Supabase
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select('*')
        .order('date', { ascending: false });

      if (sessionsError) throw sessionsError;

      // Transform the data to match our interface
      const transformedSessions = sessionsData?.map(session => ({
        id: session.id,
        date: session.date,
        gameType: session.game_type as 'cash' | 'tournament',
        stakes: session.stakes || '',
        location: session.location,
        buyIn: session.buy_in,
        cashOut: session.cash_out || 0,
        profit: session.profit || 0,
        notes: session.notes || ''
      })) || [];

      setSessions(transformedSessions);

      // Load bankroll data from profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('starting_bankroll, bankroll_goal')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      if (profileData?.starting_bankroll && profileData?.bankroll_goal) {
        const totalProfit = transformedSessions.reduce((sum, session) => sum + session.profit, 0);
        setBankroll({
          startingAmount: profileData.starting_bankroll,
          goalAmount: profileData.bankroll_goal,
          currentAmount: profileData.starting_bankroll + totalProfit
        });
      }
    } catch (error: any) {
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoadingData(false);
    }
  };

  const addSession = async (sessionData: Omit<Session, 'id' | 'profit'>) => {
    try {
      const profit = sessionData.cashOut - sessionData.buyIn;
      
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          user_id: user?.id,
          date: sessionData.date,
          game_type: sessionData.gameType,
          stakes: sessionData.stakes,
          location: sessionData.location,
          buy_in: sessionData.buyIn,
          cash_out: sessionData.cashOut,
          profit: profit,
          notes: sessionData.notes
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      const newSession: Session = {
        id: data.id,
        date: data.date,
        gameType: data.game_type,
        stakes: data.stakes || '',
        location: data.location,
        buyIn: data.buy_in,
        cashOut: data.cash_out || 0,
        profit: data.profit || 0,
        notes: data.notes || ''
      };

      setSessions(prev => [newSession, ...prev]);

      // Update bankroll
      if (bankroll) {
        const updatedBankroll = {
          ...bankroll,
          currentAmount: bankroll.currentAmount + profit
        };
        setBankroll(updatedBankroll);
      }

      setShowSessionForm(false);
      toast({
        title: "Session added!",
        description: `${profit >= 0 ? 'Profit' : 'Loss'}: $${Math.abs(profit)}`
      });
    } catch (error: any) {
      toast({
        title: "Error adding session",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const setupBankroll = async (data: BankrollData) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          starting_bankroll: data.startingAmount,
          bankroll_goal: data.goalAmount
        })
        .eq('id', user?.id);

      if (error) throw error;

      setBankroll(data);
      setShowBankrollSetup(false);
      toast({
        title: "Bankroll updated!",
        description: "Your bankroll settings have been saved"
      });
    } catch (error: any) {
      toast({
        title: "Error updating bankroll",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setSessions([]);
    setBankroll(null);
    toast({
      title: "Signed out",
      description: "Come back soon!"
    });
  };

  // Show loading while checking auth
  if (loading || (user && loadingData)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Show auth if not logged in
  if (!user) {
    return <Auth onAuthSuccess={() => {}} />;
  }

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
          <div className="flex items-center justify-center mb-2">
            <Spade className="h-8 w-8 text-red-500 mr-2" />
            <h1 className="text-3xl font-bold text-white">Seven Deuce</h1>
          </div>
          <p className="text-slate-400">Track your live poker journey</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-slate-400 hover:text-white mt-2"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Sign Out
          </Button>
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
            className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg font-semibold"
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
        <SessionList sessions={sessions.slice(0, 5)} />
      </div>
    </div>
  );
};

export default Index;
