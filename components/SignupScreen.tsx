import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, UserPlus, User, Mail, Lock, Phone } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner@2.0.3';

interface SignupScreenProps {
  onBack: () => void;
  onSignup: (tipo: 'crianca' | 'pai') => void;
}

export function SignupScreen({ onBack, onSignup }: SignupScreenProps) {
  // Campos do formulário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [telefone, setTelefone] = useState('');

  const handleCriarConta = () => {
    // Validação básica
    if (!nome || !email || !senha || !confirmarSenha) {
      toast.error('Preencha todos os campos obrigatórios!');
      return;
    }

    // Validar comprimento da senha
    if (senha.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres!');
      return;
    }

    if (senha !== confirmarSenha) {
      toast.error('As senhas não coincidem!');
      return;
    }

    // Validar email
    if (!email.includes('@')) {
      toast.error('Digite um email válido!');
      return;
    }

    // Simulação de criação de conta
    toast.success('Conta criada com sucesso! 🎉', {
      description: `Bem-vindo ao Kamba Kid Pay, ${nome}!`
    });
    
    setTimeout(() => {
      onSignup('pai');
    }, 1000);
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
              <div className="inline-block bg-gradient-to-br from-blue-500 to-blue-600 rounded-full p-6 mb-4 shadow-xl">
                <span className="text-5xl">👨‍👩‍👧</span>
              </div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2 kids-heading">
                Criar Conta de Responsável
              </h1>
              <p className="text-gray-600">Gerencie a educação financeira dos seus filhos</p>
            </div>

            {/* Formulário de Cadastro */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-3xl p-8 shadow-xl max-h-[70vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 kids-heading">
                  Seus Dados
                </h2>

                <div className="space-y-4">
                  {/* Nome */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Nome completo *
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="João Silva"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        className="pl-12 py-6 text-lg rounded-2xl border-2 focus:border-blue-400"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-12 py-6 text-lg rounded-2xl border-2 focus:border-blue-400"
                      />
                    </div>
                  </div>

                  {/* Telefone */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Telefone (opcional)
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="tel"
                        placeholder="+244 900 000 000"
                        value={telefone}
                        onChange={(e) => setTelefone(e.target.value)}
                        className="pl-12 py-6 text-lg rounded-2xl border-2 focus:border-blue-400"
                      />
                    </div>
                  </div>

                  {/* Senha */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Senha *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        className="pl-12 py-6 text-lg rounded-2xl border-2 focus:border-blue-400"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
                  </div>

                  {/* Confirmar Senha */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Confirmar senha *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={confirmarSenha}
                        onChange={(e) => setConfirmarSenha(e.target.value)}
                        className="pl-12 py-6 text-lg rounded-2xl border-2 focus:border-blue-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Termos */}
                <div className="mt-6 bg-blue-50 rounded-2xl p-4">
                  <p className="text-xs text-gray-600 text-center">
                    Ao criar uma conta, você concorda com nossos{' '}
                    <button className="text-blue-600 font-medium">Termos de Uso</button>{' '}
                    e{' '}
                    <button className="text-blue-600 font-medium">Política de Privacidade</button>
                  </p>
                </div>
              </div>

              <Button
                onClick={handleCriarConta}
                type="button"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-xl font-bold py-8 rounded-3xl shadow-xl hover:scale-105 transition-all kids-heading"
              >
                <UserPlus className="w-6 h-6 mr-2" />
                Criar Conta de Responsável
              </Button>

              <div className="bg-orange-50 rounded-2xl p-4 border-2 border-orange-200">
                <p className="text-sm text-gray-700 text-center">
                  <span className="font-medium">ℹ️ Próximo passo:</span> Após criar sua conta, você poderá adicionar seus filhos no painel de gestão.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}