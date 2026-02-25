'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { IconGlobe, IconChevronDown } from '@tabler/icons-react';

const LanguageSelector = () => {
    const { i18n, t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const languages = [
        { code: 'en', name: t('languages.english'), flag: '🇺🇸' },
        { code: 'es', name: t('languages.spanish'), flag: '🇪🇸' },
    ];

    const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];

    const changeLanguage = (langCode: string) => {
        i18n.changeLanguage(langCode);
        setIsOpen(false);
        // Dispatch custom event to notify other components about language change
        window.dispatchEvent(new Event('languageChanged'));
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-background/50 border border-border rounded-lg hover:bg-accent transition-all text-foreground font-medium h-9 min-w-[44px]"
                aria-label={t('languages.selectLanguage')}
            >
                <IconGlobe className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline text-sm shrink-0">{currentLanguage.flag}</span>
                <IconChevronDown
                    className={`h-3 w-3 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-background border border-border rounded-lg shadow-lg z-[60] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
                    <div className="py-1">
                        {languages.map((language) => (
                            <button
                                key={language.code}
                                onClick={() => changeLanguage(language.code)}
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors flex items-center gap-3 ${
                                    i18n.language === language.code
                                        ? 'text-primary font-semibold bg-accent/50'
                                        : 'text-foreground font-medium'
                                }`}
                            >
                                <span className="text-base">{language.flag}</span>
                                <span className="flex-1">{language.name}</span>
                                {i18n.language === language.code && (
                                    <span className="text-primary font-bold">✓</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LanguageSelector;
