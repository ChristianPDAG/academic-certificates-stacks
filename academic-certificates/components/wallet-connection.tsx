"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, AlertCircle } from "lucide-react";
import { useStacks } from "@/lib/stacks-provider";

interface WalletConnectionProps {
    children: React.ReactNode;
}

export function WalletConnection({ children }: WalletConnectionProps) {
    const { isSignedIn, connectWallet, userData, userAddress } = useStacks();

    if (!isSignedIn) {
        return (
            <div className="flex-1 w-full flex flex-col gap-6">
                <Card className="max-w-md mx-auto">
                    <CardHeader className="text-center">
                        <CardTitle className="flex items-center justify-center gap-2">
                            <Wallet className="h-5 w-5" />
                            Conectar Wallet
                        </CardTitle>
                        <CardDescription>
                            Necesitas conectar tu wallet de Stacks para acceder al panel de administración
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2 text-amber-600 text-sm">
                            <AlertCircle className="h-4 w-4" />
                            <span>Se requiere Stacks Wallet para firmar transacciones</span>
                        </div>
                        <Button onClick={connectWallet} className="w-full">
                            Conectar Stacks Wallet
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Información de Wallet Conectada */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Wallet className="h-5 w-5" />
                            Wallet Conectada
                        </span>
                        <Badge variant="secondary">Conectada</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div>
                            <span className="text-sm font-medium">Dirección: </span>
                            <span className="text-sm font-mono bg-muted px-2 py-1 rounded">
                                {userAddress}
                            </span>
                        </div>
                        {userData?.username && (
                            <div>
                                <span className="text-sm font-medium">BNS: </span>
                                <span className="text-sm">{userData.username}</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Contenido Principal */}
            {children}
        </div>
    );
}