"use server"

import prisma from "@/lib/db/prisma";
import { PeriodToDateRange } from "@/lib/helper/dates";
import { Period } from "@/types/analytics";
import { ExecutionPhaseStatus, WorkflowExecutionStatus } from "@/types/workflow";
import { auth } from "@clerk/nextjs/server";
import { eachDayOfInterval, format } from "date-fns";

const { COMPLETED, FAILED } = WorkflowExecutionStatus;

export async function GetPeriods() {
    const { userId } = auth();

    if (!userId) {
        throw new Error("unathenticated");
    }

    const years = await prisma.workflowExecution.aggregate({
        where: { userId },
        _min: { startedAt: true },
    });

    const currentYear = new Date().getFullYear();

    const minYear = years._min.startedAt
        ? years._min.startedAt.getFullYear()
        : currentYear;

    const periods: Period[] = [];

    for (let year = minYear; year <= currentYear; year++) {
        for (let month = 0; month <= 11; month++) {
            periods.push({ year, month });
        }
    }

    return periods

}


export async function GetStatsCardsValues(period: Period) {

    const { userId } = auth();

    if (!userId) {
        throw new Error("unathenticated");
    }

    const dateRange = PeriodToDateRange(period);

    const executions = await prisma.workflowExecution.findMany({
        where: {
            userId,
            startedAt: {
                gte: dateRange.startDate,
                lte: dateRange.endDate,
            },
            status: {
                in: [COMPLETED, FAILED],
            }
        },

        select: {
            creditsConsumed: true,
            phases: {
                where: {
                    creditsConsumed: {
                        not: null,
                    },
                },
                select: { creditsConsumed: true },
            }
        },
    })


    const stats = {
        workflowExecutions: executions.length,
        creditsConsumed: 0,
        phaseExecutions: 0,
    }

    stats.creditsConsumed = executions.reduce(
        (sum, execution) => sum + execution.creditsConsumed,
        0
    );

    stats.phaseExecutions = executions.reduce(
        (sum, execution) => sum + execution.phases.length,
        0
    );

    return stats;
}




export async function GetWorkflowExecutionStats(period: Period) {
    const { userId } = auth();

    if (!userId) {
        throw new Error("unathenticated");
    }

    const dateRange = PeriodToDateRange(period);
    const executions = await prisma.workflowExecution.findMany({
        where: {
            userId,
            startedAt: {
                gte: dateRange.startDate,
                lte: dateRange.endDate,
            },
        },
    })

    const dateFormat = "yyyy-MM-dd";

    const stats: Record<
        string,
        {
            success: number;
            failed: number
        }
    > = eachDayOfInterval({
        start: dateRange.startDate,
        end: dateRange.endDate,
    }).map((date) => format(date, dateFormat))
        .reduce((acc, date) => {
            acc[date] = {
                success: 0,
                failed: 0,
            };
            return acc;
        }, {} as any);


    executions.forEach((execution) => {
        const date = format(execution.startedAt!, dateFormat);
        if (execution.status === WorkflowExecutionStatus.COMPLETED) {
            stats[date].success += 1;
        }

        if (execution.status === WorkflowExecutionStatus.FAILED) {
            stats[date].failed += 1;
        }
    })


    const result = Object.entries(stats).map(([date, infos]) => ({
        date,
        ...infos,
    }));



    return result;



}

export async function GetCreditUsageInPeriod(period: Period) {
    const { userId } = auth();

    if (!userId) {
        throw new Error("unathenticated");
    }

    const dateRange = PeriodToDateRange(period);
    const executionPhases = await prisma.executionPhase.findMany({
        where: {
            userId,
            startedAt: {
                gte: dateRange.startDate,
                lte: dateRange.endDate,
            },
            status : {
                in : [COMPLETED , FAILED]
            }
        },
    })

    const dateFormat = "yyyy-MM-dd";

    const stats: Record<
        string,
        {
            success: number;
            failed: number
        }
    > = eachDayOfInterval({
        start: dateRange.startDate,
        end: dateRange.endDate,
    }).map((date) => format(date, dateFormat))
        .reduce((acc, date) => {
            acc[date] = {
                success: 0,
                failed: 0,
            };
            return acc;
        }, {} as any);


        executionPhases.forEach((phase) => {
        const date = format(phase.startedAt!, dateFormat);
        if (phase.status === ExecutionPhaseStatus.COMPLETED) {
            stats[date].success += phase.creditsConsumed || 0;
        }

        if (phase.status === ExecutionPhaseStatus.FAILED) {
            stats[date].failed += phase.creditsConsumed || 0;
        }
    })


    const result = Object.entries(stats).map(([date, infos]) => ({
        date,
        ...infos,
    }));



    return result;



}




