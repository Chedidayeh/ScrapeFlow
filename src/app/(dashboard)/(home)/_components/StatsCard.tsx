import ReactCountUpWrapper from '@/components/ReactCountUpWrapper'
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import React from 'react'

export default function StatsCard({ title, value, icon }: { title: string, value: number, icon: LucideIcon }) {
    const Icon = icon
    return (
        <Card className="relative overflow-hidden h-full">
            <CardHeader className="flex pb-2">
                <CardTitle>{title}</CardTitle>
                <Icon
                    size={120}
                    className="text-muted-foreground absolute -bottom-4 -right-8 stroke-primary
                    opacity-10"
                />
            </CardHeader>
            <CardContent>
                <div className="text-2x1 font-bold text-primary">
                    <ReactCountUpWrapper value={value} />
                </div>
            </CardContent>
        </Card>
    )
}
