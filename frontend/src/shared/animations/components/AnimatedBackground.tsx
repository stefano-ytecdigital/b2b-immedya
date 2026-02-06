import { motion } from 'framer-motion';

export function AnimatedBackground() {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden bg-background">
            {/* Blob 1 - Top Left */}
            <motion.div
                className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-primary/20 blur-[100px] opacity-30 mix-blend-screen filter"
                animate={{
                    x: [0, 50, 0],
                    y: [0, 30, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                }}
            />

            {/* Blob 2 - Bottom Right */}
            <motion.div
                className="absolute -bottom-[10%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-accent/20 blur-[100px] opacity-30 mix-blend-screen filter"
                animate={{
                    x: [0, -50, 0],
                    y: [0, -30, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                    delay: 2,
                }}
            />

            {/* Blob 3 - Center (Subtle) */}
            <motion.div
                className="absolute top-[30%] left-[30%] w-[40vw] h-[40vw] rounded-full bg-primary/10 blur-[120px] opacity-20 mix-blend-screen filter"
                animate={{
                    x: [0, 20, -20, 0],
                    y: [0, -20, 20, 0],
                }}
                transition={{
                    duration: 30,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                    delay: 5,
                }}
            />

            {/* Noise Texture Overlay for "Professional" feel */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
            />
        </div>
    );
}
