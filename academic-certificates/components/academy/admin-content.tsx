"use client";

import { StacksProvider } from "@/lib/stacks-provider";
import { WalletConnection } from "@/components/wallet-connection";
import { AdminDashboard } from "@/components/academy/admin-dashboard";


export function AdminContent() {
    return (
        <StacksProvider>
            <WalletConnection>
                <AdminDashboard />
            </WalletConnection>
        </StacksProvider>
    );
}