"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";

export default function InvitationsPage() {
    const [invitations, setInvitations] = useState<{ _id: string, eventType: string, eventDate: string, invitationType: string, giftType: string, giftAmount: number, personId?: { fullName: string } }[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchInvitations = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/invitations");
            if (res.ok) {
                const data = await res.json();
                setInvitations(data);
            }
        } catch (error) {
            console.error("Failed to fetch invitations", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInvitations();
    }, [fetchInvitations]);

    return (
        <div className="min-h-screen bg-background">
            <nav className="bg-surface border-b border-border px-4 py-4 flex flex-col sm:flex-row justify-between items-center sm:px-6 lg:px-8 gap-4">
                <h1 className="text-xl font-serif font-bold text-foreground">Invitations</h1>
                <button className="px-4 py-2 bg-wedding-600 text-white text-sm font-medium rounded-md hover:bg-wedding-700 transition">
                    Log New Invitation
                </button>
            </nav>

            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-surface border border-border p-6 rounded-lg shadow-sm">
                        <h3 className="text-lg font-medium text-foreground mb-1">Total Sent</h3>
                        <p className="text-3xl font-bold text-wedding-600">{invitations.filter((i) => i.invitationType === 'sent').length}</p>
                    </div>
                    <div className="bg-surface border border-border p-6 rounded-lg shadow-sm">
                        <h3 className="text-lg font-medium text-foreground mb-1">Total Received</h3>
                        <p className="text-3xl font-bold text-wedding-600">{invitations.filter((i) => i.invitationType === 'received').length}</p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-foreground/50">Loading invitations...</div>
                ) : (
                    <div className="bg-surface border border-border shadow-sm rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-border">
                            <thead className="bg-background">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Event</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Person</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Gift</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-foreground/70 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-surface divide-y divide-border">
                                {invitations.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-8 text-center text-foreground/50">No invitations logged yet.</td></tr>
                                ) : invitations.map((inv) => (
                                    <tr key={inv._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-foreground capitalize">{inv.eventType}</div>
                                            <div className="text-sm text-foreground/60">{format(new Date(inv.eventDate), 'PPP')}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/70">
                                            {inv.personId?.fullName || 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${inv.invitationType === 'sent' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                                {inv.invitationType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/70">
                                            {inv.giftType !== 'none' ? `${inv.giftType} (${inv.giftAmount?.toLocaleString() || 0})` : 'None'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button className="text-wedding-600 hover:text-wedding-900 mx-2">Edit</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}
