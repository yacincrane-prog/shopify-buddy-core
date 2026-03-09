import { type StorefrontConfig } from "@/lib/storefront-config";
import { Phone, Mail, Facebook, Instagram } from "lucide-react";

interface Props {
  config: StorefrontConfig;
  storeName: string;
}

export function StorefrontFooter({ config, storeName }: Props) {
  if (!config.footer?.enabled) return null;

  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold text-sm mb-2">{storeName}</h3>
            <p className="text-xs text-muted-foreground">{config.footer.text}</p>
          </div>
          {(config.footer.phone || config.footer.email) && (
            <div className="space-y-2">
              <h4 className="font-semibold text-xs mb-2">تواصل معنا</h4>
              {config.footer.phone && (
                <a href={`tel:${config.footer.phone}`} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
                  <Phone className="w-3.5 h-3.5" /> {config.footer.phone}
                </a>
              )}
              {config.footer.email && (
                <a href={`mailto:${config.footer.email}`} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
                  <Mail className="w-3.5 h-3.5" /> {config.footer.email}
                </a>
              )}
            </div>
          )}
          {(config.footer.socialLinks?.facebook || config.footer.socialLinks?.instagram || config.footer.socialLinks?.tiktok) && (
            <div>
              <h4 className="font-semibold text-xs mb-2">تابعنا</h4>
              <div className="flex gap-3">
                {config.footer.socialLinks.facebook && (
                  <a href={config.footer.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {config.footer.socialLinks.instagram && (
                  <a href={config.footer.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {config.footer.socialLinks.tiktok && (
                  <a href={config.footer.socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.16 15.2a6.34 6.34 0 0 0 6.33 6.34 6.34 6.34 0 0 0 6.33-6.34V8.87a8.28 8.28 0 0 0 4.77 1.52V7a4.85 4.85 0 0 1-1-.31Z" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
