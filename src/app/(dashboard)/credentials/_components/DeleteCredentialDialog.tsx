"use client"

import { DeleteCredential } from "@/actions/credentials/actions";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";


interface Props {
    credentialName: string

}
function DeleteCredentialDialog({ credentialName }: Props) {
    const [open, setOpen] = useState(false);
    const [confirmText, setConfirmText] = useState("");

    const deleteMutation = useMutation({
        mutationFn: DeleteCredential,
        onSuccess: () => {
            toast.success("Credential deleted successfully", { id: credentialName });
            setConfirmText("")
        },
        onError: () => {
            toast.error("Something went wrong", { id: credentialName });
        }
    })



    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant={"destructive"} size={"icon"}>
                    <XIcon size={18} strokeWidth={6} />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure ?</AlertDialogTitle>
                    <AlertDialogDescription>
                        If you delete this Credential, you will not be able to recover it.
                        <div className="flex flex-col py-4 gap-2">
                            <p>
                                If you are sure, enter <b>{credentialName}</b> to confirm:
                            </p>
                            <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} />
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setConfirmText("")}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={confirmText !== credentialName || deleteMutation.isPending}
                        onClick={(e) => {
                            e.stopPropagation();
                            toast.loading("Deleting Credential ... ", { id: credentialName })
                            deleteMutation.mutate(credentialName);
                        }}
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}


export default DeleteCredentialDialog