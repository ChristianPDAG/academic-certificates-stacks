"use client";

import { StacksProvider } from "@/lib/stacks-provider";
import { WalletConnection } from "@/components/wallet-connection";
import { AdminDashboard } from "@/components/academy/admin-dashboard";

interface AdminContentProps {
    userClaims: any;
}

export function AdminContent({ userClaims }: AdminContentProps) {
    return (
        <StacksProvider>
            <WalletConnection>
                <AdminDashboard userClaims={userClaims} />
            </WalletConnection>
        </StacksProvider>
    );
}