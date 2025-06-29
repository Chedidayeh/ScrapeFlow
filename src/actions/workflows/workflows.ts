"use server"

import prisma from "@/lib/db/prisma";
import { ExecuteWorkflow } from "@/lib/helper/executeWorkflow";
import { CreateFlowNode } from "@/lib/workflow/createFlowNode";
import { FlowToExecutionPlan } from "@/lib/workflow/executionPlan";
import { CalculateWorkflowCost } from "@/lib/workflow/helpers";
import { TaskRegistry } from "@/lib/workflow/task/registry";
import { createWorkflowSchema, createWorkflowSchemaType, duplicateWorkflowSchema, duplicateWorkflowSchemaType } from "@/schema/workflows";
import { AppNode } from "@/types/appNode";
import { TaskType } from "@/types/task";
import { ExecutionPhaseStatus, WorkflowExecutionPlan, WorkflowExecutionStatus, WorkflowExecutionTrigger, WorkflowStatus } from "@/types/workflow";
import { auth } from "@clerk/nextjs/server";
import { Edge } from "@xyflow/react";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import parser, { CronExpressionParser } from 'cron-parser';

export async function GetWorkflowsForUser() {
    const { userId } = auth();
    if (!userId) {
        throw new Error("unauthenticated");
    }

    return prisma.workflow.findMany({
        where: {
            userId,
        },
        orderBy: {
            createdAt: "asc",
        },
    })
}


export async function CreateWorkflow(form: createWorkflowSchemaType) {
    const { success, data } = createWorkflowSchema.safeParse(form);
    if (!success) {
        throw new Error("invalid form data");
    }

    const { userId } = auth();

    if (!userId) {
        throw new Error("unathenticated");
    }

    const initialFlow: { nodes: AppNode[]; edges: Edge[] } = {
        nodes: [],
        edges: [],
    };

    initialFlow.nodes.push(CreateFlowNode(TaskType.LAUNCH_BROWSER));

    const result = await prisma.workflow.create({
        data: {
            userId,
            status: WorkflowStatus.DRAFT,
            definition: JSON.stringify(initialFlow),
            ...data,
        }
    })

    if (!result) {
        throw new Error("failed to create workflow!")
    }

    redirect(`/workflow/editor/${result.id}`)
}

export async function DuplicateWorkflow(form: duplicateWorkflowSchemaType) {
    const { success, data } = duplicateWorkflowSchema.safeParse(form);
    if (!success) {
        throw new Error("invalid form data");
    }

    const { userId } = auth();

    if (!userId) {
        throw new Error("unathenticated");
    }

    const sourceWorkflow = await prisma.workflow.findUnique({
        where: { id: data.workflowId, userId },
    });

    if (!sourceWorkflow) {
        throw new Error("workflow not found!")
    }

    const result = await prisma.workflow.create({
        data: {
            userId,
            name : data.name,
            description : data.description,
            status: WorkflowStatus.DRAFT,
            definition: sourceWorkflow.definition,
        }
    })

    if (!result) {
        throw new Error("failed to duplicate workflow!")
    }







    redirect(`/workflows`)
}


export async function DeleteWorkflow(id: string) {
    const { userId } = auth();

    if (!userId) {
        throw new Error("unathenticated");
    }
    await prisma.workflow.delete({
        where: {
            id,
            userId,

        },
    });
    revalidatePath("/workflows");
}



export async function UpdateWorkflow({
    id,
    definition,
}: {
    id: string;
    definition: string;
}) {
    const { userId } = auth();

    if (!userId) {
        throw new Error("unathenticated");
    }
    const workflow = await prisma.workflow.findUnique({
        where: {
            id,
            userId,
        },
    })


    if (!workflow) throw new Error("workflow not found");
    if (workflow.status !== WorkflowStatus.DRAFT) {
        throw new Error("workflow is not a draft");
    }

    await prisma.workflow.update({
        data: {
            definition,
        },
        where: {
            id,
            userId,
        }
    });

    revalidatePath("/workflows")

}



export async function RunWorkflow(form: {
    workflowId: string;
    flowDefinition?: string;
}) {
    // Get the current user's ID from authentication context
    const { userId } = auth();
    if (!userId) {
        // If not authenticated, throw an error
        throw new Error("unathenticated");
    }
    const { workflowId, flowDefinition } = form;
    if (!workflowId) {
        // Ensure a workflowId is provided
        throw new Error("workflowId is required");
    }
    // Fetch the workflow from the database for the current user
    const workflow = await prisma.workflow.findUnique({
        where: {
            userId,
            id: workflowId,
        }
    });

    // If the workflow does not exist, throw an error
    if (!workflow) {
        throw new Error("workflow not found");
    }
    let executionPlan: WorkflowExecutionPlan;

    let workflowDefinition = flowDefinition;

    if (workflow.status === WorkflowStatus.PUBLISHED) {
        if (!workflow.executionPlan) {
            throw new Error("no execution plan found in published workflow");
        }
        executionPlan = JSON.parse(workflow.executionPlan)
        workflowDefinition = workflow.definition
    } else {
        // workflow is a draf

        if (!flowDefinition) {
            // Ensure a flow definition is provided
            throw new Error("flow definition is not defined");
        }

        // Parse the flow definition (nodes and edges)
        const flow = JSON.parse(flowDefinition);
        // Convert the flow into an execution plan
        const result = FlowToExecutionPlan(flow.nodes, flow.edges);

        // If the flow is invalid, throw an error
        if (result.error) {
            throw new Error("flow definition not valid");
        }

        // If no execution plan was generated, throw an error
        if (!result.executionPlan) {
            throw new Error("no execution plan generated");
        }

        // Assign the execution plan
        executionPlan = result.executionPlan;

    }




    // Log the execution plan for debugging
    console.log("Execution plan", executionPlan);

    // Create a new workflow execution record in the database
    const execution = await prisma.workflowExecution.create({
        data: {
            workflowId,
            userId,
            status: WorkflowExecutionStatus.PENDING, // Initial status
            startedAt: new Date(), // Timestamp for when execution started
            trigger: WorkflowExecutionTrigger.MANUAL, // Indicates this was manually triggered
            definition: workflowDefinition,
            // Create phases and nodes for the execution
            phases: {
                create: executionPlan.flatMap(phase => {
                    return phase.nodes.flatMap(node => {
                        return {
                            userId,
                            status: ExecutionPhaseStatus.CREATED, // Initial node status
                            number: phase.phase, // Phase number
                            node: JSON.stringify(node), // Store node as JSON
                            name: TaskRegistry[node.data.type].label // Human-readable task name
                        }
                    })
                })
            }
        },
        select: {
            id: true,
            phases: true,
        }

    });

    if (!execution) {
        throw new Error("workflow execution not created");
    }

    ExecuteWorkflow(execution.id) // run this on background
    redirect(`/workflow/runs/${workflowId}/${execution.id}`)

}


export async function GetWorkflowExecutionWithPhases(executionId: string) {

    const { userId } = auth();
    if (!userId) {
        throw new Error("unauthenticated")
    }

    return prisma.workflowExecution.findUnique({
        where: {
            id: executionId,
            userId,
        },
        include: {
            phases: {
                orderBy: {
                    number: "asc"
                }
            }
        }
    })

}

export async function GetWorkflowPhaseDetails(phaseId: string) {
    const { userId } = auth();
    if (!userId) {
        throw new Error("unauthenticated");
    }

    return prisma.executionPhase.findUnique({
        where: {
            id: phaseId,
            execution: {
                userId,
            },
        },
        include: {
            logs: {
                orderBy: {
                    timestamp: "asc"
                }
            }
        }
    })
}

export async function GetWorkflowExecutions(workflowId: string) {
    const { userId } = auth();
    if (!userId) {
        throw new Error("unauthenticated");
    }
    return prisma.workflowExecution.findMany({
        where: {
            workflowId,
            userId,
        },
        orderBy: {
            createdAt: "desc",
        }
    })
}


export async function PublishWorkflow({
    id,
    flowDefinition,
}: {
    id: string;
    flowDefinition: string;
}) {
    const { userId } = auth();
    if (!userId) {
        throw new Error("unathenticated");
    }

    const workflow = await prisma.workflow.findUnique({
        where: {
            id,
            userId,
        }
    });

    if (!workflow) {
        throw new Error("workflow not found");
    }

    if (workflow.status !== WorkflowStatus.DRAFT) { throw new Error("workflow is not a draft"); }

    const flow = JSON.parse(flowDefinition);
    const result = FlowToExecutionPlan(flow.nodes, flow.edges)
    if (result.error) {
        throw new Error("flow definition not valid");
    }

    if (!result.executionPlan) {
        throw new Error("no execution plan generated");
    }

    const creditsCost = CalculateWorkflowCost(flow.nodes);

    await prisma.workflow.update({
        where: {
            id,
            userId,
        },
        data: {
            definition: flowDefinition,
            executionPlan: JSON.stringify(result.executionPlan),
            creditsCost,
            status: WorkflowStatus.PUBLISHED,
        }
    })


    revalidatePath(`/workflow/editor/${id}`);


}

export async function UnPublishWorkflow({
    id,
}: {
    id: string;
}) {
    const { userId } = auth();
    if (!userId) {
        throw new Error("unathenticated");
    }

    const workflow = await prisma.workflow.findUnique({
        where: {
            id,
            userId,
        }
    });

    if (!workflow) {
        throw new Error("workflow not found");
    }

    if (workflow.status !== WorkflowStatus.PUBLISHED) { throw new Error("workflow is not published"); }



    await prisma.workflow.update({
        where: {
            id,
            userId,
        },
        data: {
            executionPlan: null,
            creditsCost: 0,
            status: WorkflowStatus.DRAFT,
        }
    })


    revalidatePath(`/workflow/editor/${id}`);


}

export async function UpdateWorkflowCron({
    id,
    cron,
}: {
    id: string;
    cron: string;
}) {
    const { userId } = auth();
    if (!userId) {
        throw new Error("unauthenticated");
    }

    try {
        const interval = CronExpressionParser.parse(cron, { tz: 'Europe/London' });

        await prisma.workflow.update({
            where: { id, userId },
            data: {
                cron,
                nextRunAt: interval.next().toDate(),
            }
        })



    } catch (error: any) {
        console.error("invalid cron:", error.message);
        throw new Error("invalid cron expression");
    }

    revalidatePath(`/workflows`);



}

export async function RemoveWorkflowCron({
    id,
}: {
    id: string;
}) {
    const { userId } = auth();
    if (!userId) {
        throw new Error("unauthenticated");
    }

    await prisma.workflow.update({
        where: { id, userId },
        data: {
            cron: null,
            nextRunAt: null,
        }
    })

    revalidatePath(`/workflows`);

}