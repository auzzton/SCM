import { GalleryVerticalEnd } from "lucide-react"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-black text-white">
      <div className="flex flex-col gap-4 p-6 md:p-10 justify-between bg-black">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium text-white">
            <div className="flex size-6 items-center justify-center rounded-md bg-blue-600 text-white">
              <GalleryVerticalEnd className="size-4" />
            </div>
            NexSCM Inc.
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <LoginForm />
          </div>
        </div>
        <div className="text-center md:text-left">
          <p className="text-xs text-zinc-500">
            &copy; 2026 NexSCM Inc. All rights reserved.
          </p>
        </div>
      </div>
      <div className="relative hidden bg-black lg:block overflow-hidden">
        <img
          src="/login_bg.png"
          alt="Dashboard Mockup"
          style={{ filter: "blur(80px)" }}
          className="absolute inset-0 h-full w-full object-cover opacity-50 scale-125 select-none pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-between p-16 text-white z-10">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-600 shadow-lg shadow-blue-500/30">
              <GalleryVerticalEnd className="size-5 text-white" />
            </div>
            <span className="font-semibold text-lg tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              NexSCM
            </span>
          </div>
          <div className="space-y-4 max-w-md">
            <h2 className="text-4xl font-bold tracking-tight leading-tight bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
              Optimize your supply chain with real-time analytics
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              NexSCM enables end-to-end visibility, automated order routing, and AI-powered demand forecasting.
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-mono">
              v1.4.2-PROD
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

