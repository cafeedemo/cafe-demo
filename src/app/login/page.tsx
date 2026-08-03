import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Blobs } from "@/components/ui/Blobs";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <>
      <Navbar />
      <main className="relative flex flex-1 items-center justify-center px-6 py-20">
        <Blobs />
        <div className="glass-card glow-purple w-full max-w-md rounded-3xl p-8">
          <div className="text-center">
            <h1 className="font-heading text-3xl font-bold">
              Welcome <span className="gradient-text">back</span>
            </h1>
            <p className="mt-2 text-sm text-ink-dim">
              Sign in to manage your cafe or view your dashboard.
            </p>
          </div>
          <div className="mt-8">
            <LoginForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
