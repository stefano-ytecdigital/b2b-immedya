import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { AnimatedPage, listContainerVariants, listItemVariants, SkeletonLoader } from '@/shared/animations';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Search } from 'lucide-react';
import { KitCard } from '@/features/catalog/components/KitCard';

export const Route = createFileRoute('/_authenticated/catalog/kits')({
  component: CatalogKitsPage,
});

// Mock data updated with Unsplash Images
const MOCK_KITS = [
  {
    id: '1',
    name: 'Kit Indoor P2.5 - Retail Small',
    sku: 'KIT-IN-P25-S',
    description: 'Perfetto per vetrine retail e showroom. Alta definizione e contrasto elevato.',
    imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=1000',
    pixelPitch: 2.5,
    environment: 'Indoor',
    widthMm: 1920,
    heightMm: 1080,
    resolutionX: 768,
    resolutionY: 432,
    modules: 12,
    price: 8500,
    isAvailable: true,
  },
  {
    id: '2',
    name: 'Kit Outdoor P5 - City Screen',
    sku: 'KIT-OUT-P5-M',
    description: 'Ideale per facciate esterne e digital signage urbano. Alta luminosità diurna.',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000',
    pixelPitch: 5.0,
    environment: 'Outdoor',
    widthMm: 3840,
    heightMm: 2160,
    resolutionX: 768,
    resolutionY: 432,
    modules: 24,
    price: 15000,
    isAvailable: true,
  },
  {
    id: '3',
    name: 'Kit Indoor P3 - Event Pro',
    sku: 'KIT-IN-P3-L',
    description: 'Soluzione premium per eventi, conference hall e auditori. Montaggio rapido.',
    imageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=1000',
    pixelPitch: 3.0,
    environment: 'Indoor',
    widthMm: 5760,
    heightMm: 3240,
    resolutionX: 1920,
    resolutionY: 1080,
    modules: 48,
    price: 28000,
    isAvailable: true,
  },
  {
    id: '4',
    name: 'Kit Outdoor P4 - Stadium',
    sku: 'KIT-OUT-P4-L',
    description: 'Grande formato per arene e spazi pubblici ampi. Visibilità ottimale a distanza.',
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1000',
    pixelPitch: 4.0,
    environment: 'Outdoor',
    widthMm: 7680,
    heightMm: 4320,
    resolutionX: 1920,
    resolutionY: 1080,
    modules: 60,
    price: 42000,
    isAvailable: true,
  },
  {
    id: '5',
    name: 'Kit Indoor P1.9 - Broadcast',
    sku: 'KIT-IN-P19-P',
    description: 'Ultra HD per studi televisivi e control room. Pixel pitch finissimo senza moiré.',
    imageUrl: 'https://images.unsplash.com/photo-1595776605372-e54f8e152b39?auto=format&fit=crop&q=80&w=1000',
    pixelPitch: 1.9,
    environment: 'Indoor',
    widthMm: 2880,
    heightMm: 1620,
    resolutionX: 1515,
    resolutionY: 853,
    modules: 18,
    price: 35000,
    isAvailable: false,
  },
  {
    id: '6',
    name: 'Kit Outdoor P6 - Mega Stage',
    sku: 'KIT-OUT-P6-XL',
    description: 'Maxi schermo per concerti e festival. Struttura rinforzata e leggera.',
    imageUrl: 'https://images.unsplash.com/photo-1470229722913-7ea9959f170d?auto=format&fit=crop&q=80&w=1000',
    pixelPitch: 6.0,
    environment: 'Outdoor',
    widthMm: 9600,
    heightMm: 5400,
    resolutionX: 1600,
    resolutionY: 900,
    modules: 80,
    price: 55000,
    isAvailable: true,
  },
];

function CatalogKitsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [pitchFilter, setPitchFilter] = useState<string>('all');
  const [environmentFilter, setEnvironmentFilter] = useState<string>('all');
  const [isLoading] = useState(false);

  // Apply filters
  const filteredKits = MOCK_KITS.filter((kit) => {
    const matchesSearch = kit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kit.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPitch = pitchFilter === 'all' || kit.pixelPitch.toString() === pitchFilter;
    const matchesEnvironment = environmentFilter === 'all' || kit.environment === environmentFilter;

    return matchesSearch && matchesPitch && matchesEnvironment;
  });

  return (
    <AnimatedPage>
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Catalogo Kit</h1>
            <p className="text-lg text-muted-foreground">
              Soluzioni pre-configurate per ogni esigenza. Pronto all'uso.
            </p>
          </div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Search */}
                  <div className="relative md:col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cerca kit per nome o SKU..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Pixel Pitch Filter */}
                  <Select value={pitchFilter} onValueChange={setPitchFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pixel Pitch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutti i pitch</SelectItem>
                      <SelectItem value="1.9">P1.9</SelectItem>
                      <SelectItem value="2.5">P2.5</SelectItem>
                      <SelectItem value="3.0">P3.0</SelectItem>
                      <SelectItem value="4.0">P4.0</SelectItem>
                      <SelectItem value="5.0">P5.0</SelectItem>
                      <SelectItem value="6.0">P6.0</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Environment Filter */}
                  <Select value={environmentFilter} onValueChange={setEnvironmentFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Ambiente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutti</SelectItem>
                      <SelectItem value="Indoor">Indoor</SelectItem>
                      <SelectItem value="Outdoor">Outdoor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Count */}
          <motion.div
            className="flex items-center justify-between"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <p className="text-sm text-muted-foreground">
              {filteredKits.length} {filteredKits.length === 1 ? 'kit trovato' : 'kit trovati'}
            </p>
            <Button variant="outline" size="sm" onClick={() => {
              setSearchQuery('');
              setPitchFilter('all');
              setEnvironmentFilter('all');
            }}>
              Reset filtri
            </Button>
          </motion.div>

          {/* Grid with Stagger Animation */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonLoader key={i} className="h-[400px]" />
              ))}
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={listContainerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredKits.map((kit) => (
                <motion.div key={kit.id} variants={listItemVariants}>
                  <KitCard kit={kit} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Empty State */}
          {!isLoading && filteredKits.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center space-y-4">
                <div className="flex justify-center">
                  <Search className="h-12 w-12 text-muted-foreground/50" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Nessun kit trovato</h3>
                  <p className="text-sm text-muted-foreground">
                    Prova a modificare i filtri di ricerca
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setPitchFilter('all');
                    setEnvironmentFilter('all');
                  }}
                >
                  Reset filtri
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
}
