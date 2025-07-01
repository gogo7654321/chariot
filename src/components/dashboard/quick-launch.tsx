import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PenSquare, Layers, FileQuestion, ClipboardCheck, Lightbulb } from "lucide-react";
import Link from "next/link";

const tools = [
    { name: 'Essay Grader', icon: PenSquare, href: '#' },
    { name: 'Flashcard Generator', icon: Layers, href: '/flashcards' },
    { name: 'FRQ Explainer', icon: FileQuestion, href: '#' },
    { name: 'Practice Test Builder', icon: ClipboardCheck, href: '#' },
    { name: 'Topic Recommender', icon: Lightbulb, href: '/topic-recommender' },
];

export default function QuickLaunch() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Quick Launch: Tools</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {tools.map(tool => (
                        <Button key={tool.name} variant="outline" className="h-24 flex-col gap-2" asChild>
                            <Link href={tool.href}>
                                <tool.icon className="h-8 w-8 text-primary" />
                                <span className="text-center text-sm">{tool.name}</span>
                            </Link>
                        </Button>
                    ))}
                     <Button variant="outline" className="h-24 flex-col gap-2 bg-primary/10 border-primary/30">
                        <span className="text-primary text-sm font-bold">More Tools</span>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
