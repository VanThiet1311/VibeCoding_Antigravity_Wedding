/**
 * Staff Route Group Layout
 * Full-screen, no sidebar - designed for reception tablets/phones.
 * Protected: user must be logged in.
 */
export default function StaffLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-950 text-white">
            {children}
        </div>
    );
}
