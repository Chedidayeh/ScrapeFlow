"use client"
import { RemoveWorkflowCron, UpdateWorkflowCron } from '@/actions/workflows/workflows'
import CustomDialogHeader from '@/components/CustomDialogHeader'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useMutation } from '@tanstack/react-query'
import { Calendar1Icon, CalendarIcon, ClockIcon, TriangleAlertIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import cronstrue from "cronstrue";
import parser, { CronExpressionParser } from 'cron-parser';
import { Separator } from '@/components/ui/separator'

export default function SchedulerDialog(props: { workflowId: string, cron: string | null }) {

    const [cron, setCron] = useState(props.cron || "");
    const [validCron, setValidCron] = useState(props.cron ? true : false);
    const [readableCron, setReadableCron] = useState("");

    const mutation = useMutation({
        mutationFn: UpdateWorkflowCron,
        onSuccess: () => {
            toast.success("Schedule updated successfully", { id: "cron" })
        },
        onError: () => {
            toast.error("Somnething went wrong", { id: "cron" });
        },
    })

    const removeMutation = useMutation({
        mutationFn: RemoveWorkflowCron,
        onSuccess: () => {
            toast.success("Schedule removed successfully", { id: "cron" })
        },
        onError: () => {
            toast.error("Somnething went wrong", { id: "cron" });
        },
    })

    useEffect(() => {
        try {
            CronExpressionParser.parse(cron);
            const humanCronStr = cronstrue.toString(cron);
            setValidCron(true);
            setReadableCron(humanCronStr)
        } catch (error) {
            setValidCron(false);
        }
    }, [cron]);


    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant={"link"}
                    size={"sm"}
                    className={cn("text-sm p-0 h-auto text-orange-500",
                        validCron && "text-primary"
                    )}
                >
                    {validCron && (
                        <div className="flex items-center gap-2">
                            <ClockIcon />
                            {readableCron}
                        </div>
                    )}
                    {!validCron && (
                        <div className="flex items-center gap-1">
                            <TriangleAlertIcon className="h-3 w-3" /> Set schedule
                        </div>
                    )}

                </Button>
            </DialogTrigger>
            <DialogContent className="px-0">
                <CustomDialogHeader title='Schedule workflow execution' icon={CalendarIcon} />
                <div className="p-6 space-y-4">
                    <p className="text-muted-foreground text-sm">
                        Specify a cron expression to schedule periodic workflow execution.
                        All times are in UTC
                    </p>
                    <Input
                        value={cron}
                        onChange={(e) => setCron(e.target.value)}
                        placeholder="E.g. * * * * *" />

                    {cron != "" && (
                        <div
                            className={cn(
                                "bg-accent rounded-md p-4 border text-sm border-destructive text-destructive",
                                validCron && "border-primary text-primary"
                            )}
                        >

                            {validCron ? readableCron : "Not a valid cron expression"}
                        </div>
                    )}

                    {props.cron && (
                        <DialogClose asChild>
                            <div className="">
                                <Button 
                                onClick={()=>{
                                    removeMutation.mutate({
                                        id : props.workflowId
                                    })
                                }}
                                disabled={mutation.isPending || removeMutation.isPending}
                                className="w-full text-destructive border-destructive hover:text-destructive" variant={"outline"}>
                                    Remove current schedule
                                </Button>
                                <Separator className='my-4'/>
                            </div>
                        </DialogClose>
                    )}



                </div>
                <DialogFooter className="px-6 gap-2">
                    <DialogClose asChild>
                        <Button className="w-full" variant={"secondary"}>
                            Cancel
                        </Button>
                    </DialogClose>
                    <DialogClose asChild>
                        <Button
                            disabled={cron === "" || !validCron || mutation.isPending}
                            onClick={() => {
                                mutation.mutate({
                                    id: props.workflowId,
                                    cron
                                })
                            }}
                            className="w-full">Save</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    )
}
