import { type Metadata } from "next";
import ClientBody from "./ClientBody";
import "./globals.css";

export const metadata: Metadata = {
  title: "Academic Calendar Generator",
  description: "Create detailed academic calendars for institutions by entering the semester start date and number of weeks. Generate calendars for different years and faculties.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClientBody>{children}</ClientBody>
      </body>
    </html>
  );
}
