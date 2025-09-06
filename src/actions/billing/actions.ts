"use server"

import prisma from "@/lib/db/prisma";
import { getCreditsPack, PackId } from "@/types/billing";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function GetAvailableCredits() {
    const { userId } = auth();
    if (!userId) {
        throw new Error("unauthenticated");
    }

    const balance = await prisma.userBalance.findUnique({
        where: { userId },
    });
    if (!balance) return -1;
    return balance.credits;
}

export async function SetupUser() {
    const { userId } = auth();
    if (!userId) {
        throw new Error("unauthenticated");
    }

    const balance = await prisma.userBalance.findUnique({ where: { userId } });
    if (!balance) {
        // Free 1000 credits
        await prisma.userBalance.create({
            data: {
                userId,
                credits: 1000,
            }
        })
    }

    redirect("/")

}

export async function AddCredits(packId: PackId) {
    const { userId } = auth();
    if (!userId) {
        throw new Error("unauthenticated");
    }

    const selectedPack = getCreditsPack(packId);
    if (!selectedPack) {
        throw new Error("invalid pack");
    }

    // Add credits directly to user balance
    await prisma.userBalance.upsert({
        where: { userId },
        create: {
            userId,
            credits: selectedPack.credits,
        },
        update: {
            credits: {
                increment: selectedPack.credits,
            }
        }
    });

    // Record the purchase for history
    await prisma.userPurchase.create({
        data: {
            userId,
            stripeId: `manual-${Date.now()}`, // Generate a unique ID for manual purchases
            description: `${selectedPack.name} - ${selectedPack.credits} credits`,
            amount: selectedPack.price,
            currency: "usd",
        }
    });
}

export async function GetUserPurchaseHistory() {
    const { userId } = auth();
    if (!userId) {
        throw new Error("unauthenticated");
    }

    return prisma.userPurchase.findMany({
        where: { userId },
        orderBy: {
            date: "desc",
        },
    });



}



