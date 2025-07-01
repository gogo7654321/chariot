
"use client";

import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Twitter, Instagram, Facebook, Youtube } from "lucide-react";
import { AceMascot } from "./AceMascot";
import { usePathname } from "next/navigation";

const footerLinks = {
  resources: [
    { name: "All Courses", href: "/classes" },
    { name: "Practice Tests", href: "/tools/practice-test" },
    { name: "Essay Grader", href: "/tools/essay-grader" },
    { name: "AI Tools", href: "/tools" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Support", href: "/support" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
  ]
};

export function Footer() {
  const pathname = usePathname();
  const isHidden = pathname.startsWith('/dashboard') || pathname.startsWith('/auth');
  if (isHidden) return null;

  return (
    <footer className="bg-secondary/50 border-t">
      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <AceMascot className="h-10 w-10" />
              <h3 className="text-2xl font-bold font-headline">AP Ace<span className="copyright-symbol">&copy;</span></h3>
            </Link>
            <p className="text-muted-foreground max-w-sm">
              Ace your AP exams with confidence using our AI-powered study tools and comprehensive guides.
            </p>
            <div className="flex space-x-4">
              <Link href="#" aria-label="Twitter"><Twitter className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" /></Link>
              <Link href="#" aria-label="Instagram"><Instagram className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" /></Link>
              <Link href="#" aria-label="Facebook"><Facebook className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" /></Link>
              <Link href="#" aria-label="YouTube"><Youtube className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors" /></Link>
            </div>
          </div>
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            <FooterLinkGroup title="Resources" links={footerLinks.resources} />
            <FooterLinkGroup title="Company" links={footerLinks.company} />
            <FooterLinkGroup title="Legal" links={footerLinks.legal} />
          </div>
        </div>
        
        <div className="mt-12 border-t pt-8">
          <div className="space-y-3">
             <h4 className="font-semibold font-headline">Stay Updated</h4>
            <p className="text-muted-foreground text-sm max-w-md">Subscribe to our newsletter for study tips, updates, and special offers.</p>
            <form className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 max-w-sm">
              <Input type="email" placeholder="you@example.com" className="bg-background"/>
              <Button type="submit">Subscribe</Button>
            </form>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} AP Ace<span className="copyright-symbol">&copy;</span>. All Rights Reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" target="_blank" rel="noopener noreferrer">
              <Image src="https://placehold.co/120x40.png" alt="Download on the App Store" width={120} height={40} data-ai-hint="app store" />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer">
              <Image src="https://placehold.co/135x40.png" alt="Get it on Google Play" width={135} height={40} data-ai-hint="google play" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLinkGroup({ title, links }: { title: string; links: { name: string; href: string }[] }) {
  return (
    <div className="space-y-4">
      <h4 className="font-semibold font-headline">{title}</h4>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.name}>
            <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors text-sm">
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
