import { supabase } from '../supabase'

interface DashboardProps {
  isGuest?: boolean
}

export default function Dashboard({ isGuest }: DashboardProps) {
  const handleLogout = async () => {
    await supabase.auth.signOut()
    if (isGuest) {
      window.location.reload()
    }
  }

  return (
    <div className="w-full flex flex-col items-center animate-fadeIn">
      {/* Hero card */}
      <div className="max-w-lg w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-violet-200/50 p-12 border border-violet-100 text-center">
        
        {/* Logo */}
        <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-violet-700 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg shadow-violet-300">
          ⚡
        </div>

        <h1 className="text-3xl font-bold text-violet-950 mb-2">
          🎯 FluentWork Coach
        </h1>
        <p className="text-violet-600/70 mb-8">
          Coach de Inglés práctico para UX/UI ✨
        </p>
        
        <div className="bg-violet-50 p-6 rounded-2xl border border-violet-100 mb-6">
          <p className="text-violet-700 font-medium mb-2 flex items-center justify-center gap-2">
            {isGuest ? '👋 ¡Bienvenido, Invitado!' : '✅ Autenticado'}
          </p>
          <p className="text-violet-500 text-sm">
            ¡Todo listo! Tu aplicación está conectada.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="px-6 py-3 rounded-xl border-2 border-violet-200 text-violet-600 font-semibold hover:bg-violet-50 hover:border-violet-300 transition-all"
        >
          🚪 Cerrar Sesión
        </button>
      </div>
    </div>
  )
}
