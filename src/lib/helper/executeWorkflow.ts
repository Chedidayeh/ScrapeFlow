import "server-only";
import prisma from "../db/prisma";
import { revalidatePath } from "next/cache";
import { ExecutionPhaseStatus, WorkflowExecutionStatus } from "@/types/workflow";
import { error } from "console";
import { waitFor } from "./waitFor";
import { AppNode } from "@/types/appNode";
import { ExecutionPhase } from "@prisma/client";
import { _success } from "zod/v4/core";
import { TaskRegistry } from "../workflow/task/registry";
import { ExecutorRegistry } from "../workflow/executor/registry";
import { Environment, ExecutionEnvironment } from "@/types/executor";
import { TaskParamType } from "@/types/task";
import { Browser, Page } from "puppeteer";
import { Edge } from "@xyflow/react";
import { LogCollector } from "@/types/log";
import { createLogCollector } from "../log";


export async function ExecuteWorkflow(executionId: string, nextRunAt?: Date) {
    const execution = await prisma.workflowExecution.findUnique({
        where: { id: executionId },
        include: { workflow: true, phases: true },
    });

    if (!execution) {
        throw new Error("execution not found");
    }

    const edges = JSON.parse(execution.definition).edges as Edge[];

    // setup execution environment

    const environment: Environment = { phases: {} }

    // initialize workflow execution

    await initializeWorkflowExecution(executionId, execution.workflowId, nextRunAt);

    // initialize phases status
    await initializePhaseStatuses(execution)




    let creditsConsumed = 0;
    let executionFailed = false;
    for (const phase of execution.phases) {



        // execute phase
        const phaseExecution = await executeWorkflowPhase(phase, environment, edges, execution.userId);

        creditsConsumed += phaseExecution.creditsConsumed

        if (!phaseExecution.success) {
            executionFailed = true;
            break;
        }

    }


    // finalize execution
    await finalizeWorkflowExecution(
        executionId,
        execution.workflowId,
        executionFailed,
        creditsConsumed
    )

    // clean up environment

    await cleanupEnvironment(environment)

    revalidatePath("/workflows/runs")


}


async function initializeWorkflowExecution(
    executionId: string,
    workflowId: string,
    nextRunAt?: Date
) {
    await prisma.workflowExecution.update({
        where: { id: executionId },
        data: {
            startedAt: new Date(),
            status: WorkflowExecutionStatus.RUNNING
        }
    })

    await prisma.workflow.update({
        where: {
            id: workflowId,
        },
        data: {
            lastRunAt: new Date(),
            lastRunStatus: WorkflowExecutionStatus.RUNNING,
            lastRunId: executionId,
            ...(nextRunAt && { nextRunAt })
        }
    });


}


async function initializePhaseStatuses(execution: any) {
    await prisma.executionPhase.updateMany({
        where: {
            id: {
                in: execution.phases.map((phase: any) => phase.id),
            },
        },

        data: {
            status: ExecutionPhaseStatus.PENDING,
        },
    });
}



async function finalizeWorkflowExecution(
    executionId: string,
    workflowId: string,
    executionFailed: boolean,
    creditsConsumed: number
) {

    const finalStatus = executionFailed
        ? WorkflowExecutionStatus.FAILED
        : WorkflowExecutionStatus.COMPLETED;

    await prisma.workflowExecution.update({
        where: { id: executionId },
        data: {
            status: finalStatus,
            completedAt: new Date(),
            creditsConsumed,
        }
    });

    await prisma.workflow.update({
        where: {
            id: workflowId,
            lastRunId: executionId,
        },
        data: {
            lastRunStatus: finalStatus,
        }
    }).catch((error) => {
        // ignore
        // this means that we have triggered other runs for this workflow
        // while an execution was running

    })
}

async function executeWorkflowPhase(
    phase: ExecutionPhase,
    environment: Environment,
    edges: Edge[],
    userId: string) {
    const logCollector = createLogCollector()


    const startedAt = new Date();
    const node = JSON.parse(phase.node) as AppNode;

    setupEnvironmentForPhase(node, environment, edges)

    // Update phase status
    await prisma.executionPhase.update({
        where: { id: phase.id },
        data: {
            startedAt,
            status: ExecutionPhaseStatus.RUNNING,
            inputs: JSON.stringify(environment.phases[node.id].inputs),
        },
    });

    const creditsRequired = TaskRegistry[node.data.type].credits;
    console.log(`Executing phase ${phase.name} with ${creditsRequired} credits required`)

    // decrement user balance ( with required credits )

    let success = await decrementCredits(userId, creditsRequired, logCollector)
    const creditsConsumed = success ? creditsRequired : 0
    if (success) {
        // we can execute the phase if the credits are valid
        success = await executePhase(phase, node, environment, logCollector)
    }

    // Execute phase simulation
    // await waitFor(2000);
    // const success = Math.random() < 0.7

    // Execute phase

    // finalize Phase
    const outputs = environment.phases[node.id].outputs
    await finalizePhase(phase.id, success, outputs, logCollector, creditsConsumed);

    return { success, creditsConsumed }


}

async function finalizePhase(phaseId: string, success: boolean, outputs: any, logCollector: LogCollector, creditsConsumed: number) {
    const finalStatus = success
        ? ExecutionPhaseStatus.COMPLETED
        : ExecutionPhaseStatus.FAILED;

    await prisma.executionPhase.update({
        where: {
            id: phaseId,
        },
        data: {
            logs: {
                createMany: {
                    data: logCollector.getAll().map(log => ({
                        message: log.message,
                        timestamp: log.timestamp,
                        logLevel: log.level
                    })),
                },
            },
            status: finalStatus,
            completedAt: new Date(),
            outputs: JSON.stringify(outputs),
            creditsConsumed,
        }
    })
}


async function executePhase(
    phase: ExecutionPhase,
    node: AppNode,
    environment: Environment,
    logCollector: LogCollector
): Promise<boolean> {

    const runFn = ExecutorRegistry[node.data.type]

    if (!runFn) {
        logCollector.error(`not found executor for ${node.data.type}`)
        return false;
    }

    const executionEnvironment: ExecutionEnvironment<any> = createExecutionEnvironment(node, environment, logCollector)

    return await runFn(executionEnvironment);
}



function setupEnvironmentForPhase(node: AppNode, environment: Environment, edges: Edge[]) {
    environment.phases[node.id] = { inputs: {}, outputs: {} };

    const inputs = TaskRegistry[node.data.type].inputs;
    for (const input of inputs) {
        if (input.type === TaskParamType.BROWSER_INSTANCE) continue
        const inputValue = node.data.inputs[input.name];
        if (inputValue) {
            environment.phases[node.id].inputs[input.name] = inputValue;
            continue;

        }

        // Get input value from outputs in the environment
        const connectedEdge = edges.find(
            (edge) => edge.target === node.id && edge.targetHandle === input.name
        )
        if (!connectedEdge) {
            console.error("Missing edge for input", input.name, "node id:", node.id);
            continue;
        }

        const outputValue =
            environment.phases[connectedEdge.source].outputs[
            connectedEdge.sourceHandle!
            ];

        environment.phases[node.id].inputs[input.name] = outputValue;

    }

}

function createExecutionEnvironment(
    node: AppNode,
    environment: Environment,
    LogCollector: LogCollector
): ExecutionEnvironment<any> {
    return {
        getInput: (name: string) => environment.phases[node.id]?.inputs[name],
        setOutput: (name: string, value: string) => {
            environment.phases[node.id].outputs[name] = value
        },

        setBrowser: (browser: Browser) => (environment.browser = browser),
        getBrowser: () => environment.browser,

        getPage: () => environment.page,
        setPage: (page: Page) => (environment.page = page),
        log: LogCollector,

    }
}


async function cleanupEnvironment(environment: Environment) {
    if (environment.browser) {
        await environment.browser.close().catch(error => console.log("Cannot close browser, reason:", error))
    }
}


async function decrementCredits(
    userId: string,
    amount: number,
    logCollector: LogCollector
) {
    try {

        await prisma.userBalance.update({
            where: { userId, credits: { gte: amount } },
            data: {
                credits: { decrement: amount }
            }
        })
        return true

    }
    catch (error) {
        logCollector.error("insufficient credits balance!")
        return false;
    }
}

