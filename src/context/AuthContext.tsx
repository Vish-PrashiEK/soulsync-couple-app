import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { PartnerId, PartnerProfile } from '../types';
import { COUPLE_PARTNERS, DEFAULT_COUPLE_PASSCODE, STORAGE_KEYS } from '../config/constants';

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: PartnerProfile;
  partner: PartnerProfile;
  selectedPartnerId: PartnerId;
  setSelectedPartnerId: (id: PartnerId) => void;
  login: (pin: string, partnerId?: PartnerId) => Promise<boolean>;
  logout: () => Promise<void>;
  changePasscode: (oldPin: string, newPin: string) => Promise<boolean>;
  isFirstLaunch: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState<PartnerId>('partner1');
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        const storedPasscode = await SecureStore.getItemAsync(STORAGE_KEYS.PASSCODE);
        if (!storedPasscode) {
          await SecureStore.setItemAsync(STORAGE_KEYS.PASSCODE, DEFAULT_COUPLE_PASSCODE);
          setIsFirstLaunch(true);
        }

        const storedUser = await SecureStore.getItemAsync(STORAGE_KEYS.CURRENT_USER);
        if (storedUser === 'partner1' || storedUser === 'partner2') {
          setSelectedPartnerId(storedUser);
        }
      } catch (e) {
        // SecureStore fallback
      }
    })();
  }, []);

  const login = async (pin: string, partnerId?: PartnerId): Promise<boolean> => {
    try {
      const activePartner = partnerId || selectedPartnerId;
      const storedPasscode =
        (await SecureStore.getItemAsync(STORAGE_KEYS.PASSCODE)) || DEFAULT_COUPLE_PASSCODE;

      if (pin === storedPasscode) {
        setSelectedPartnerId(activePartner);
        await SecureStore.setItemAsync(STORAGE_KEYS.CURRENT_USER, activePartner);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (e) {
      if (pin === DEFAULT_COUPLE_PASSCODE) {
        setIsAuthenticated(true);
        return true;
      }
      return false;
    }
  };

  const logout = async () => {
    setIsAuthenticated(false);
  };

  const changePasscode = async (oldPin: string, newPin: string): Promise<boolean> => {
    try {
      const storedPasscode =
        (await SecureStore.getItemAsync(STORAGE_KEYS.PASSCODE)) || DEFAULT_COUPLE_PASSCODE;
      if (oldPin === storedPasscode && newPin.length === 4) {
        await SecureStore.setItemAsync(STORAGE_KEYS.PASSCODE, newPin);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const currentUser = COUPLE_PARTNERS[selectedPartnerId];
  const partner =
    selectedPartnerId === 'partner1' ? COUPLE_PARTNERS.partner2 : COUPLE_PARTNERS.partner1;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        partner,
        selectedPartnerId,
        setSelectedPartnerId,
        login,
        logout,
        changePasscode,
        isFirstLaunch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

