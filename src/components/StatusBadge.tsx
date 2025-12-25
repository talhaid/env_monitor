import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
    "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default: "bg-neutral-800 text-neutral-200",
                secondary: "bg-neutral-800 text-neutral-400",
                destructive: "bg-red-500/20 text-red-500",
                outline: "text-neutral-400 border border-neutral-800",
                // Custom Logic States
                success: "bg-emerald-500/10 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.1)]",
                warning: "bg-amber-500/10 text-amber-500",
                danger: "bg-red-500/10 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse",
                neutral: "bg-neutral-800 text-neutral-500",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

interface StatusBadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
    label: string;
}

export function StatusBadge({ className, variant, label, ...props }: StatusBadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props}>
            {label}
        </div>
    );
}
