import { Metadata } from "next";

export const metadata: Metadata = {
    title: "How It Works | Agents",
    description: "Learn how Agents connects tenants with verified agents for secure property viewings",
};

export default function HowItWorksLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
