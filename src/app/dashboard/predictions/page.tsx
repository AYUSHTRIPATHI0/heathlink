"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { getHealthPrediction, type HealthPredictionInput, type HealthPredictionOutput } from "@/ai/flows/health-predictions-recommendations";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { BrainCircuit, Pill, Stethoscope, Phone, HeartPulse, Footprints, Flame, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { format } from "date-fns";


const predictionFormSchema = z.object({
  heartRate: z.coerce.number().min(30, "Invalid heart rate").max(220, "Invalid heart rate"),
  steps: z.coerce.number().min(0, "Steps can't be negative"),
  calories: z.coerce.number().min(0, "Calories can't be negative"),
  age: z.coerce.number().min(1, "Age must be at least 1").max(120, "Age is out of range"),
  gender: z.enum(["male", "female", "other"]),
  existingConditions: z.string().optional(),
});

export default function PredictionsPage() {
  const [user] = useAuthState(auth);
  const [prediction, setPrediction] = useState<HealthPredictionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof predictionFormSchema>>({
    resolver: zodResolver(predictionFormSchema),
    defaultValues: {
      heartRate: "" as any,
      steps: "" as any,
      calories: "" as any,
      age: "" as any,
      gender: undefined,
      existingConditions: "",
    },
  });

  async function onSubmit(values: z.infer<typeof predictionFormSchema>) {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Not Authenticated",
        description: "You must be logged in to get predictions.",
      });
      return;
    }

    setIsLoading(true);
    setPrediction(null);
    try {
      const result = await getHealthPrediction(values as HealthPredictionInput);
      setPrediction(result);

      const dateKey = format(new Date(), "yyyy-MM-dd");

      // Save daily health log
      const healthLogRef = doc(db, "users", user.uid, "dailyHealthLogs", dateKey);
      await setDoc(healthLogRef, {
        heartRate: values.heartRate,
        steps: values.steps,
        calories: values.calories,
        date: dateKey,
      }, { merge: true });

      // Save prediction
      const predictionRef = doc(db, "users", user.uid, "healthPredictions", dateKey);
      await setDoc(predictionRef, {
        inputStats: values,
        predictionReport: result.prediction,
        suggestedMedication: result.suggestedMedication,
        doctorReference: result.doctorReference,
        timestamp: serverTimestamp(),
      });


    } catch (error) {
      console.error("Prediction error:", error);
      toast({
        variant: "destructive",
        title: "Prediction Failed",
        description: "Could not generate a prediction. Please try again.",
      })
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="shadow-xl">
      <div className="grid lg:grid-cols-5 items-start">
        <div className="lg:col-span-2 lg:border-r">
          <CardHeader>
            <CardTitle className="text-2xl font-headline flex items-center gap-2">
              <HeartPulse/> Health Prediction
            </CardTitle>
            <CardDescription>
              Enter your stats for an AI-powered analysis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid sm:grid-cols-3 gap-4">
                  <FormField control={form.control} name="heartRate" render={({ field }) => (
                      <FormItem><FormLabel className="flex items-center gap-1"><HeartPulse size={14}/>Rate</FormLabel><FormControl><Input type="number" placeholder="80" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="steps" render={({ field }) => (
                      <FormItem><FormLabel className="flex items-center gap-1"><Footprints size={14}/>Steps</FormLabel><FormControl><Input type="number" placeholder="5000" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="calories" render={({ field }) => (
                      <FormItem><FormLabel className="flex items-center gap-1"><Flame size={14}/>Calories</FormLabel><FormControl><Input type="number" placeholder="1200" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="age" render={({ field }) => (
                  <FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" placeholder="30" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="gender" render={({ field }) => (
                      <FormItem><FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl>
                          <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                      </Select><FormMessage /></FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="existingConditions" render={({ field }) => (
                    <FormItem><FormLabel>Existing Conditions (optional)</FormLabel><FormControl><Textarea placeholder="e.g., Asthma, Diabetes" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Analyzing..." : "Get Prediction"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </div>

        <div className="lg:col-span-3 min-h-[500px]">
          <CardHeader className="border-b lg:border-0">
            <CardTitle className="text-2xl font-headline flex items-center gap-2">
              <Bot /> AI Health Report
            </CardTitle>
            <CardDescription>
              Your personalized insights will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading && (
              <div className="space-y-8 animate-pulse">
                <div className="space-y-4"> <Skeleton className="h-7 w-1/3" /> <Skeleton className="h-5 w-full" /> <Skeleton className="h-5 w-5/6" /> </div>
                <Separator/>
                <div className="space-y-4"> <Skeleton className="h-7 w-1/3" /> <Skeleton className="h-5 w-full" /> </div>
                <Separator/>
                <div className="space-y-4"> <Skeleton className="h-7 w-1/3" /> <Skeleton className="h-6 w-1/2" /> <Skeleton className="h-4 w-1/3" /> <Skeleton className="h-10 w-40 mt-2" /> </div>
              </div>
            )}

            {!isLoading && prediction && (
              <div className="space-y-8">
                <div>
                  <h3 className="font-headline text-xl flex items-center gap-2 mb-3 text-primary"><BrainCircuit /> AI Prediction</h3>
                  <p className="text-lg font-semibold text-foreground">{prediction.prediction}</p>
                </div>
                <Separator/>
                <div>
                  <h3 className="font-headline text-xl flex items-center gap-2 mb-3 text-primary"><Pill /> Lifestyle Recommendations</h3>
                  <p className="text-muted-foreground">{prediction.suggestedMedication}</p>
                </div>
                <Separator/>
                <div>
                  <h3 className="font-headline text-xl flex items-center gap-2 mb-3 text-primary"><Stethoscope /> Suggested Specialist</h3>
                  <div className="space-y-1">
                    <p className="font-bold text-xl text-foreground">{prediction.doctorReference.name}</p>
                    <p className="text-base text-muted-foreground font-medium">{prediction.doctorReference.specialization}</p>
                    <div className="flex items-center gap-2 pt-2">
                      <Button size="sm">
                        <Phone className="mr-2 h-4 w-4" />
                        {prediction.doctorReference.contact}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!isLoading && !prediction && (
                <div className="text-center h-full flex flex-col justify-center items-center text-muted-foreground py-16">
                    <p>Your AI-generated health report will appear here after you submit your stats.</p>
                </div>
            )}
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
