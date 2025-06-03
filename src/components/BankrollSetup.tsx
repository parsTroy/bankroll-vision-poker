
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Target, TrendingUp } from 'lucide-react';
import { BankrollData } from '@/pages/Index';

interface BankrollSetupProps {
  onSetup: (data: BankrollData) => void;
  initialData?: BankrollData;
}

const BankrollSetup = ({ onSetup, initialData }: BankrollSetupProps) => {
  const [startingAmount, setStartingAmount] = useState(initialData?.startingAmount?.toString() || '');
  const [goalAmount, setGoalAmount] = useState(initialData?.goalAmount?.toString() || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const starting = parseFloat(startingAmount) || 0;
    const goal = parseFloat(goalAmount) || 0;
    
    if (starting <= 0 || goal <= starting) {
      alert('Please enter valid amounts. Goal must be greater than starting amount.');
      return;
    }

    onSetup({
      startingAmount: starting,
      goalAmount: goal,
      currentAmount: initialData?.currentAmount || starting
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <Card className="p-6 bg-slate-800 border-slate-700">
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
              <Target className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {initialData ? 'Update Bankroll' : 'Setup Your Bankroll'}
            </h1>
            <p className="text-slate-400">
              {initialData ? 'Update your bankroll settings' : 'Set your starting bankroll and goal to begin tracking'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="starting" className="text-white">Starting Bankroll</Label>
              <Input
                id="starting"
                type="number"
                step="0.01"
                placeholder="1000"
                value={startingAmount}
                onChange={(e) => setStartingAmount(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal" className="text-white">Bankroll Goal</Label>
              <Input
                id="goal"
                type="number"
                step="0.01"
                placeholder="5000"
                value={goalAmount}
                onChange={(e) => setGoalAmount(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
            >
              <TrendingUp className="h-5 w-5 mr-2" />
              {initialData ? 'Update Bankroll' : 'Start Tracking'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default BankrollSetup;
