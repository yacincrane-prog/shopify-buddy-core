import { type StorefrontConfig } from "@/lib/storefront-config";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface Props {
  config: StorefrontConfig;
}

export function StorefrontHero({ config }: Props) {
  if (!config.hero?.enabled) return null;

  return (
    <section
      className="relative flex items-center justify-center text-center overflow-hidden"
      style={
        config.hero.backgroundImage
          ? { backgroundImage: `url(${config.hero.backgroundImage})`, backgroundSize: "cover", backgroundPosition: "center" }
          : {}
      }
    >
      {!config.hero.backgroundImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent/70" />
      )}
      {config.hero.overlay && <div className="absolute inset-0 bg-black/30" />}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -end-20 w-72 h-72 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -bottom-20 -start-20 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
      </div>
      <div className="relative z-10 container px-4 max-w-2xl py-16 sm:py-24 md:py-32">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight drop-shadow-sm">
          {config.hero.title}
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-white/85 mt-3 sm:mt-4 max-w-xl mx-auto">{config.hero.subtitle}</p>
        {config.hero.buttonText && (
          <a href={config.hero.buttonLink || "#products"}>
            <Button size="lg" className="mt-6 sm:mt-8 gap-2 text-sm sm:text-base px-8 shadow-lg hover:shadow-xl transition-shadow bg-accent text-accent-foreground hover:bg-accent/90">
              {config.hero.buttonText}
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </a>
        )}
      </div>
    </section>
  );
}
