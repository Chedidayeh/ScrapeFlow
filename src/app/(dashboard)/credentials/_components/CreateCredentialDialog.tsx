"use client"

import CustomDialogHeader from '@/components/CustomDialogHeader';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { createWorkflowSchema, createWorkflowSchemaType } from '@/schema/workflows';
import { Layers2Icon, Loader2, Loader2Icon, ShieldEllipsis } from 'lucide-react';
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
import { createCredentialSchema, createCredentialSchemaType } from '@/schema/credential';
import { CreateCredential } from '@/actions/credentials/actions';


function CreateCredentialDialog({ triggerText }: { triggerText?: string }) {
    const [open, setOpen] = useState(false);

    const form = useForm<createCredentialSchemaType>({
        resolver: zodResolver(createCredentialSchema),
    })

    const { mutate, isPending } = useMutation({
        mutationFn: CreateCredential,
        onSuccess: () => {
            toast.success("Credential created", { id: "create-Credential" });
        },
        onError: () => {
            toast.error("Failed to create Credential", { id: "create-Credential" });
        },
    });

    const onSubmit = useCallback((values: createCredentialSchemaType) => {
        toast.loading("Creating Credential ... ", { id: "create-Credential" });
        mutate(values);
    }, [mutate]);





    return (
        <Dialog open={open} onOpenChange={open => {
            form.reset()
            setOpen(open)
        }}>
            <DialogTrigger asChild>
                <Button>{triggerText ?? "Create"}</Button>
            </DialogTrigger>
            <DialogContent className="px-0">
                <CustomDialogHeader
                    icon={ShieldEllipsis}
                    title="Create Credential"
                />

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
                                            Enter a unique an descriptive name for the credential
                                            <br />
                                            This name will be user to identify the credential.                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="value"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex gap-1 items-center">
                                            Value
                                            <p className="text-xs text-primary">(required)</p>
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea className='resize-none' {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Enter the value associated with this credential
                                            <br /> This value will be securely encrypted and stored
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

export default CreateCredentialDialog;