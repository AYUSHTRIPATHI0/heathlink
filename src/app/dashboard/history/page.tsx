"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { HeartPulse, Footprints, Flame, BrainCircuit, ListTodo, CheckCircle2, Circle } from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

type HealthLog = {
  heartRate: number;
  steps: number;
  calories: number;
};

type Prediction = {
  predictionReport: string;
};

type Task = {
  id: string;
  taskText: string;
  isCompleted: boolean;
};

type ToDoList = {
  tasks: Task[];
};

type HistoryData = {
  metrics: HealthLog | null;
  prediction: Prediction | null;
  tasks: ToDoList | null;
};

export default function HistoryPage() {
  const [user] = useAuthState(auth);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedData, setSelectedData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHistoryData = async () => {
      if (!user || !date) return;

      setLoading(true);
      const dateKey = format(date, "yyyy-MM-dd");

      const healthLogRef = doc(db, "users", user.uid, "dailyHealthLogs", dateKey);
      const predictionRef = doc(db, "users", user.uid, "healthPredictions", dateKey);
      const todoListRef = doc(db, "users", user.uid, "dailyToDoLists", dateKey);

      try {
        const [healthLogSnap, predictionSnap, todoListSnap] = await Promise.all([
          getDoc(healthLogRef),
          getDoc(predictionRef),
          getDoc(todoListRef)
        ]);
        
        const data: HistoryData = {
            metrics: healthLogSnap.exists() ? healthLogSnap.data() as HealthLog : null,
            prediction: predictionSnap.exists() ? predictionSnap.data() as Prediction : null,
            tasks: todoListSnap.exists() ? todoListSnap.data() as ToDoList : null
        }
  
        setSelectedData(data);
      } catch(e) {
        console.error("Error fetching history data", e);
        setSelectedData(null);
      }
      setLoading(false);
    };

    fetchHistoryData();
  }, [user, date]);


  return (
    <div className="grid lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-1 space-y-8">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Select a Date</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="w-full sm:w-auto"
              disabled={(d) => d > new Date() || d < new Date("2020-01-01")}
            />
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-8">
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              Health Log for {date ? format(date, "PPP") : "..."}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
                 <div className="space-y-6">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-32 w-full" />
                 </div>
            ) : selectedData && (selectedData.metrics || selectedData.prediction || selectedData.tasks) ? (
              <div className="space-y-6">
                {/* Metrics */}
                {selectedData.metrics && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2"><HeartPulse className="text-primary"/> Daily Metrics</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-secondary rounded-lg">
                      <div className="flex items-center gap-2 text-muted-foreground"><HeartPulse size={16}/> Heart Rate</div>
                      <div className="text-xl font-bold">{selectedData.metrics.heartRate} bpm</div>
                    </div>
                    <div className="p-4 bg-secondary rounded-lg">
                      <div className="flex items-center gap-2 text-muted-foreground"><Footprints size={16}/> Steps</div>
                      <div className="text-xl font-bold">{selectedData.metrics.steps.toLocaleString()}</div>
                    </div>
                    <div className="p-4 bg-secondary rounded-lg">
                      <div className="flex items-center gap-2 text-muted-foreground"><Flame size={16}/> Calories</div>
                      <div className="text-xl font-bold">{selectedData.metrics.calories.toLocaleString()} kcal</div>
                    </div>
                  </div>
                </div>
                )}

                {/* AI Prediction */}
                {selectedData.prediction && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg flex items-center gap-2"><BrainCircuit className="text-primary"/> AI Prediction</h3>
                  <div className="p-4 bg-secondary rounded-lg">
                    <p className="font-medium">{selectedData.prediction.predictionReport}</p>
                  </div>
                </div>
                )}

                {/* Tasks */}
                {selectedData.tasks && selectedData.tasks.tasks.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg flex items-center gap-2"><ListTodo className="text-primary"/> Completed Tasks</h3>
                  <ul className="space-y-2">
                    {selectedData.tasks.tasks.map((task: any) => (
                      <li key={task.id} className="flex items-center gap-2 p-2 bg-secondary rounded-lg">
                        {task.isCompleted ? <CheckCircle2 className="text-green-500" /> : <Circle className="text-muted-foreground"/>}
                        <span className={task.isCompleted ? '' : 'text-muted-foreground'}>{task.taskText}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                )}

              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                <p>No health data logged for this day.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
