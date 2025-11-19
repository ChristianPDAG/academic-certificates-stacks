import { SignUpForm } from "@/components/auth/sign-up-form";

export default function Page2() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm mt-12">
        <SignUpForm 
          type="academy"
        />
      </div>
    </div>
  );
}
