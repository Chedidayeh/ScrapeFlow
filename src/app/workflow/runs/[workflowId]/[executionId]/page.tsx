import { GetWorkflowExecutionWithPhases } from "@/actions/workflows/workflows";
import Topbar from "@/app/workflow/_components/topbar/Topbar";
import { auth } from "@clerk/nextjs/server";
import { Loader2Icon } from "lucide-react";
import { Suspense } from "react";
import ExecutionViewer from "./_components/ExecutionViewer";

export default function ExecutionViewerPage({
    params,
}: {
    params: {
        executionId: string;
        workflowId: string;
    };
}) {
    return (
        <div className="flex flex-col h-screen w-full overflow-hidden">
            <Topbar workflowId={params.workflowId}
                title="Workflow run details"
                subTitle={`Run ID : ${params.executionId}`}
                hideButtons={true}
            />
            <section className="flex h-full overflow-auto">
                <Suspense fallback={
                    <div className="flex w-full items-center justify-center">
                        <Loader2Icon className="h-10 w-10 animate-spin
                    stroke-primary" />
                    </div>
                } >
                    <ExecutionViewerWrapper executionId={params.executionId} />
                </Suspense>
            </section>
        </div>
    )
}


async function ExecutionViewerWrapper({
    executionId,
}: {
    executionId: string;
}) {

    const workflowExecution = await GetWorkflowExecutionWithPhases(executionId);
    if (!workflowExecution) {
        return <div>Not found</div>;
    }
    return <ExecutionViewer initialData={workflowExecution} />;
}