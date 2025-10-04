import { DeployButton } from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { Hero } from "@/components/hero";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ConnectSupabaseSteps } from "@/components/tutorial/connect-supabase-steps";
import { SignUpUserSteps } from "@/components/tutorial/sign-up-user-steps";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href={"/"}>Next.js Supabase Starter</Link>
              <div className="flex items-center gap-2">
                <DeployButton />
              </div>
            </div>
            {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
          </div>
        </nav>
        <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
          <Hero />
          <main className="flex-1 flex flex-col gap-6 px-4">
            <h2 className="font-medium text-xl mb-4">Sistema de Certificados Académicos</h2>

            {hasEnvVars ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Link href="/explorer" className="group">
                  <div className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-indigo-50 hover:bg-indigo-100">
                    <h3 className="font-semibold text-lg mb-2 text-indigo-900">🔍 Explorador Público</h3>
                    <p className="text-indigo-700 text-sm">
                      Consulta certificados públicamente sin necesidad de registro
                    </p>
                  </div>
                </Link>

                <Link href="/academy" className="group">
                  <div className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-blue-50 hover:bg-blue-100">
                    <h3 className="font-semibold text-lg mb-2 text-blue-900">🎓 Academia</h3>
                    <p className="text-blue-700 text-sm">
                      Emite certificados para tus estudiantes utilizando la blockchain de Stacks
                    </p>
                  </div>
                </Link>

                <Link href="/student" className="group">
                  <div className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-green-50 hover:bg-green-100">
                    <h3 className="font-semibold text-lg mb-2 text-green-900">👨‍🎓 Estudiante</h3>
                    <p className="text-green-700 text-sm">
                      Consulta y verifica tus certificados académicos almacenados en blockchain
                    </p>
                  </div>
                </Link>

                <Link href="/admin" className="group">
                  <div className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-purple-50 hover:bg-purple-100">
                    <h3 className="font-semibold text-lg mb-2 text-purple-900">⚙️ Administrador</h3>
                    <p className="text-purple-700 text-sm">
                      Gestiona academias autorizadas y administra el sistema
                    </p>
                  </div>
                </Link>
              </div>
            ) : (
              <ConnectSupabaseSteps />
            )}

            <div className="mt-8">
              <h3 className="font-medium text-lg mb-4">Características del Sistema</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">🔒 Seguridad Blockchain</h4>
                  <p className="text-sm text-gray-600">
                    Los certificados se almacenan de forma inmutable en la blockchain de Stacks
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">✅ Verificación Instantánea</h4>
                  <p className="text-sm text-gray-600">
                    Cualquier persona puede verificar la autenticidad de un certificado
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">🎓 Multi-Academia</h4>
                  <p className="text-sm text-gray-600">
                    Múltiples instituciones pueden emitir certificados en el mismo sistema
                  </p>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">💎 Propiedad del Estudiante</h4>
                  <p className="text-sm text-gray-600">
                    Los certificados se almacenan directamente en el wallet del estudiante
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p>
            Powered by{" "}
            <a
              href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              Supabase
            </a>
          </p>
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}
