"use client";

import { useTranslation } from "react-i18next";
import { StacksProvider } from "@/lib/stacks-provider";
import { WalletConnection } from "@/components/wallet-connection";
import { AdminNewDashboard } from "@/app/admin/components/admin-new-dashboard";
import { SchoolManagement } from "@/app/admin/components/manager/school-management";
import { CreditManagement } from "@/app/admin/components/manager/credit-management";
import { CertificateManagement } from "@/app/admin/components/manager/certificate-management";
import { DataContractManagement, DataAdminSettings } from "@/app/admin/components/data";


export function AdminContent() {
    const { t } = useTranslation();
    
    return (
        <StacksProvider>
            <WalletConnection>
                <AdminNewDashboard />

                {/* Gestión de Certificate Manager (Lógica de Negocio) */}
                <div className="space-y-6 mt-6">
                    <h2 className="text-2xl font-bold text-foreground">
                        {t("admin.dashboard.managerTitle")}
                    </h2>
                    <SchoolManagement />
                    <CreditManagement />
                    <CertificateManagement />
                </div>

                {/* Gestión de Certificate Data (Capa de Almacenamiento) */}
                <div className="space-y-6 mt-8 pt-8 border-t">
                    <h2 className="text-2xl font-bold text-foreground">
                        {t("admin.dashboard.dataTitle")}
                    </h2>
                    <DataContractManagement />
                    <DataAdminSettings />
                </div>
            </WalletConnection>
        </StacksProvider>
    );
}