import prisma from "@/lib/db/prisma";
import { getAppUrl } from "@/lib/helper/appUrl";
import { WorkflowStatus } from "@/types/workflow";
import { cache } from "react";

export async function GET(req: Request) {
    const now = new Date();
    const workflows = await prisma.workflow.findMany({
        select: { id: true },
        where: {
            status: WorkflowStatus.PUBLISHED,
            cron: { not: null },
            nextRunAt: { lte: now },

        },
    });

    console.log("@@WORKFLOW TO RUN", workflows.length);
    for (const workflow of workflows) {
        triggerWorkflow(workflow.id);
    }



    return new Response(null, { status: 200 });

}

function triggerWorkflow(workflowId: string) {
    const triggerApiUrl = getAppUrl(`api/workflows/execute?workflowId=${workflowId}`)

    fetch(triggerApiUrl, {
        headers: {
            Authorization: `Bearer ${process.env.API_SECRET!}`
        },
        cache: "no-store",
    }).catch((err) => console.error(
        "Error triggering workflow with id",
        workflowId,
        ":error->",
        err.message)
    )
}
