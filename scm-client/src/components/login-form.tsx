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
    <Card className="w-full max-w-sm bg-zinc-950/80 border-zinc-800 text-white" {...props}>
      <CardHeader>
        <CardTitle className="text-white">Login to your account</CardTitle>
        <CardDescription className="text-zinc-400">
          Enter your username below to login to your account
        </CardDescription>
        <CardAction>
          <Button variant="link" className="text-xs p-0 h-auto text-blue-400 hover:text-blue-300">Sign Up</Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-6">
            {error && (
              <div className="rounded-md bg-red-950/50 border border-red-900/50 p-3 text-xs text-red-300">
                {error}
              </div>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="username" className="text-zinc-300">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="username"
                required
                className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-blue-500"
                {...register('username')}
              />
              {errors.username && (
                <p className="text-xs text-red-400 mt-1">{errors.username.message}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password" className="text-zinc-300">Password</Label>
                <a
                  href="#"
                  className="ml-auto inline-block text-xs text-zinc-400 hover:text-blue-400 underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-blue-500"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" disabled={isLoading} className="w-full flex justify-center items-center mt-2 bg-blue-600 hover:bg-blue-700 text-white border-0">
              {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : 'Login'}
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button variant="outline" type="button" className="w-full flex justify-center gap-2 border-zinc-800 bg-transparent text-white hover:bg-zinc-900 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4 fill-current">
            <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 12.24 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.986 0-.746-.08-1.32-.176-1.886H12.24z"/>
          </svg>
          Login with Google
        </Button>
      </CardFooter>
    </Card>
  )
}
