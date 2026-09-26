'use client';

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/useAuthStore"
import { api } from "@/lib/api"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const { setToken, setUser } = useAuthStore();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', data);
      const { token, role } = response.data;
      setToken(token);
      setUser({ sub: data.username, role });
      router.push('/dashboard');
    } catch (err: unknown) {
      void err;
      setError('Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      className="w-full max-w-sm text-white backdrop-blur-xl shadow-2xl"
      style={{
        background: 'linear-gradient(135deg, #1a133099 0%, #2e205080 100%)',
        border: '1px solid #9a99e130',
        boxShadow: '0 25px 60px #020003cc, 0 0 40px #9043d520',
      }}
      {...props}
    >
      <CardHeader>
        <CardTitle className="text-white text-lg">Login to your account</CardTitle>
        <CardDescription style={{ color: 'var(--muted-foreground)', fontSize: '0.75rem' }}>
          Enter your username below to login to your account
        </CardDescription>
        <CardAction>
          <Button variant="link" className="text-xs p-0 h-auto" style={{ color: 'var(--secondary-accent)' }}>
            Sign Up
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-5">
            {error && (
              <div
                className="rounded-md p-3 text-xs"
                style={{ background: '#3d0a1a80', border: '1px solid #e0607e40', color: '#f48fb1' }}
              >
                {error}
              </div>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="username" className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="username"
                required
                className="text-white placeholder:text-zinc-600"
                style={{
                  background: '#1e153580',
                  border: '1px solid #2e2050',
                  outline: 'none',
                }}
                onFocus={e => (e.currentTarget.style.border = '1px solid #9a99e180')}
                onBlur={e  => (e.currentTarget.style.border = '1px solid #2e2050')}
                {...register('username')}
              />
              {errors.username && (
                <p className="text-xs text-red-400">{errors.username.message}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password" className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Password</Label>
                <a
                  href="#"
                  className="ml-auto inline-block text-xs underline-offset-4 hover:underline transition-colors"
                  style={{ color: 'var(--muted-foreground)' }}
                  onMouseEnter={e => ((e.target as HTMLElement).style.color = '#be74be')}
                  onMouseLeave={e => ((e.target as HTMLElement).style.color = 'var(--muted-foreground)')}
                >
                  Forgot your password?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                required
                className="text-white"
                style={{
                  background: '#1e153580',
                  border: '1px solid #2e2050',
                }}
                onFocus={e => (e.currentTarget.style.border = '1px solid #9a99e180')}
                onBlur={e  => (e.currentTarget.style.border = '1px solid #2e2050')}
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              id="login-submit-btn"
              disabled={isLoading}
              className="w-full flex justify-center items-center mt-1 text-white border-0 shadow-lg transition-all duration-200"
              style={{
                background: 'var(--grad-primary)',
                boxShadow: '0 4px 20px #9043d540',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '0.88')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}
            >
              {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Login'}
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button
          variant="outline"
          type="button"
          className="w-full flex justify-center gap-2 text-white hover:text-white transition-colors"
          style={{
            background: 'transparent',
            border: '1px solid #2e2050',
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#9a99e110')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4 fill-current">
            <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1.607 6.033 1.607 12s4.426 11 10.633 11c6.478 0 10.793-4.537 10.793-10.986 0-.746-.08-1.32-.176-1.886H12.24z"/>
          </svg>
          Login with Google
        </Button>
      </CardFooter>
    </Card>
  )
}
