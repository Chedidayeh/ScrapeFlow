import prisma from "@/lib/db/prisma";
import { waitFor } from "@/lib/helper/waitFor";
import { auth } from "@clerk/nextjs/server";
import Editor from "../../_components/Editor";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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
        return (
            <div className='flex flex-col items-center justify-center h-screen p-4'>
            <div className='text-center'>
            <h2 className='text-2xl font-semibold mb-4'>Workflow not found</h2>
            <p className='text-muted-foreground mb-4 max-w-md'>
                    Please return Dashboard !
                </p>
                <Link href={"/"} >
                <Button size={"sm"} >
                <ArrowLeft size={16}  /> back to Dashboard 
                </Button>
                </Link>
            </div>
            
        </div>
        );
    }
    return (
        <Editor workflow={workflow} />
    )
}
export default page;