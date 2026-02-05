import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
  onGuestAccess: () => void;
  loading: boolean;
}

const LoginScreen = ({ onLogin, onGuestAccess, loading }: LoginScreenProps) => {
  const handleGoogleClick = () => {
    if (!loading) onLogin();
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          {/* Logo */}
          <div 
            className="mx-auto size-16 bg-slate-900 rounded-xl flex items-center justify-center"
            aria-hidden="true"
          >
            <span className="text-2xl">🚀</span>
          </div>
          
          <div>
            <CardTitle className="text-2xl">FluentWork</CardTitle>
            <CardDescription className="mt-2">
              Tu coach personal de inglés profesional
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Google Login */}
          <Button 
            onClick={handleGoogleClick} 
            disabled={loading} 
            variant="outline"
            size="lg"
            className="w-full"
          >
            {loading ? (
              <Loader2 className="animate-spin" aria-hidden="true" />
            ) : (
              <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            <span>{loading ? 'Conectando...' : 'Continuar con Google'}</span>
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">o</span>
            </div>
          </div>

          {/* Guest Access */}
          <Button 
            onClick={onGuestAccess} 
            variant="ghost" 
            size="lg"
            className="w-full"
          >
            Explorar como invitado
          </Button>

          {/* Legal text */}
          <p className="text-xs text-center text-slate-400 pt-4">
            Al continuar, aceptas nuestros términos de servicio y política de privacidad.
          </p>
        </CardContent>
      </Card>
    </main>
  );
};

export default LoginScreen;
