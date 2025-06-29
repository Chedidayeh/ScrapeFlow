"use client"
import { GetCreditUsageInPeriod, GetWorkflowExecutionStats } from '@/actions/analytics/actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartLegend, ChartLegendContent, ChartTooltipContent } from '@/components/ui/chart'
import { ChartColumnStacked, ChartColumnStackedIcon, Layers2 } from 'lucide-react'
import React from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis } from 'recharts'

type ChartData = Awaited<ReturnType<typeof GetCreditUsageInPeriod>>
const chartConfig = {
    success: {
        label: "Successfull Phases credits",
        color: "hsl(var(--chart-2))",
    },
    failed: {
        label: "Failed Phases credits",
        color: "hsl(var(--chart-1))",
    },
};
export default function CreditUsageChart({ data, title, description }: { data: ChartData, title: string, description: string }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2x1 font-bold flex items-center gap-2">
                    <ChartColumnStackedIcon className="w-6 h-6 text-primary" />
                    {title}
                </CardTitle>
                <CardDescription>
                    {description}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[200px] w-full">
                    <BarChart
                        data={data}
                        accessibilityLayer
                        margin={{ top: 20 }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey={"date"}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={value => {
                                const date = new Date(value);
                                return date.toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                })
                            }} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <ChartTooltip content={<ChartTooltipContent className='w-[250px]' />} />
                        <Bar
                            fill='var(--color-success)'
                            radius={[0, 0, 4, 4]} 
                            fillOpacity={0.8}
                            stroke='var(--color-success)'
                            stackId={"a"}
                            dataKey={"success"} />
                        <Bar
                            fill='var(--color-failed)'
                            radius={[4, 4, 0, 0]} 
                            fillOpacity={0.8}
                            stroke='var(--color-failed)'
                            stackId={"a"}
                            dataKey={"failed"} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
