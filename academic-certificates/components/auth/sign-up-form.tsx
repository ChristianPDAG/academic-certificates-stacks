"use client";

import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signup } from "@/app/actions/signup";


interface signUpFormProps {
  type: "student" | "academy";
}

export function SignUpForm({
  className,
  type,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & signUpFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const role = type === "academy" ? "academy" : "student";
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError(t("auth.signup.passwordMismatch"));
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/${role}`,
          data: { role: role, name: name },
        },
      });

      if (error) throw error;
      if (!data?.user?.id) {
        throw new Error("Sign up failed: no user returned");
      }

      await signup({ id: data.user.id, email, role, nombre: name });

      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {t(`auth.signup.${type}.title`)}
          </CardTitle>
          <CardDescription className="text-base">
            {t(`auth.signup.${type}.description`)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="nombre" className="text-sm font-medium">
                  {type === "academy" ? t("auth.signup.academyName") : t("auth.signup.name")}
                </Label>
                <Input
                  id="nombre"
                  type="text"
                  placeholder={type === "academy" ? t("auth.signup.academyNamePlaceholder") : t("auth.signup.namePlaceholder")}
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  {t("auth.signup.email")}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("auth.signup.emailPlaceholder")}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  {t("auth.signup.password")}
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t("auth.signup.passwordPlaceholder")}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="repeat-password" className="text-sm font-medium">
                  {t("auth.signup.confirmPassword")}
                </Label>
                <Input
                  id="repeat-password"
                  type="password"
                  placeholder={t("auth.signup.confirmPasswordPlaceholder")}
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  className="h-11"
                />
              </div>
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800">
                  {error}
                </div>
              )}
              <Button 
                type="submit" 
                className="w-full h-11 text-base font-medium bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-200" 
                disabled={isLoading}
              >
                {isLoading 
                  ? t("auth.signup.signingUp") 
                  : type === "academy" 
                    ? t("auth.signup.academySignUpButton") 
                    : t("auth.signup.signUpButton")}
              </Button>
            </div>
            <div className="mt-6 text-center text-sm text-muted-foreground">
              {t("auth.signup.alreadyHaveAccount")}{" "}
              <Link 
                href="/auth/login" 
                className="font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 underline underline-offset-4 transition-colors"
              >
                {t("auth.signup.login")}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
