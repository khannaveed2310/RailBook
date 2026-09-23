import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    registered?: string;
  }>;
}) {
  const params = await searchParams;

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Login to continue your railway booking journey."
    >
      {params.registered === "true" && (
        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Account created successfully. Please login to continue.
        </div>
      )}

      <LoginForm />
    </AuthLayout>
  );
}