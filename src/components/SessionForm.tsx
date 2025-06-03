
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { Session } from '@/pages/Index';

interface SessionFormProps {
  onAddSession: (session: Omit<Session, 'id' | 'profit'>) => void;
  onCancel: () => void;
}

const SessionForm = ({ onAddSession, onCancel }: SessionFormProps) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    gameType: 'cash' as 'cash' | 'tournament',
    stakes: '',
    location: '',
    buyIn: '',
    cashOut: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.stakes || !formData.location || !formData.buyIn || !formData.cashOut) {
      alert('Please fill in all required fields');
      return;
    }

    onAddSession({
      date: formData.date,
      gameType: formData.gameType,
      stakes: formData.stakes,
      location: formData.location,
      buyIn: parseFloat(formData.buyIn),
      cashOut: parseFloat(formData.cashOut),
      notes: formData.notes
    });
  };

  const profit = parseFloat(formData.cashOut || '0') - parseFloat(formData.buyIn || '0');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6 pt-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-slate-400 hover:text-white p-2 mr-3"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold text-white">Add Session</h1>
        </div>

        <Card className="p-6 bg-slate-800 border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-white">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="gameType" className="text-white">Game Type</Label>
                <Select
                  value={formData.gameType}
                  onValueChange={(value: 'cash' | 'tournament') => 
                    setFormData({ ...formData, gameType: value })
                  }
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="cash">Cash Game</SelectItem>
                    <SelectItem value="tournament">Tournament</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stakes" className="text-white">Stakes/Buy-in</Label>
              <Input
                id="stakes"
                placeholder="$2/$3, $100 Tournament, etc."
                value={formData.stakes}
                onChange={(e) => setFormData({ ...formData, stakes: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-white">Location</Label>
              <Input
                id="location"
                placeholder="Casino name or location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="buyIn" className="text-white">Buy In ($)</Label>
                <Input
                  id="buyIn"
                  type="number"
                  step="0.01"
                  placeholder="300"
                  value={formData.buyIn}
                  onChange={(e) => setFormData({ ...formData, buyIn: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cashOut" className="text-white">Cash Out ($)</Label>
                <Input
                  id="cashOut"
                  type="number"
                  step="0.01"
                  placeholder="450"
                  value={formData.cashOut}
                  onChange={(e) => setFormData({ ...formData, cashOut: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  required
                />
              </div>
            </div>

            {/* Profit/Loss Display */}
            {formData.buyIn && formData.cashOut && (
              <div className="p-4 bg-slate-700 rounded-lg">
                <div className="text-center">
                  <div className="text-sm text-slate-400 mb-1">Profit/Loss</div>
                  <div className={`text-2xl font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {profit >= 0 ? '+' : ''}${profit.toFixed(2)}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-white">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="How did the session go? Any key hands or observations..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
            >
              <Save className="h-5 w-5 mr-2" />
              Save Session
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default SessionForm;
