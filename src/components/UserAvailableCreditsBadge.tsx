"use client"
import { GetAvailableCredits } from '@/actions/billing/actions';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { CoinsIcon, Loader2Icon } from 'lucide-react';
import Link from 'next/link';
import React from 'react'
import ReactCountUpWrapper from './ReactCountUpWrapper';
import { badgeVariants } from './ui/badge';
import { buttonVariants } from './ui/button';

export default function UserAvailableCreditsBadge() {

    const query = useQuery({
        queryKey: ["user-available-credits"],
        queryFn: () => GetAvailableCredits(),
        refetchInterval: 30 * 1000, // 30 secondes
    });

    return (
        <Link href={"/billing"} className={cn("w-full space-x-1 items-center", buttonVariants({
            variant: "outline"
        }))}>
            <CoinsIcon size={20} className="text-primary" />
            <span className="font-semibold capitalize">
                {query.isLoading && <Loader2Icon className="w-4 h-4 animate-spin" />}
                {!query.isLoading && query.data && <ReactCountUpWrapper value={query.data} />}
                {!query.isLoading && query.data === undefined && "-"}
            </span>
        </Link>
    )
}
