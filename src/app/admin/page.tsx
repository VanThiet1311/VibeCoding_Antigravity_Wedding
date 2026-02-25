import dbConnect from "@/lib/db";
import User, { UserRole } from "@/models/User";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
    const sessionCookie = cookies().get("session")?.value;
    const session = await decrypt(sessionCookie);

    // Security check, though middleware should catch this
    if (!session || session.role !== UserRole.ADMIN) {
        redirect("/dashboard");
    }

    await dbConnect();

    // Basic stats
    const totalUsers = await User.countDocuments();
    const rawUsers = await User.find({}).sort({ createdAt: -1 }).limit(10).lean();

    // Serialize for client component
    const users = rawUsers.map(user => ({
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt.toISOString()
    }));

    return (
        <div className="min-h-screen bg-background">
            <nav className="bg-surface border-b border-border px-4 py-4 flex justify-between items-center sm:px-6 lg:px-8">
                <h1 className="text-xl font-serif font-bold text-foreground">Admin Setup & Config</h1>
                <div className="flex gap-4">
                    <a href="/dashboard" className="text-sm font-medium text-wedding-600 hover:text-wedding-500">Back to App</a>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-serif font-bold text-foreground mb-8">System Overview</h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-medium text-foreground mb-2">Total Accounts</h3>
                        <p className="text-4xl font-bold text-wedding-600">{totalUsers}</p>
                    </div>
                </div>

                <h3 className="text-2xl font-serif font-bold text-foreground mb-4">Recent Users</h3>
                <div className="bg-surface border border-border shadow-sm rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-border">
                        <thead className="bg-background">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-foreground/70 uppercase tracking-wider">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="bg-surface divide-y divide-border">
                            {users.map((user) => (
                                <tr key={user._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/70">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-wedding-100 text-wedding-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground/70">{new Date(user.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
