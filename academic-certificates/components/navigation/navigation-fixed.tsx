"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import { School, Users, Settings } from "lucide-react";

interface NavigationProps {
    user?: any;
}

export function Navigation({ user, className }: NavigationProps & { className?: string }) {
    const pathname = usePathname();

    const navItems = [
        {
            href: "/",
            label: "Inicio",
            icon: null,
            public: true
        },
        {
            href: "/explorer",
            label: "Explorador",
            description: "Consultar certificados públicos",
            public: true
        },
        {
            href: "/validator",
            label: "Validador",
            icon: null,
            description: "Validar certificados",
            public: true
        },
        {
            href: "/academy",
            label: "Academia",
            icon: School,
            description: "Emitir certificados",
            roles: ["academy", "admin"]
        },
        {
            href: "/student",
            label: "Estudiante",
            icon: Users,
            description: "Ver mis certificados",
            roles: ["student", "admin"]
        },
        {
            href: "/admin",
            label: "Admin",
            icon: Settings,
            description: "Gestionar sistema",
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
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-2 px-2 py-1.5 text-sm/6 rounded ${isActive ? "bg-black/5 dark:bg-white/10" : "hover:bg-black/5 dark:hover:bg-white/10"
                                }`}
                        >
                            {Icon && <Icon className="h-4 w-4" />}
                            {item.label}
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
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
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
                            {item.label}
                        </Link>
                    </Button>
                );
            })}
        </nav>
    );
}