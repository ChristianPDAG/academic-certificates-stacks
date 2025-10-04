"use client";

import { AppConfig, UserSession, authenticate } from '@stacks/connect';
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

// Configuración de la aplicación
const appConfig = new AppConfig(['store_write', 'publish_data']);

interface StacksContextType {
    userSession: UserSession;
    userData: any | null;
    isSignedIn: boolean;
    connectWallet: () => void;
    signOut: () => void;
    userAddress: string | null;
}

const StacksContext = createContext<StacksContextType | null>(null);

interface StacksProviderProps {
    children: ReactNode;
}

export function StacksProvider({ children }: StacksProviderProps) {
    const [userSession] = useState(() => new UserSession({ appConfig }));
    const [userData, setUserData] = useState<any | null>(null);
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [userAddress, setUserAddress] = useState<string | null>(null);

    useEffect(() => {
        if (userSession.isSignInPending()) {
            userSession.handlePendingSignIn().then((userData) => {
                setUserData(userData);
                setIsSignedIn(true);
                setUserAddress(userData.profile.stxAddress.mainnet);
            });
        } else if (userSession.isUserSignedIn()) {
            const userData = userSession.loadUserData();
            setUserData(userData);
            setIsSignedIn(true);
            setUserAddress(userData.profile.stxAddress.mainnet);
        }
    }, []);

    const connectWallet = () => {
        authenticate({
            appDetails: {
                name: 'Academic Certificates',
                icon: window.location.origin + '/favicon.ico',
            },
            redirectTo: window.location.origin,
            onFinish: () => {
                window.location.reload();
            },
            userSession,
        });
    };

    const signOut = () => {
        userSession.signUserOut('/');
        setUserData(null);
        setIsSignedIn(false);
        setUserAddress(null);
    };

    const value = {
        userSession,
        userData,
        isSignedIn,
        connectWallet,
        signOut,
        userAddress,
    };

    return (
        <StacksContext.Provider value={value}>
            {children}
        </StacksContext.Provider>
    );
}

export function useStacks() {
    const context = useContext(StacksContext);
    if (!context) {
        throw new Error('useStacks must be used within a StacksProvider');
    }
    return context;
}

// Hook personalizado para transacciones
export function useStacksTransaction() {
    const { userSession, isSignedIn, userAddress } = useStacks();

    const executeTransaction = async (txOptions: any) => {
        if (!isSignedIn || !userAddress) {
            throw new Error('Usuario no conectado');
        }

        try {
            const result = await txOptions;
            return result;
        } catch (error) {
            console.error('Error en la transacción:', error);
            throw error;
        }
    };

    return {
        executeTransaction,
        isSignedIn,
        userAddress,
    };
}