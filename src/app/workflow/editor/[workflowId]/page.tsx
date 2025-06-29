import prisma from "@/lib/db/prisma";
import { waitFor } from "@/lib/helper/waitFor";
import { auth } from "@clerk/nextjs/server";
import Editor from "../../_components/Editor";

async function page({ params }: { params: { workflowId: string } }) {
    const { workflowId } = params;
    const { userId } = auth();
    if (!userId) return <div>unauthenticated</div>;
    
    const workflow = await prisma.workflow.findUnique({
        where: {
            id: workflowId,
            userId,
        }
    });

    if (!workflow) {
        return <div> TODO  : Workflow not found</div>;
    }
    return (
        <Editor workflow={workflow} />
    )
}
export default page;