import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Monitor, Layers, Maximize } from 'lucide-react';
import { cn } from '@/shared/lib/utils'; // Keep utility import if needed, otherwise remove

// Definition of Kit type to avoid circular dependency with the page
// Ideally this should be imported from types/index.ts
export interface Kit {
    id: string;
    name: string;
    sku: string;
    description: string;
    imageUrl: string;
    pixelPitch: number;
    environment: string;
    widthMm: number;
    heightMm: number;
    resolutionX: number;
    resolutionY: number;
    modules: number;
    price: number;
    isAvailable: boolean;
}

interface KitCardProps {
    kit: Kit;
}

export function KitCard({ kit }: KitCardProps) {
    // Format price
    const formattedPrice = new Intl.NumberFormat('it-IT', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
    }).format(kit.price);

    return (
        <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="h-full"
        >
            <Card className="h-full flex flex-col overflow-hidden border-border/50 group hover:border-primary/50 hover:shadow-xl transition-all duration-300 bg-card">

                {/* Image Area - Aspect Ratio 16:9 like screens */}
                <div className="relative aspect-video overflow-hidden bg-muted">
                    <Badge
                        variant={kit.isAvailable ? 'default' : 'secondary'}
                        className="absolute top-3 left-3 z-10 font-medium"
                    >
                        {kit.isAvailable ? 'Disponibile' : 'In arrivo'}
                    </Badge>

                    <Badge
                        variant="outline"
                        className="absolute top-3 right-3 z-10 bg-background/80 backdrop-blur-sm font-technical"
                    >
                        P{kit.pixelPitch}
                    </Badge>

                    <img
                        src={kit.imageUrl}
                        alt={kit.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Overlay gradient for text readability if needed */}
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background/80 to-transparent opacity-50" />
                </div>

                <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-2">
                        <div>
                            <CardTitle className="text-lg font-bold leading-tight group-hover:text-primary transition-colors">
                                {kit.name}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground font-technical mt-1">{kit.sku}</p>
                        </div>
                        <div className="text-right">
                            {/* Price prominent */}
                            <p className="text-lg font-bold text-primary font-technical whitespace-nowrap">
                                {formattedPrice}
                            </p>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="flex-1 space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {kit.description}
                    </p>

                    {/* Tech Bar - Horizontal Stats */}
                    <div className="flex items-center justify-between py-3 px-4 bg-muted/30 rounded-lg border border-border/50">
                        {/* Dimensions */}
                        <div className="flex flex-col items-center gap-1 group/stat" title="Dimensioni">
                            <Maximize className="h-4 w-4 text-muted-foreground group-hover/stat:text-primary transition-colors" />
                            <span className="text-xs font-technical font-medium">
                                {(kit.widthMm / 1000).toFixed(2)}m × {(kit.heightMm / 1000).toFixed(2)}m
                            </span>
                        </div>

                        <div className="w-px h-8 bg-border/50" />

                        {/* Resolution */}
                        <div className="flex flex-col items-center gap-1 group/stat" title="Risoluzione">
                            <Monitor className="h-4 w-4 text-muted-foreground group-hover/stat:text-primary transition-colors" />
                            <span className="text-xs font-technical font-medium">
                                {kit.resolutionX}×{kit.resolutionY}
                            </span>
                        </div>

                        <div className="w-px h-8 bg-border/50" />

                        {/* Modules */}
                        <div className="flex flex-col items-center gap-1 group/stat" title="Moduli">
                            <Layers className="h-4 w-4 text-muted-foreground group-hover/stat:text-primary transition-colors" />
                            <span className="text-xs font-technical font-medium">
                                {kit.modules} mod
                            </span>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="pt-2">
                    <Button className="w-full group-hover:bg-primary/90" disabled={!kit.isAvailable}>
                        {kit.isAvailable ? 'Configura & Acquista' : 'Non disponibile'}
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    );
}
