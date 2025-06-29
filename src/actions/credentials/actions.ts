"use server"

import prisma from "@/lib/db/prisma";
import { symmetricEncrypt } from "@/lib/encryption";
import { createCredentialSchema, createCredentialSchemaType } from "@/schema/credential";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function GetCredentialsForUser() {
    const { userId } = auth();
    if (!userId) {
        throw new Error("unauthenticated");
    }

    return prisma.credential.findMany({
        where: { userId },
        orderBy: {
            name: "asc",
        }
    });
}

export async function CreateCredential(form: createCredentialSchemaType) {

    const { success, data } = createCredentialSchema.safeParse(form);
    if (!success) {
        throw new Error("invalid form data");
    }

    const { userId } = auth();

    if (!userId) {
        throw new Error("unathenticated");
    }

    const encryptedValue = symmetricEncrypt(data.value);

    const result = await prisma.credential.create({
        data: {
            userId,
            name: data.name,
            value: encryptedValue,
        }
    });

    if (!result) {
        throw new Error("failed to create credential");
    }

    revalidatePath("/credentials");


}


export async function DeleteCredential(credentialName: string) {

    const { userId } = auth();

    if (!userId) {
        throw new Error("unathenticated");
    }

    await prisma.credential.delete({
        where: {
            name_userId: {
                userId,
                name: credentialName,
            }

        }
    })

    revalidatePath("/credentials");

}





