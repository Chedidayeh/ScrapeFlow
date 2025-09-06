import prisma from "@/lib/db/prisma";
import { ExecuteWorkflow } from "@/lib/helper/executeWorkflow";
import { TaskRegistry } from "@/lib/workflow/task/registry";
import { ExecutionPhaseStatus, WorkflowExecutionPlan, WorkflowExecutionStatus, WorkflowExecutionTrigger } from "@/types/workflow";
import CronExpressionParser from "cron-parser";
import { timingSafeEqual } from "crypto";
import { revalidatePath } from "next/cache";

function isValidSecret(secret: string) {
    const API_SECRET = process.env.API_SECRET;
    if (!API_SECRET) return false;
    try {
        return timingSafeEqual(Buffer.from(secret), Buffer.from(API_SECRET))
    } catch (error) {
        return false
    }
}
async function handleWorkflowExecution(request: Request) {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return Response.json({ error: "Unauthorized" }, { status: 401 })
    }
    const secret = authHeader.split(" ")[1];
    if (!isValidSecret(secret)) {
        return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get("workflowId") as string;

    if (!workflowId) {
        return Response.json({ error: "bad request" }, { status: 400 });
    }

    const workflow = await prisma.workflow.findUnique({
        where: {
            id: workflowId,
        }
    });

    if (!workflow) {
        return Response.json({ error: "bad request" }, { status: 400 });
    }

    const executionPlan = JSON.parse(workflow.executionPlan!) as WorkflowExecutionPlan;

    if (!executionPlan) {
        return Response.json({ error: "bad request" }, { status: 400 });
    }
    try {
        const cron = CronExpressionParser.parse(workflow.cron!, { tz: 'Europe/London' });
        const nextRunAt = cron.next().toDate()

        
    const execution = await prisma.workflowExecution.create({
        data: {
            workflowId,
            userId : workflow.userId,
            status: WorkflowExecutionStatus.PENDING, // Initial status
            startedAt: new Date(), // Timestamp for when execution started
            trigger: WorkflowExecutionTrigger.CRON, // Indicates this was manually triggered
            definition: workflow.definition,
            // Create phases and nodes for the execution
            phases: {
                create: executionPlan.flatMap(phase => {
                    return phase.nodes.flatMap(node => {
                        return {
                            userId : workflow.userId,
                            status: ExecutionPhaseStatus.CREATED, // Initial node status
                            number: phase.phase, // Phase number
                            node: JSON.stringify(node), // Store node as JSON
                            name: TaskRegistry[node.data.type].label // Human-readable task name
                        }
                    })
                })
            }
        },
    });

    await ExecuteWorkflow(execution.id , nextRunAt)
    revalidatePath(`/workflows`);
    return new Response (null, { status: 200 });

    } catch (error) {
        return Response.json({ error: "internal server error" }, { status: 500 });
    }
}

export async function GET(request: Request) {
    return handleWorkflowExecution(request);
}

export async function POST(request: Request) {
    return handleWorkflowExecution(request);
}