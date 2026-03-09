import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, LogIn, User, Lock } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner@2.0.3';

interface LoginScreenProps {
  onBack: () => void;
  onLogin: (tipo: 'crianca' | 'pai') => void;
}

export function LoginScreen({ onBack, onLogin }: LoginScreenProps) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = () => {
    if (!usuario || !senha) {
      toast.error('Preencha todos os campos!');
      return;
    }

    // Identificar automaticamente se é email (pai) ou username (criança)
    const isEmail = usuario.includes('@');
    const tipoLogin = isEmail ? 'pai' : 'crianca';

    // Simulação de login
    toast.success(`Login realizado com sucesso! 🎉`, {
      description: isEmail ? 'Bem-vindo, Responsável!' : 'Bem-vindo, criança!'
    });
    onLogin(tipoLogin);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 relative overflow-hidden">
      {/* Padrão Samakaka */}
      <div 
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(0,0,0,0.1) 35px, rgba(0,0,0,0.1) 70px)`
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="p-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Voltar</span>
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full"
          >
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="inline-block bg-gradient-to-br from-orange-400 to-orange-500 rounded-full p-6 mb-4 shadow-xl">
                <span className="text-5xl">🦁</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2 kids-heading">
                Bem-vindo de volta!
              </h1>
              <p className="text-gray-600">Entre na sua conta Kamba</p>
            </div>

            {/* Formulário de Login */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-3xl p-8 shadow-xl">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 kids-heading">
                    Entrar
                  </h2>
                  <p className="text-sm text-gray-500 mt-2">
                    Use seu email (responsável) ou nome de usuário (criança)
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Email ou Nome de usuário
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="seu@email.com ou kiala123"
                        value={usuario}
                        onChange={(e) => setUsuario(e.target.value)}
                        className="pl-12 py-6 text-lg rounded-2xl border-2 focus:border-orange-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Senha
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        className="pl-12 py-6 text-lg rounded-2xl border-2 focus:border-orange-400"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleLogin();
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="text-right">
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      Esqueceu a senha?
                    </button>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleLogin}
                type="button"
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-xl font-bold py-8 rounded-3xl shadow-xl hover:scale-105 transition-all kids-heading"
              >
                <LogIn className="w-6 h-6 mr-2" />
                Entrar
              </Button>

              <div className="bg-blue-50 rounded-2xl p-4 border-2 border-blue-200">
                <p className="text-sm text-gray-700 text-center">
                  <span className="font-medium">👶 Criança?</span> Peça ao seu responsável para criar sua conta no painel de gestão.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}