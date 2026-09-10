import type { Metadata } from "next";
export const metadata: Metadata = {title:"Empowered Cooks KPI Tracker",description:"Weekly product performance and placement tracking."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
