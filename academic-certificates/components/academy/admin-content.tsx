"use client";

import { StacksProvider } from "@/lib/stacks-provider";
import { WalletConnection } from "@/components/wallet-connection";
import { AdminDashboard } from "@/components/academy/admin-dashboard";
import { AdminNewDashboard } from "@/components/academy/admin-new-dashboard";
import { SchoolManagement } from "@/components/academy/manager/school-management";
import { CreditManagement } from "@/components/academy/manager/credit-management";
import { CertificateManagement } from "@/components/academy/manager/certificate-management";
import { DataContractManagement, DataAdminSettings } from "@/components/academy/data";


export function AdminContent() {
    return (
        <StacksProvider>
            <WalletConnection>
                <AdminDashboard />
                <AdminNewDashboard />

                {/* Gestión de Certificate Manager (Lógica de Negocio) */}
                <div className="space-y-6 mt-6">
                    <h2 className="text-2xl font-bold text-foreground">
                        Certificate Manager - Lógica de Negocio
                    </h2>
                    <SchoolManagement />
                    <CreditManagement />
                    <CertificateManagement />
                </div>

                {/* Gestión de Certificate Data (Capa de Almacenamiento) */}
                <div className="space-y-6 mt-8 pt-8 border-t">
                    <h2 className="text-2xl font-bold text-foreground">
                        Certificate Data - Capa de Almacenamiento
                    </h2>
                    <DataContractManagement />
                    <DataAdminSettings />
                </div>
            </WalletConnection>
        </StacksProvider>
    );
}