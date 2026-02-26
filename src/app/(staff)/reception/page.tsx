import dbConnect from "@/lib/db";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/auth";
import { redirect } from "next/navigation";
import ReceptionClient from "./ReceptionClient";

export default async function ReceptionPage() {
    const sessionCookie = cookies().get("session")?.value;
    const session = await decrypt(sessionCookie);

    if (!session) {
        redirect("/login");
    }

    await dbConnect();
    
    return <ReceptionClient />;
}
