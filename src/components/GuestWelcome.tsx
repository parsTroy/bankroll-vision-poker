
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spade, UserCheck, Play, AlertTriangle } from 'lucide-react';

interface GuestWelcomeProps {
  onContinue: () => void;
  onSignUp: () => void;
}

const GuestWelcome = ({ onContinue, onSignUp }: GuestWelcomeProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <Card className="p-6 bg-slate-800 border-slate-700">
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mb-4">
              <Spade className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Welcome to Seven Deuce</h1>
            <p className="text-slate-400">Try our poker session tracker</p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="p-4 bg-yellow-900/30 border border-yellow-600/50 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-yellow-200 font-medium text-sm mb-1">Guest Mode Notice</h3>
                  <p className="text-yellow-300 text-xs leading-relaxed">
                    Your data will be saved locally on this device only. If you clear your browser data or switch devices, your sessions will be lost. Create an account to keep your data permanently.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-700/50 rounded-lg">
              <h3 className="text-white font-medium text-sm mb-2">What you can do in guest mode:</h3>
              <ul className="space-y-1 text-slate-300 text-xs">
                <li>• Track poker sessions</li>
                <li>• Set bankroll goals</li>
                <li>• View analytics</li>
                <li>• Export your data later</li>
              </ul>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={onContinue}
              className="w-full bg-slate-600 hover:bg-slate-700 text-white py-3 text-lg font-semibold"
            >
              <Play className="h-5 w-5 mr-2" />
              Continue as Guest
            </Button>
            
            <Button 
              onClick={onSignUp}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg font-semibold"
            >
              <UserCheck className="h-5 w-5 mr-2" />
              Create Account Instead
            </Button>
          </div>

          <div className="mt-4 text-center text-xs text-slate-500">
            Guest data can be migrated to your account when you sign up
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GuestWelcome;
