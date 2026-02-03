import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Book Viewing | Agents",
    description: "Confirm your property viewing and pay securely with M-Pesa",
};

export default function BookingLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
