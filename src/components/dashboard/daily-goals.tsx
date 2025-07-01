import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const goals = [
    { id: 'goal1', label: 'Finish 1 quiz' },
    { id: 'goal2', label: 'Review 10 flashcards' },
    { id: 'goal3', label: 'Study for 30 min' },
    { id: 'goal4', label: 'Plan tomorrow\'s schedule' },
];

export default function DailyGoals() {
    return (
        <Card className="flex flex-col h-full">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Daily Goals</CardTitle>
                    <span className="flex items-center gap-1 text-lg font-bold text-orange-500">
                        🔥
                        <span>5 day streak</span>
                    </span>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                 <div className="space-y-4">
                    {goals.map(goal => (
                        <div key={goal.id} className="flex items-center space-x-3">
                            <Checkbox id={goal.id} />
                            <Label htmlFor={goal.id} className="text-base font-normal">{goal.label}</Label>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
