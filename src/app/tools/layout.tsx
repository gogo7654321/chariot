import React from 'react';

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full">
      <div className="bg-secondary/50 border-b">
        <div className="container mx-auto px-4 md:px-6 py-8 text-center">
            <h1 className="text-4xl font-bold font-headline tracking-tighter sm:text-5xl">AI Tools</h1>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground md:text-lg">
                A suite of helpful tools to enhance your learning and organization.
            </p>
        </div>
      </div>
      <div className="container mx-auto px-4 md:px-6 py-12">
        {children}
      </div>
    </div>
  );
}
