"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Wifi, WifiOff } from "lucide-react";

interface BlockchainStatusProps {
    isLoading: boolean;
    error?: string | null;
    step?: string;
    contractAddress?: string;
    network?: string;
}

export function BlockchainStatus({
    isLoading,
    error,
    step = "Conectando...",
    contractAddress,
    network = "testnet"
}: BlockchainStatusProps) {
    if (!isLoading && !error) return null;

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardContent className="pt-6">
                <div className="text-center space-y-4">
                    {isLoading ? (
                        <>
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <Wifi className="h-5 w-5 text-blue-600" />
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                            </div>
                            <p className="text-gray-700 font-medium">{step}</p>
                        </>
                    ) : error ? (
                        <>
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <WifiOff className="h-5 w-5 text-red-600" />
                                <AlertCircle className="h-5 w-5 text-red-600" />
                            </div>
                            <p className="text-red-700 font-medium">Error de Conexión</p>
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-left">
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                        </>
                    ) : null}

                    <div className="space-y-1 text-xs text-gray-500">
                        {contractAddress && (
                            <p>Contrato: <code className="bg-gray-100 px-1 rounded">{contractAddress}</code></p>
                        )}
                        <p>Red: <code className="bg-gray-100 px-1 rounded">{network}</code></p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}