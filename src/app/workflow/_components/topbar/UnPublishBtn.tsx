"use client"

import { PublishWorkflow, RunWorkflow, UnPublishWorkflow } from '@/actions/workflows/workflows';
import useExecutionPlan from '@/components/hooks/useExecutionPlan';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { useReactFlow } from '@xyflow/react';
import { DownloadIcon, PlayIcon, UploadIcon } from 'lucide-react';
import React from 'react'
import { toast } from 'sonner';

export default function UnPublishBtn ({ workflowId }: { workflowId: string }) {

    const mutation = useMutation({
        mutationFn: UnPublishWorkflow,
        onSuccess: () => {
            toast.success("Workflow unpublished", { id: "workflowId" });
        },
        onError: () => {
            toast.error("Something went wrong", { id: "workflowId" });
        }
    })

    return (
        <Button
            disabled={mutation.isPending}
            onClick={() => {
                mutation.mutate({
                    id: workflowId,
                })
            }} variant={"outline"} className="flex items-center gap-2">
            <DownloadIcon size={16} className="stroke-orange-500" />
            Unpublish
        </Button>

    );
}
