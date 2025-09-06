import prisma from "@/lib/db/prisma";
import { getAppUrl } from "@/lib/helper/appUrl";
import { WorkflowStatus } from "@/types/workflow";

export async function GET(req: Request) {
    try {
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
        
        // Trigger workflows in parallel but don't wait for them
        const triggerPromises = workflows.map(workflow => 
            triggerWorkflow(workflow.id).catch(err => 
                console.error("Error triggering workflow", workflow.id, ":", err.message)
            )
        );
        
        // Don't await the triggers to avoid blocking the response
        Promise.all(triggerPromises);

        return new Response(null, { status: 200 });
    } catch (error) {
        console.error("Error in cron job:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
}

async function triggerWorkflow(workflowId: string): Promise<void> {
    try {
        const apiSecret = process.env.API_SECRET;
        if (!apiSecret) {
            throw new Error("API_SECRET environment variable is not set");
        }

        const triggerApiUrl = getAppUrl(`api/workflows/execute?workflowId=${workflowId}`);

        const response = await fetch(triggerApiUrl, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiSecret}`,
                'Content-Type': 'application/json',
            },
            cache: "no-store",
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (err) {
        console.error(
            "Error triggering workflow with id",
            workflowId,
            ":error->",
            err instanceof Error ? err.message : 'Unknown error'
        );
        throw err; // Re-throw to be caught by the caller
    }
}
