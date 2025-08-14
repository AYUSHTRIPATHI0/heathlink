"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Camera } from "lucide-react";
import { auth, db, storage } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState, useRef } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Skeleton } from "@/components/ui/skeleton";

const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }).optional(),
  age: z.coerce.number().min(1, "Age must be at least 1").max(120, "Age is out of range").optional(),
  gender: z.string().optional(),
  profileImageUrl: z.string().optional(),
});

export default function ProfilePage() {
  const { toast } = useToast();
  const [user, loading] = useAuthState(auth);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      age: "" as any,
      gender: "",
      profileImageUrl: "",
    },
  });

  useEffect(() => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      getDoc(userRef).then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          form.reset({
            name: data.name || '',
            email: user.email || '',
            age: data.age || '',
            gender: data.gender || '',
            profileImageUrl: data.profileImageUrl || '',
          });
        }
      });
    }
  }, [user, form]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user) {
      const storageRef = ref(storage, `profileImages/${user.uid}`);
      setIsSaving(true);
      try {
        await uploadBytes(storageRef, file);
        const photoURL = await getDownloadURL(storageRef);
        form.setValue("profileImageUrl", photoURL);
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { profileImageUrl: photoURL });
        toast({
          title: "Profile Photo Updated",
          description: "Your new photo has been saved.",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: "Could not upload your profile photo.",
        });
      } finally {
        setIsSaving(false);
      }
    }
  };


  async function onSubmit(values: z.infer<typeof profileSchema>) {
    if (!user) return;
    setIsSaving(true);
    const userRef = doc(db, "users", user.uid);
    try {
      // Exclude email from the update object as it's not supposed to be changed here
      const { email, ...updateData } = values;
      await updateDoc(userRef, updateData);
      toast({
        title: "Profile Updated",
        description: "Your information has been saved successfully.",
      });
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not save your profile information.",
      });
    } finally {
        setIsSaving(false);
    }
  }

  if (loading) {
    return (
        <Card className="max-w-2xl mx-auto shadow-xl">
            <CardHeader><Skeleton className="h-8 w-48" /></CardHeader>
            <CardContent className="space-y-8">
                 <div className="flex items-center space-x-6">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-40" />
                        <Skeleton className="h-5 w-60" />
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2"><Skeleton className="h-5 w-20" /><Skeleton className="h-10 w-full" /></div>
                    <div className="space-y-2"><Skeleton className="h-5 w-20" /><Skeleton className="h-10 w-full" /></div>
                </div>
                 <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2"><Skeleton className="h-5 w-20" /><Skeleton className="h-10 w-full" /></div>
                    <div className="space-y-2"><Skeleton className="h-5 w-20" /><Skeleton className="h-10 w-full" /></div>
                </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4 flex justify-end">
                <Skeleton className="h-10 w-28" />
            </CardFooter>
        </Card>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Profile Management</CardTitle>
        <CardDescription>Update your personal and health information.</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-8">
            <div className="flex flex-col items-center sm:flex-row sm:space-x-6 space-y-4 sm:space-y-0">
              <div className="relative group">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={form.watch('profileImageUrl')} />
                  <AvatarFallback>{form.watch('name')?.[0]}</AvatarFallback>
                </Avatar>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                <Button type="button" size="icon" onClick={handleAvatarClick} className="absolute bottom-0 right-0 rounded-full h-8 w-8 group-hover:bg-primary/90 transition-colors">
                    <Camera className="h-4 w-4" />
                    <span className="sr-only">Change Photo</span>
                </Button>
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <h2 className="text-2xl font-bold">{form.watch('name')}</h2>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="your.email@example.com" {...field} disabled value={user?.email || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                 <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Your age" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <FormControl>
                      <Input placeholder="Your gender" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4 flex justify-end">
            <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
