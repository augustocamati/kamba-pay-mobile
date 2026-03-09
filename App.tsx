import { useState } from 'react';
import { ChildHome } from './components/ChildHome';
import { AvatarShop } from './components/AvatarShop';
import { LearningCenter } from './components/LearningCenter';
import { ChildProfile } from './components/ChildProfile';
import { ParentDashboard } from './components/ParentDashboard';
import { TarefasScreen } from './components/TarefasScreen';
import { MissoesScreen } from './components/MissoesScreen';
import { CampanhasScreen } from './components/CampanhasScreen';
import { QuizScreen } from './components/QuizScreen';
import { WelcomeScreen } from './components/WelcomeScreen';
import { LoginScreen } from './components/LoginScreen';
import { SignupScreen } from './components/SignupScreen';
import { PinValidation } from './components/PinValidation';
import { AccessDenied } from './components/AccessDenied';
import { AppProvider } from './context/AppContext';
import { Toaster } from './components/ui/sonner';
import { PageTransition } from './components/transitions/PageTransition';
import { ButtonFeedback } from './components/transitions/ButtonFeedback';

type AuthScreen = 'welcome' | 'login' | 'signup' | 'app';
type UserType = 'child' | 'parent' | null;

export default function App() {
  const [authScreen, setAuthScreen] = useState<AuthScreen>('welcome');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<UserType>(null);
  const [currentView, setCurrentView] = useState<'child' | 'parent'>('child');
  const [currentScreen, setCurrentScreen] = useState<'home' | 'shop' | 'learning' | 'profile' | 'tarefas' | 'missoes' | 'campanhas' | 'quiz'>('home');
  const [showPinValidation, setShowPinValidation] = useState(false);
  const [showAccessDenied, setShowAccessDenied] = useState(false);

  const handleLogin = (tipo: 'crianca' | 'pai') => {
    setIsAuthenticated(true);
    setUserType(tipo === 'crianca' ? 'child' : 'parent');
    setCurrentView(tipo === 'crianca' ? 'child' : 'parent');
    setAuthScreen('app');
  };

  const handleSignup = (tipo: 'crianca' | 'pai') => {
    setIsAuthenticated(true);
    setUserType(tipo === 'crianca' ? 'child' : 'parent');
    setCurrentView(tipo === 'crianca' ? 'child' : 'parent');
    setAuthScreen('app');
  };

  const handleRequestParentAccess = () => {
    // Se já é pai, acessa direto
    if (userType === 'parent') {
      setCurrentView('parent');
      return;
    }

    // Se é criança, exibe validação de PIN
    if (userType === 'child') {
      setShowAccessDenied(true);
      return;
    }

    // Caso não autenticado, vai para login
    setAuthScreen('login');
  };

  const handlePinSuccess = () => {
    setShowPinValidation(false);
    setCurrentView('parent');
  };

  const handlePinCancel = () => {
    setShowPinValidation(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserType(null);
    setAuthScreen('welcome');
    setCurrentView('child');
    setCurrentScreen('home');
  };

  // Telas de autenticação
  if (!isAuthenticated) {
    if (authScreen === 'welcome') {
      return (
        <WelcomeScreen 
          onLogin={() => setAuthScreen('login')}
          onCriarContaResponsavel={() => setAuthScreen('signup')}
        />
      );
    }

    if (authScreen === 'login') {
      return (
        <LoginScreen
          onBack={() => setAuthScreen('welcome')}
          onLogin={handleLogin}
        />
      );
    }

    if (authScreen === 'signup') {
      return (
        <SignupScreen
          onBack={() => setAuthScreen('welcome')}
          onSignup={handleSignup}
        />
      );
    }
  }

  // Tela de Acesso Negado
  if (showAccessDenied) {
    return (
      <AccessDenied
        onGoBack={() => {
          setShowAccessDenied(false);
          setCurrentView('child');
          setCurrentScreen('home');
        }}
      />
    );
  }

  return (
    <AppProvider>
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-yellow-50">
        {/* Header de Navegação - Apenas para visualização administrativa */}
        {currentView === 'child' && (
          <div className="fixed top-4 right-4 z-50 flex gap-2">
            <button
              onClick={handleLogout}
              className="bg-red-500/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg text-sm font-medium text-white hover:scale-110 transition-all"
            >
              Sair
            </button>
          </div>
        )}

        {currentView === 'parent' && (
          <div className="fixed top-4 right-4 z-50 flex gap-2">
            <button
              onClick={() => {
                setCurrentView('child');
                setCurrentScreen('home');
              }}
              className="bg-orange-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium hover:scale-110 transition-all flex items-center gap-2"
            >
              👶 Voltar à Criança
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg text-sm font-medium text-white hover:scale-110 transition-all"
            >
              Sair
            </button>
          </div>
        )}

        {/* Validação de PIN */}
        {showPinValidation && (
          <PinValidation
            onSuccess={handlePinSuccess}
            onCancel={handlePinCancel}
          />
        )}

        {currentView === 'child' ? (
          <>
            <PageTransition pageKey={currentScreen}>
              {currentScreen === 'home' && <ChildHome onNavigateToProfile={() => setCurrentScreen('profile')} />}
              {currentScreen === 'tarefas' && <TarefasScreen />}
              {currentScreen === 'missoes' && <MissoesScreen onVoltar={() => setCurrentScreen('home')} />}
              {currentScreen === 'campanhas' && <CampanhasScreen />}
              {currentScreen === 'shop' && <AvatarShop />}
              {currentScreen === 'learning' && <LearningCenter onNavigateToQuiz={() => setCurrentScreen('quiz')} />}
              {currentScreen === 'profile' && <ChildProfile />}
              {currentScreen === 'quiz' && <QuizScreen onVoltar={() => setCurrentScreen('learning')} />}
            </PageTransition>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-40">
              <div className="max-w-md mx-auto px-2 py-3 flex justify-around items-center">
                <ButtonFeedback 
                  onClick={() => setCurrentScreen('home')} 
                  className={`flex flex-col items-center gap-1 transition-colors bg-transparent border-none ${currentScreen === 'home' ? 'text-orange-500' : 'text-gray-400'}`}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  <span className="text-[10px]">Início</span>
                </ButtonFeedback>

                <ButtonFeedback 
                  onClick={() => setCurrentScreen('tarefas')} 
                  className={`flex flex-col items-center gap-1 transition-colors bg-transparent border-none ${currentScreen === 'tarefas' ? 'text-orange-500' : 'text-gray-400'}`}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 11l3 3L22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                  <span className="text-[10px]">Tarefas</span>
                </ButtonFeedback>

                <ButtonFeedback 
                  onClick={() => setCurrentScreen('missoes')} 
                  className={`flex flex-col items-center gap-1 transition-colors bg-transparent border-none ${currentScreen === 'missoes' ? 'text-orange-500' : 'text-gray-400'}`}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  <span className="text-[10px]">Missões</span>
                </ButtonFeedback>

                <ButtonFeedback 
                  onClick={() => setCurrentScreen('campanhas')} 
                  className={`flex flex-col items-center gap-1 transition-colors bg-transparent border-none ${currentScreen === 'campanhas' ? 'text-orange-500' : 'text-gray-400'}`}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  <span className="text-[10px]">Ajudar</span>
                </ButtonFeedback>

                <ButtonFeedback 
                  onClick={() => setCurrentScreen('learning')} 
                  className={`flex flex-col items-center gap-1 transition-colors bg-transparent border-none ${currentScreen === 'learning' ? 'text-orange-500' : 'text-gray-400'}`}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                  <span className="text-[10px]">Escola</span>
                </ButtonFeedback>
              </div>
            </nav>
          </>
        ) : (
          <ParentDashboard />
        )}
        
        <Toaster position="top-center" />
      </div>
    </AppProvider>
  );
}