"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

export function MobileMenu() {
    const [open, setOpen] = useState(false);

    const menuItems = ["Home", "Courses", "About", "Admission", "Contact"];

    return (
        <div className="lg:hidden flex items-center">
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-primary hover:bg-secondary/10">
                        <Menu className="h-8 w-8" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px] border-l-secondary/20 backdrop-blur-xl bg-white/90">
                    <SheetHeader className="mb-8 text-left">
                        <SheetTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                            <span className="w-8 h-1 bg-secondary rounded-full inline-block"></span>
                            Menu
                        </SheetTitle>
                    </SheetHeader>
                    <nav className="flex flex-col space-y-4">
                        {menuItems.map((item, index) => (
                            <Link
                                key={item}
                                href={`#${item.toLowerCase()}`}
                                className="group flex items-center justify-between text-lg font-medium text-gray-600 hover:text-primary hover:bg-secondary/10 p-3 rounded-xl transition-all duration-300"
                                onClick={() => setOpen(false)}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <span>{item}</span>
                                <span className="w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-4"></span>
                            </Link>
                        ))}
                        <Link
                            href="#admission"
                            onClick={() => setOpen(false)}
                            className="mt-6 pt-6 border-t border-gray-100"
                        >
                            <Button className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 py-6 text-lg">
                                Apply Now
                            </Button>
                        </Link>
                    </nav>
                </SheetContent>
            </Sheet>
        </div>
    );
}
