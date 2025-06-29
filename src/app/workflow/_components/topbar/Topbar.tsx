"use client";

import TooltipWrapper from "@/components/TooltipWrapper";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import SaveBtn from "./SaveBtn";
import ExecuteBtn from "./ExecuteBtn";
import NavigationTabs from "./NavigationTabs";
import PublishBtn from "./PublishBtn";
import UnPublishBtn from "./UnPublishBtn";

interface Props {
    title: string;
    subTitle?: string
    workflowId: string
    hideButtons?: boolean
    isPublished?: boolean
}
export default function Topbar({ title, subTitle, workflowId, hideButtons = false, isPublished = false }: Props) {
    const router = useRouter();
    return (
        <header className="flex items-center p-2 border-b-2 border-separate w-full h-[60px] sticky top-0 bg-background z-10">
            <div className="flex gap-1 flex-1 min-w-0">
                <TooltipWrapper content="Back">
                    <Button variant={"ghost"} size={"icon"} onClick={() => router.back()}>
                        <ChevronLeftIcon size={20} />
                    </Button>
                </TooltipWrapper>
                <div className="min-w-0">
                    <p className="font-bold text-ellipsis truncate">{title}</p>
                    {subTitle && (
                        <p className="text-xs text-muted-foreground truncate text-ellipsis">
                            {subTitle}
                        </p>
                    )}
                </div>
            </div>
            <div className="flex-0 flex justify-center items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full pointer-events-none">
                <div className="pointer-events-auto">
                    <NavigationTabs workflowId={workflowId} />
                </div>
            </div>
            {!hideButtons && (
                <div className="flex gap-1 flex-1 justify-end min-w-0">
                    <ExecuteBtn workflowId={workflowId} />
                    {isPublished && (
                        <UnPublishBtn  workflowId={workflowId} />

                    )}
                    {!isPublished && (
                        <>
                            <SaveBtn workflowId={workflowId} />
                            <PublishBtn workflowId={workflowId} />
                        </>
                    )}


                </div>
            )}
        </header>
    )
}