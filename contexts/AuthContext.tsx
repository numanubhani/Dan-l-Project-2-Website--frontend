import React, { createContext, useContext, useState, ReactNode } from 'react';
import LoginModal from '../components/LoginModal';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  showLoginModal: (action?: string) => void;
  hideLoginModal: () => void;
  setUser: (user: User | null) => void;
  setIsAuthenticated: (value: boolean) => void;
  requireAuth: (action: () => void, actionName?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
  initialUser: User | null;
  initialIsAuthenticated: boolean;
  onLoginSuccess: () => void;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  initialUser,
  initialIsAuthenticated,
  onLoginSuccess,
}) => {
  const [user, setUser] = useState<User | null>(initialUser);
  const [isAuthenticated, setIsAuthenticated] = useState(initialIsAuthenticated);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<string>('continue');

  // Sync with parent state changes
  React.useEffect(() => {
    setUser(initialUser);
    setIsAuthenticated(initialIsAuthenticated);
  }, [initialUser, initialIsAuthenticated]);

  const showLoginModal = (action: string = 'continue') => {
    setModalAction(action);
    setShowModal(true);
  };

  const hideLoginModal = () => {
    setShowModal(false);
  };

  const requireAuth = (action: () => void, actionName: string = 'perform this action') => {
    if (isAuthenticated && user) {
      action();
    } else {
      showLoginModal(actionName);
    }
  };

  const handleLoginSuccess = () => {
    onLoginSuccess();
    hideLoginModal();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        showLoginModal,
        hideLoginModal,
        setUser,
        setIsAuthenticated,
        requireAuth,
      }}
    >
      {children}
      <LoginModal
        isOpen={showModal}
        onClose={hideLoginModal}
        onLoginSuccess={handleLoginSuccess}
        action={modalAction}
      />
    </AuthContext.Provider>
  );
};

