// src/components/ui/VinylLoader.tsx
import { Disc3 } from "lucide-react";

interface VinylLoaderProps {
  text?: string;
}

export function VinylLoader({ text = "Tirando o disco da capa..." }: VinylLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 w-full h-full min-h-[400px]">
      <div className="relative">
        {/* O ícone do disco usando o animate-spin nativo do Tailwind */}
        <Disc3 
          size={56} 
          className="text-garimpo-dark animate-[spin_3s_linear_infinite]" 
          strokeWidth={1} 
        />
        {/* O selo central colorido para dar um toque realista */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-garimpo-rust rounded-full shadow-inner"></div>
      </div>
      <p className="font-sans text-sm font-medium text-garimpo-dark/60 animate-pulse tracking-wide">
        {text}
      </p>
    </div>
  );
}