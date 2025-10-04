"use client";

import { WalletConnection } from "@/components/wallet-connection";
import AcademyDashboard from "@/components/academy-dashboard";

export function AcademyContent() {
    return (
        <WalletConnection>
            <AcademyDashboard />
        </WalletConnection>
    );
}