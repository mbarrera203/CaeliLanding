import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, ArrowLeft, Loader2, Sparkles } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (email: string, pass: string) => Promise<unknown>;
}


export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor completá tu correo y contraseña.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onLogin(email, password);
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes('Invalid login credentials')) {
        setError('Credenciales incorrectas. Verificá tu correo y contraseña.');
      } else if (err.message?.includes('Email not confirmed')) {
        setError('El correo aún no ha sido confirmado.');
      } else {
        setError(err.message || 'Ocurrió un error al iniciar sesión.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-ivory flex flex-col justify-center items-center px-4 py-12">
      {/* Botón flotante para volver a la tienda */}
      <div className="absolute top-6 left-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[13px] text-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a la tienda
        </Link>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-stone-200/50 border border-stone-200/80 p-8 sm:p-10 relative overflow-hidden">
        {/* Detalle decorativo dorado superior */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200" />

        {/* Encabezado con Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-amber-50/80 border border-amber-100 mb-4">
            <Sparkles className="w-6 h-6 text-amber-600" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-ink">
            Panel de Control
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-muted">
            Ingreso exclusivo para administración de Caeli Joyas
          </p>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="mb-6 rounded-xl bg-red-50/90 border border-red-200/80 p-3.5 text-xs text-red-700 leading-relaxed">
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink mb-1.5" htmlFor="email">
              Correo electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                <Mail className="h-4 w-4" />
              </div>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dueña@caeli.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-stone-200 bg-stone-50/50 text-ink placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink mb-1.5" htmlFor="password">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-stone-200 bg-stone-50/50 text-ink placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted hover:text-ink transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-ink hover:bg-stone-800 text-white text-sm font-medium shadow-md shadow-stone-800/10 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Iniciando sesión...</span>
              </>
            ) : (
              <span>Ingresar al panel</span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-stone-100 text-center">
          <p className="text-[11px] text-muted">
            Caeli Joyas &copy; {new Date().getFullYear()} · Acceso protegido con Supabase
          </p>
        </div>
      </div>
    </div>
  );
}
