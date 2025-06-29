import { cn } from '@/lib/utils';
import { SquareDashedMousePointer } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

type Props = {
    fontSize?: string;
    iconSize?: number;
};

export default function Logo({
    fontSize = "text-2xl",
    iconSize = 20
}: Props) {
    return (
        <Link
            href="/"
            className={cn(
                "font-extrabold flex items-center gap-2",
                fontSize
            )}
        >
            <div className="rounded-xl bg-gradient-to-r
            from-emerald-500 to-emerald-600 p-2">
                <SquareDashedMousePointer size={iconSize}
                    className='stroke-white' />
            </div>

            <div>
                <span className="bg-gradient-to-r from-emerald-500
                    to-emerald-600 bg-clip-text text-transparent">
                    Scrape
                </span>
                <span className="text-stone-700
                    dark:text-stone-300">
                    Flow
                </span>
            </div>
        </Link>
    );
}
