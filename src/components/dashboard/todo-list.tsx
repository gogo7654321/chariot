import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

const tasks = [
    { id: 'task1', label: 'Finish APUSH Chapter 12 notes', due: 'Tomorrow', priority: 'High', class: 'AP US History' },
    { id: 'task2', label: 'Complete Calculus Problem Set 5', due: 'In 3 days', priority: 'High', class: 'AP Calculus' },
    { id: 'task3', label: 'Read "The Great Gatsby" Ch 1-3', due: 'In 5 days', priority: 'Medium', class: 'AP English Lit' },
];

export default function TodoList() {
    return (
        <Card className="flex flex-col h-full">
            <CardHeader>
                <CardTitle>To-Do List</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
                <div className="space-y-4">
                    {tasks.map(task => (
                        <div key={task.id} className="flex items-start gap-3">
                            <Checkbox id={task.id} className="mt-1"/>
                            <div className="grid gap-1.5 leading-none">
                                <Label htmlFor={task.id} className="text-base font-normal">{task.label}</Label>
                                <p className="text-sm text-muted-foreground">
                                    Due: {task.due} • <span className={`${task.priority === 'High' ? 'text-destructive' : 'text-amber-600'}`}>{task.priority}</span> • {task.class}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full">
                    <Plus className="mr-2 h-4 w-4" /> Add Assignment
                </Button>
            </CardFooter>
        </Card>
    );
}
