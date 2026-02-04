import { useEffect, useState } from "react";

// Import all hero images
import hero1 from "@/assets/hero/hero-1.jpg";
import hero2 from "@/assets/hero/hero-2.jpg";
import hero3 from "@/assets/hero/hero-3.jpg";
import hero4 from "@/assets/hero/hero-4.jpg";
import hero5 from "@/assets/hero/hero-5.jpg";
import hero6 from "@/assets/hero/hero-6.jpg";
import hero7 from "@/assets/hero/hero-7.jpg";
import hero8 from "@/assets/hero/hero-8.jpg";
import hero9 from "@/assets/hero/hero-9.jpg";
import hero10 from "@/assets/hero/hero-10.jpg";

const images = [hero1, hero2, hero3, hero4, hero5, hero6, hero7, hero8, hero9, hero10];

export const HeroImageCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Image slides */}
      <div className="relative w-full h-full">
        {images.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentIndex 
                ? "opacity-100 scale-100" 
                : "opacity-0 scale-105"
            }`}
          >
            <img
              src={img}
              alt={`Street Cause activity ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
      
      {/* Morph overlay layers - reduced opacity for clearer images */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10" />
      <div className="absolute inset-0 backdrop-blur-[1px]" />
      
      {/* Subtle grain texture */}
      <div className="absolute inset-0 opacity-[0.02] bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')]" />
    </div>
  );
};
