"use client"

import CustomDialogHeader from '@/components/CustomDialogHeader';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { createWorkflowSchema, createWorkflowSchemaType } from '@/schema/workflows';
import { Layers2Icon, Loader2, Loader2Icon } from 'lucide-react';
import React, { useCallback, useState } from 'react'
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from '@/components/ui/textarea';
import { CreateWorkflow } from '@/actions/workflows/workflows';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';


function CreateWorkflowDialog({ triggerText }: { triggerText?: string }) {
    const [open, setOpen] = useState(false);

    const form = useForm<createWorkflowSchemaType>({
        resolver: zodResolver(createWorkflowSchema),
        defaultValues: {},
    })

    const { mutate, isPending } = useMutation({
        mutationFn: CreateWorkflow,
        onSuccess: () => {
            toast.success("Workflow created", { id: "create-workflow" });
            form.reset()
            setOpen(false)
        },
        onError: () => {
            toast.error("Failed to create workflow", { id: "create-workflow" });
            form.reset()
            setOpen(false)
        },
    });

    const onSubmit = useCallback((values: createWorkflowSchemaType) => {
        toast.loading("Creating workflow ... ", { id: "create-workflow" });
        mutate(values);
    }, [mutate]);





    return (
        <Dialog open={open} onOpenChange={open => {
            setOpen(open)
        }}>
            <DialogTrigger asChild>
                <Button>{triggerText ?? "Create workflow"}</Button>
            </DialogTrigger>
            <DialogContent className="px-0">
                <CustomDialogHeader
                    icon={Layers2Icon}
                    title="Create workflow"
                    subTitle="Start building your workflow" />

                <div className="p-6">
                    <Form {...form}>
                        <form className="space-y-8 w-full"
                            onSubmit={form.handleSubmit(onSubmit)}>
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex gap-1 items-center">
                                            Name
                                            <p className="text-xs text-primary">(required)</p>
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Choose a descriptive and unique name
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex gap-1 items-center">
                                            Description
                                            <p className="text-xs text-muted-foreground">(optional)</p>
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea className='resize-none' {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Provide a brief description of what your workflow does.
                                            <br /> This is optional byt can help you remember the
                                            workflow&apos;s purpose
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button disabled={isPending} type="submit" className="w-full">
                                {!isPending ? "Proceed" : <Loader2 className='animate-spin' />}
                            </Button>
                        </form>
                    </Form>
                </div>

            </DialogContent>
        </Dialog>
    )
}

export default CreateWorkflowDialog;