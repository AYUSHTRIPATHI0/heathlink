"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plus, MoreHorizontal, Trash2, Edit, AlertTriangle, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

type Task = {
  id: string;
  taskText: string;
  isCompleted: boolean;
};

export default function TodoPage() {
  const [user] = useAuthState(auth);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState("");

  const selectedDateKey = date ? format(date, "yyyy-MM-dd") : "";

  useEffect(() => {
    if (user && selectedDateKey) {
      setLoading(true);
      const todoListRef = doc(db, "users", user.uid, "dailyToDoLists", selectedDateKey);
      getDoc(todoListRef).then((docSnap) => {
        if (docSnap.exists()) {
          setTasks(docSnap.data().tasks || []);
        } else {
          setTasks([]);
        }
        setLoading(false);
      });
    }
  }, [user, selectedDateKey]);
  
  const completedTasks = tasks.filter((t) => t.isCompleted).length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  useEffect(() => {
    if (editingTask) {
      setEditingTaskTitle(editingTask.taskText);
      setIsEditDialogOpen(true);
    } else {
      setIsEditDialogOpen(false);
    }
  }, [editingTask]);

  const handleAddTask = async () => {
    if (newTaskTitle.trim() && selectedDateKey && user) {
      const newTask: Task = {
        id: Date.now().toString(),
        taskText: newTaskTitle.trim(),
        isCompleted: false,
      };
      const todoListRef = doc(db, "users", user.uid, "dailyToDoLists", selectedDateKey);
      const docSnap = await getDoc(todoListRef);
      if(docSnap.exists()){
        await updateDoc(todoListRef, { tasks: [...tasks, newTask] });
      } else {
        await setDoc(todoListRef, { date: selectedDateKey, tasks: [newTask] });
      }
      setTasks([ ...tasks, newTask]);
      setNewTaskTitle("");
      setIsAddDialogOpen(false);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    if (!user || !selectedDateKey) return;
    const taskList = [...tasks];
    const taskIndex = taskList.findIndex((t) => t.id === taskId);
    if(taskIndex === -1) return;
    
    const updatedTask = { ...taskList[taskIndex], isCompleted: !taskList[taskIndex].isCompleted };
    taskList[taskIndex] = updatedTask;

    const todoListRef = doc(db, "users", user.uid, "dailyToDoLists", selectedDateKey);
    await updateDoc(todoListRef, { tasks: taskList });
    setTasks(taskList);
  };
  
  const handleDeleteTask = async (taskId: string) => {
    if (!user || !selectedDateKey) return;
    const updatedTasks = tasks.filter(t => t.id !== taskId);
    
    const todoListRef = doc(db, "users", user.uid, "dailyToDoLists", selectedDateKey);
    await updateDoc(todoListRef, { tasks: updatedTasks });
    setTasks(updatedTasks);
  };
  
  const handleEditTask = async () => {
    if (editingTask && editingTaskTitle.trim() && selectedDateKey && user) {
        const taskList = [...tasks];
        const taskIndex = taskList.findIndex(t => t.id === editingTask.id);
        if(taskIndex === -1) return;

        const updatedTask = { ...taskList[taskIndex], taskText: editingTaskTitle.trim() };
        taskList[taskIndex] = updatedTask;

        const todoListRef = doc(db, "users", user.uid, "dailyToDoLists", selectedDateKey);
        await updateDoc(todoListRef, { tasks: taskList });

        setTasks(taskList);
        setEditingTask(null);
        setEditingTaskTitle("");
    }
  }


  return (
    <Card className="shadow-xl">
       <CardHeader>
        <div className="space-y-4">
            <div>
                <CardTitle className="text-2xl font-headline">My To-Do List</CardTitle>
                <CardDescription className="mt-1">
                    Manage your health tasks for {date ? format(date, "PPP") : "the day"}.
                </CardDescription>
            </div>
            <div className="flex justify-end items-center gap-2 flex-shrink-0">
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                        "w-full sm:w-[240px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                    </PopoverContent>
                </Popover>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add Task
                    </Button>
                    </DialogTrigger>
                    <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add a new task</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => { e.preventDefault(); handleAddTask(); }}>
                        <div className="grid gap-4 py-4">
                        <Input
                            placeholder="e.g. Meditate for 10 minutes"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            autoFocus
                        />
                        </div>
                        <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Add Task</Button>
                        </DialogFooter>
                    </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {totalTasks > 0 && (
          <div className="mb-4 space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{completedTasks} of {totalTasks} completed</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
        <div className="space-y-3">
          {loading ? (
             <div className="text-center py-16 text-muted-foreground">
                <p>Loading tasks...</p>
             </div>
          ) : tasks.length > 0 ? (
            tasks.map((task) => (
              <div
                key={task.id}
                className={cn(
                  "flex items-center p-3 rounded-lg bg-secondary group transition-all",
                  task.isCompleted && "bg-secondary/60"
                )}
              >
                <Checkbox id={`task-${task.id}`} checked={task.isCompleted} onCheckedChange={() => handleToggleTask(task.id)} className="mr-4 !h-5 !w-5" />
                <Label htmlFor={`task-${task.id}`} className={cn("flex-grow cursor-pointer text-base", task.isCompleted && "line-through text-muted-foreground")}>
                  {task.taskText}
                </Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => setEditingTask(task)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle />Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription className="text-left">
                            This action cannot be undone. This will permanently delete the task: "{task.taskText}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteTask(task.id)}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          ) : (
            <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
              <Check className="mx-auto h-12 w-12 text-green-500" />
              <h3 className="mt-4 text-lg font-medium text-foreground">All Tasks Completed!</h3>
              <p className="mt-1">Looks like you're all done for today. Great job!</p>
              <Button variant="outline" className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add a new task
              </Button>
            </div>
          )}
        </div>
      </CardContent>
      {editingTask && (
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => !open && setEditingTask(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit task</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); handleEditTask(); }}>
              <div className="grid gap-4 py-4">
                <Input
                  value={editingTaskTitle}
                  onChange={(e) => setEditingTaskTitle(e.target.value)}
                  autoFocus
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
