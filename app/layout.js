import Logo from "@/app/_components/Logo";
import Navigation from "@/app/_components/Navigation";

import { Josefin_Sans } from "next/font/google";

const josefin = Josefin_Sans({
  subsets: ["latin"],
  display: "swap",
});

import "@/app/_styles/globals.css";
import Header from "./_components/Header";
// import { ReservationProvider } from "./_components/ReservationContext"; // Removed

export const metadata = {
  title: {
    template: "%s | Gym Management Platform", // Updated
    default: "Welcome | Gym Management Platform", // Updated
  },
  description:
    "Manage your gym and memberships, or find the perfect gym for your fitness journey.", // Updated
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${josefin.className} antialiased bg-primary-950 text-primary-100 min-h-screen flex flex-col relative`}
      >
        <Header />

        <div className="flex-1 px-8 py-12 grid">
          <main className="max-w-7xl mx-auto w-full">
            {children} {/* Removed ReservationProvider wrapper */}
          </main>
        </div>
      </body>
    </html>
  );
}
