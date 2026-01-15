import { Metadata } from "next";

export const metadata: Metadata = {
    title: "How It Works | House Haunters",
    description: "Learn how House Haunters connects tenants with verified agents for secure property viewings",
};

export default function HowItWorksLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
