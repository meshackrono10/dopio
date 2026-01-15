import { Plus_Jakarta_Sans } from "next/font/google";
import SiteHeader from "./(client-components)/(Header)/SiteHeader";
import ClientCommons from "./ClientCommons";
import "./globals.css";
import "@/fonts/line-awesome-1.3.0/css/line-awesome.css";
import "@/styles/index.scss";

import "rc-slider/assets/index.css";
import "react-toastify/dist/ReactToastify.css";
import Footer from "@/components/Footer";
import FooterNav from "@/components/FooterNav";
import { ToastProvider } from "@/components/Toast";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "@/contexts/AuthContext";
import { ComparisonProvider } from "@/contexts/ComparisonContext";
import { PropertyProvider } from "@/contexts/PropertyContext";
import { BookingProvider } from "@/contexts/BookingContext";
import { InvoiceProvider } from "@/contexts/InvoiceContext";
import { MessagingProvider } from "@/contexts/MessagingContext";
import ComparisonBar from "@/components/ComparisonBar";

const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "House Haunters - The Uber for Kenyan Rental Hunting",
  description: "House Haunters is Kenya's most trusted digital platform for residential property rentals. Connect with verified agents, book viewings securely, and find your perfect home.",
  keywords: "rentals, kenya, nairobi, house haunters, verified agents, secure viewings, m-pesa",
};

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: any;
}) {
  return (
    <html lang="en" className={font.className}>
      <body className="bg-white text-base dark:bg-neutral-900 text-neutral-900 dark:text-neutral-200">
        <AuthProvider>
          <PropertyProvider>
            <BookingProvider>
              <InvoiceProvider>
                <MessagingProvider>
                  <ComparisonProvider>
                    <ToastProvider>
                      <ClientCommons />
                      <SiteHeader />
                      {children}
                      <FooterNav />
                      <Footer />
                      <ComparisonBar />
                      <ToastContainer
                        position="top-right"
                        autoClose={3000}
                        hideProgressBar={false}
                        newestOnTop
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                        theme="colored"
                      />
                    </ToastProvider>
                  </ComparisonProvider>
                </MessagingProvider>
              </InvoiceProvider>
            </BookingProvider>
          </PropertyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
