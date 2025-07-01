
"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Wrench } from "lucide-react";

export function QuickTools() {
    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="pl-10">
                <CardTitle className="font-headline">Quick Launch Tools</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow min-h-0">
                <ScrollArea className="h-full w-full">
                    <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-full py-10">
                        <Wrench className="h-10 w-10 mb-4" />
                        <p className="font-semibold">More Tools Coming Soon</p>
                        <p className="text-sm">We're busy building new features for you.</p>
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
