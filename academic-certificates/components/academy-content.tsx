"use client";

import { WalletConnection } from "@/components/wallet-connection";
import AcademyDashboard from "@/components/academy-dashboard";
import { signContractCall } from "@/lib/stacks-academy";

export function AcademyContent() {
    const handleTestContract = async () => {
        console.log("🧪 [AcademyContent] Iniciando prueba del contrato...");
        try {
            await signContractCall();
        } catch (error) {
            console.error("🚨 [AcademyContent] Error en la prueba:", error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Botón de prueba fuera del WalletConnection */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                    🧪 Prueba de Contrato
                </h3>
                <p className="text-yellow-700 mb-3 text-sm">
                    Prueba la funcionalidad del contrato sin necesidad de conectar wallet
                </p>
                <button
                    onClick={handleTestContract}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                    Ejecutar signContractCall()
                </button>
            </div>

            {/* Componente normal con WalletConnection */}
            <WalletConnection>
                <AcademyDashboard />
            </WalletConnection>
        </div>
    );
}