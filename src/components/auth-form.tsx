"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { HeartPulse, Eye, EyeOff } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, fetchSignInMethodsForEmail } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const isLogin = mode === "login";
  const schema = isLogin ? loginSchema : signupSchema;

  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, data.email, data.password);
        toast({
          title: "Login Successful",
          description: "Redirecting to your dashboard...",
        });
        router.push("/dashboard");
      } else {
        const signupData = data as z.infer<typeof signupSchema>;
        // Check if user already exists
        const methods = await fetchSignInMethodsForEmail(auth, signupData.email);
        if (methods.length > 0) {
          toast({
            variant: "destructive",
            title: "Signup Failed",
            description: "An account with this email already exists. Please log in.",
          });
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, signupData.email, signupData.password);
        const user = userCredential.user;
        
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          name: signupData.name,
          email: signupData.email,
        });

        toast({
            title: "Signup Successful!",
            description: "Your account has been created. Please log in to continue.",
        });
        router.push("/login");
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      let description = "An unexpected error occurred.";
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        description = "The credentials you entered are incorrect. Please try again.";
      } else if (error.code === 'auth/email-already-in-use') {
        description = "An account with this email already exists. Please log in.";
      }
      
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: description,
      });
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary">
        <Card className="w-full max-w-md mx-4 shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <Link href="/" className="flex items-center justify-center gap-2 font-bold text-2xl mb-4">
              <HeartPulse className="w-8 h-8 text-primary" />
              <span className="font-headline">HealthSync</span>
            </Link>
            <CardTitle className="text-2xl font-headline">
              {isLogin ? "Welcome Back" : "Create an Account"}
            </CardTitle>
            <CardDescription>
              {isLogin
                ? "Enter your credentials to access your account"
                : "Enter your details to get started"}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
             <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
              {!isLogin && (
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" type="text" placeholder="John Doe" {...register("name")} />
                  {errors.name && <p className="text-sm text-destructive">{(errors as any).name.message}</p>}
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" {...register("email")} />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  {isLogin && (
                    <Link
                      href="#"
                      className="ml-auto inline-block text-sm underline"
                    >
                      Forgot your password?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    {...register("password")} 
                    className="pr-10"
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="absolute inset-y-0 right-0 h-full w-10 text-muted-foreground"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                  </Button>
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : isLogin ? "Login" : "Sign Up"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="mt-4 text-center text-sm">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <Link href={isLogin ? "/signup" : "/login"} className="underline">
                {isLogin ? "Sign up" : "Login"}
              </Link>
            </div>
          </CardFooter>
        </Card>
    </div>
  );
}
