"use client"
export function Navigation({ user }: NavigationProps) {
    const pathname = usePathname();

    const navItems = [ort Link from "next/link";
    import { usePathname } from "next/navigation";
    import { Button } from "./ui/button";
    import { Badge } from "./ui/badge";
    import { School, Users, Settings, Eye } from "lucide-react";

    interface NavigationProps {
        user?: any;
    }

    export function Navigation({ user }: NavigationProps) {
        const pathname = usePathname();

        if (!user) return null;

        const navItems = [
            {
                href: "/",
                label: "Inicio",
                icon: null
            },
            {
                href: "/explorer",
                label: "Explorador",
                icon: Eye,
                description: "Consultar certificados públicos",
                public: true
            },
            {
                href: "/academy",
                label: "Academia",
                icon: School,
                description: "Emitir certificados"
            },
            {
                href: "/student",
                label: "Estudiante",
                icon: Users,
                description: "Ver mis certificados"
            },
            {
                href: "/admin",
                label: "Admin",
                icon: Settings,
                description: "Gestionar sistema"
            }
        ]; return (
            <nav className="flex items-center gap-2">
                {navItems.map((item) => {
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