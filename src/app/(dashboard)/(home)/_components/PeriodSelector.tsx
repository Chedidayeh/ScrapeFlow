"use client"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Period } from '@/types/analytics'
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react'

const MONTH_NAMES = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
] as const;

export default function PeriodSelector({ selectedPeriod , periods }: { selectedPeriod : Period ,periods: Period[] }) {
    const router = useRouter()
    const searchParams = useSearchParams();
    return ( 
        <Select value={`${selectedPeriod.month}-${selectedPeriod.year}`} onValueChange={(value) => {
            const [month, year] = value.split("-");
            const params = new URLSearchParams(searchParams);
            params.set("month", month);
            params.set("year", year);
            router.push(`?${params.toString()}`);

        }}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder='Select period' />
            </SelectTrigger>
            <SelectContent>
                {periods.map((period, index) => (
                    <SelectItem key={index} value={`${period.month}-${period.year}`}>
                        {`${MONTH_NAMES[period.month]} ${period.year}`}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
