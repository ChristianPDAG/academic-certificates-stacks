"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { School, Users, Settings } from "lucide-react";

interface NavigationProps {
    user?: any;
}

export function Navigation({ user, className }: NavigationProps & { className?: string }) {
    const pathname = usePathname();
    const { t } = useTranslation();

    const navItems = [
        {
            href: "/",
            labelKey: "navbar.home",
            icon: null,
            public: true
        },
        {
            href: "/explorer",
            labelKey: "navbar.explorer",
            description: "Consultar certificados públicos",
            public: true
        },
        {
            href: "/validator",
            labelKey: "navbar.validator",
            icon: null,
            description: "Validar certificados",
            public: true
        },
        {
            href: "/blog",
            labelKey: "navbar.blog",
            icon: null,
            description: "Artículos y noticias",
            public: true
        },
        {
            href: "/academy",
            labelKey: "navbar.academy",
            icon: School,
            description: "Emitir certificados",
            roles: ["academy"]
        },
        {
            href: "/academy/profile",
            labelKey: "navbar.academyProfile",
            icon: School,
            description: "Gestionar perfil de academia",
            roles: ["academy"]
        },
        {
            href: "/academy/certificates",
            labelKey: "navbar.academyCertificates",
            icon: School,
            description: "Gestionar certificados de academia",
            roles: ["academy"]
        },
        {
            href: "/academy/courses",
            labelKey: "navbar.academyCourses",
            icon: School,
            description: "Gestionar cursos de academia",
            roles: ["academy"]
        },
        {
            href: "/student",
            labelKey: "navbar.student",
            icon: Users,
            description: "Ver mis certificados",
            roles: ["student"]
        },
        {
            href: "/admin",
            labelKey: "navbar.admin",
            icon: Settings,
            description: "Gestionar sistema",
            roles: ["admin"]
        },
        {
            href: "/admin/academies",
            labelKey: "navbar.adminAcademies",
            icon: Settings,
            description: "Gestionar academias",
            roles: ["admin"]
        }
    ];

    // Obtener el rol del usuario
    const userRole = user?.role;

    // Filtrar elementos según si el usuario está logueado y su rol
    const visibleItems = navItems.filter(item => {
        // Mostrar items públicos siempre
        if (item.public) return true;

        // Si no hay usuario, solo mostrar items públicos
        if (!user) return false;

        // Si el item no tiene roles definidos, no mostrarlo (ya que no es público)
        if (!item.roles) return false;

        // Mostrar si el rol del usuario está en la lista de roles permitidos
        return item.roles.includes(userRole);
    });

    // Determinar si estamos en un menú móvil o en el menú principal
    const isMenuItems = className?.includes("MenuItems");

    if (isMenuItems) {
        // Versión móvil (dentro de MenuItems)
        return (
            <div className={`flex flex-col gap-1 ${className || ''}`}>
                {visibleItems.map((item) => {
                    // Solo marcar como activo si hay coincidencia exacta
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-2 px-2 py-1.5 text-sm/6 rounded ${isActive ? "bg-accent" : "hover:bg-accent"
                                }`}
                        >
                            {Icon && <Icon className="h-4 w-4" />}
                            {t(item.labelKey)}
                        </Link>
                    );
                })}
            </div>
        );
    }

    // Versión de escritorio (menú normal)
    return (
        <nav className={`flex items-center gap-2 ${className || ''}`}>
            {visibleItems.map((item) => {
                // Solo marcar como activo si hay coincidencia exacta
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                    <Button
                        key={item.href}
                        asChild
                        size="sm"
                        variant={isActive ? "default" : "ghost"}
                        className="relative"
                    >
                        <Link href={item.href} className="flex items-center gap-2">
                            {Icon && <Icon className="h-4 w-4" />}
                            {t(item.labelKey)}
                        </Link>
                    </Button>
                );
            })}
        </nav>
    );
}