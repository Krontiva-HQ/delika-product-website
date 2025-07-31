"use client";

import { useState } from "react";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface MobileCategoriesProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  isLoading?: boolean;
}

export function MobileCategories({
  categories,
  selectedCategory,
  onSelectCategory,
  isLoading = false,
}: MobileCategoriesProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Show first 5 categories in main view
  const mainCategories = categories.slice(0, 5);
  // Rest go into the menu
  const menuCategories = categories.slice(5);

  return (
    <div className="bg-white rounded-lg p-4 mb-6 block lg:hidden">
      <h2 className="font-semibold mb-4">Categories</h2>
      <div className="flex items-center gap-2">
        <div className="flex overflow-x-auto whitespace-nowrap pb-2 gap-2 flex-1">
          {mainCategories.map(category => (
            <button
              key={category}
              onClick={() => onSelectCategory(category)}
              className={`px-3 py-2 rounded-md hover:bg-gray-100 text-sm flex-shrink-0 ${
                selectedCategory === category ? 'bg-gray-100' : ''
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        
        {menuCategories.length > 0 && (
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="flex-shrink-0"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[50vh]">
              <SheetHeader>
                <SheetTitle>More Categories</SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-2 gap-2 p-4">
                {menuCategories.map(category => (
                  <button
                    key={category}
                    onClick={() => {
                      onSelectCategory(category);
                      setIsOpen(false);
                    }}
                    className={`px-3 py-2 rounded-md hover:bg-gray-100 text-sm text-left ${
                      selectedCategory === category ? 'bg-gray-100' : ''
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </div>
  );
}