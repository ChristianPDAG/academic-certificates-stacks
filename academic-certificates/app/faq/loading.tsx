"use client";

import { useTranslation } from "react-i18next";

export default function Loading() {
    const { t } = useTranslation();
    
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-gray-600">{t("explorer.loading")}</p>
            </div>
        </div>
    );
}