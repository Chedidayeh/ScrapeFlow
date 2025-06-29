"use server"


import prisma from "@/lib/db/prisma";
import { getAppUrl } from "@/lib/helper/appUrl";
import { stripe } from "@/lib/stripe/stripe";
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

export async function PurchaseCredits(packId: PackId) {
    const { userId } = auth();
    if (!userId) {
        throw new Error("unauthenticated");
    }

    const selectedPack = getCreditsPack(packId);
    if (!selectedPack) {
        throw new Error("invalid pack");
    }
    const priceId = selectedPack?.priceId;

    const session = await stripe.checkout.sessions.create({
        mode: "payment",
        invoice_creation: {
            enabled: true,
        },
        success_url: getAppUrl("billing"),
        cancel_url: getAppUrl("billing"),
        metadata: {
            userId,
            packId,
        },
        line_items: [
            {
                quantity: 1,
                price: selectedPack.priceId,
            },

        ],
    });

    if (!session.url) {
        throw new Error("cannot create stripe session");
    }
    redirect(session.url);

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

export async function DownloadInvoice(id: string) {
    const { userId } = auth();
    if (!userId) {
        throw new Error("unauthenticated");
    }

    const purchase = await prisma.userPurchase.findUnique({
        where: {
            id,
            userId,
        },
    });

    if (!purchase) {
        throw new Error("bad request");
    }

    const session = await stripe.checkout.sessions.retrieve
        (purchase.stripeId);

    if (!session.invoice) {
        throw new Error("invoice not found");
    }

    const invoice = await stripe.invoices.retrieve(session.invoice as string);

    return invoice.hosted_invoice_url;


}


