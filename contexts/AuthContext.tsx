import React, { createContext, useContext, useState, ReactNode } from 'react';
import LoginModal from '../components/LoginModal';
import { User } from '../types';
import { api, convertApiUserToUser } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  showLoginModal: (action?: string) => void;
  hideLoginModal: () => void;
  setUser: (user: User | null) => void;
  setIsAuthenticated: (value: boolean) => void;
  requireAuth: (action: () => void, actionName?: string) => void;
  /** Dummy wallet top-up for testing (local state only). */
  applyDummyWalletTopUp: (amount: number) => void;
  /** Deduct stake locally when API rejects for insufficient funds but client test balance covers it. */
  applyDummyWalletDebit: (amount: number) => void;
  /** Reload profile from API (e.g. after server-side test wallet credit). */
  refreshUserFromApi: () => Promise<void>;
  addCoinsModalOpen: boolean;
  openAddCoinsModal: () => void;
  closeAddCoinsModal: () => void;
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
  /** Keep App-level `user` in sync when balance is patched locally (e.g. dummy add coins). */
  syncUserToApp?: (user: User) => void;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  initialUser,
  initialIsAuthenticated,
  onLoginSuccess,
  syncUserToApp,
}) => {
  const [user, setUser] = useState<User | null>(initialUser);
  const [isAuthenticated, setIsAuthenticated] = useState(initialIsAuthenticated);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<string>('continue');
  const [addCoinsModalOpen, setAddCoinsModalOpen] = useState(false);

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

  const openAddCoinsModal = () => {
    if (isAuthenticated && user) {
      setAddCoinsModalOpen(true);
    } else {
      showLoginModal('add coins');
    }
  };

  const closeAddCoinsModal = () => setAddCoinsModalOpen(false);

  const applyDummyWalletTopUp = (amount: number) => {
    if (!Number.isFinite(amount) || amount <= 0) return;
    setUser((prev) => {
      if (!prev) return prev;
      const next: User = {
        ...prev,
        balance: Number(prev.balance) + amount,
      };
      syncUserToApp?.(next);
      return next;
    });
  };

  const applyDummyWalletDebit = (amount: number) => {
    if (!Number.isFinite(amount) || amount <= 0) return;
    setUser((prev) => {
      if (!prev) return prev;
      const next: User = {
        ...prev,
        balance: Number(prev.balance) - amount,
      };
      syncUserToApp?.(next);
      return next;
    });
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
        applyDummyWalletTopUp,
        applyDummyWalletDebit,
        refreshUserFromApi,
        addCoinsModalOpen,
        openAddCoinsModal,
        closeAddCoinsModal,
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

