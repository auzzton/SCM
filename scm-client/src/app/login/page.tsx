import { GalleryVerticalEnd } from "lucide-react"
import { LoginForm } from "@/components/login-form"
import { ShaderBackground } from "@/components/ui/green-border"

export default function LoginPage() {
  return (
    <div className="relative min-h-svh w-full overflow-hidden bg-black text-white">
      {/* Full-screen animated WebGL shader background */}
      <ShaderBackground className="absolute inset-0 h-full w-full" />

      {/* Dark overlay to deepen contrast behind the form */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Page content */}
      <div className="relative z-10 flex min-h-svh flex-col">
        {/* Top nav bar */}
        <header className="flex items-center justify-between px-8 py-6">
          <a href="#" className="flex items-center gap-2.5 font-semibold text-white">
            <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500 shadow-lg shadow-emerald-500/40">
              <GalleryVerticalEnd className="size-4 text-black" />
            </div>
            <span className="text-sm tracking-tight">NexSCM Inc.</span>
          </a>
          <p className="font-mono text-[10px] text-zinc-500">v1.4.2-PROD</p>
        </header>

        {/* Centered form */}
        <main className="flex flex-1 items-center justify-center px-4 py-12">
          <div className="w-full max-w-sm">
            <LoginForm />
          </div>
        </main>

        {/* Footer */}
        <footer className="px-8 py-5 text-center">
          <p className="text-xs text-zinc-600">
            &copy; 2026 NexSCM Inc. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  )
}

