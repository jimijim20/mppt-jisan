import "./globals.css";
export const metadata={title:"MQTT DB Realtime Dashboard",description:"Realtime dari MySQL + Setting"};
import Link from "next/link";
export default function RootLayout({children}:{children:React.ReactNode}){
  return(<html lang="id">
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1"/>
      <link rel="manifest" href="/manifest.webmanifest"/>
    </head>
    <body>
      <div className="max-w-7xl mx-auto p-4 space-y-4">
        <header className="glass px-4 py-3 flex flex-col gap-2 md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-accent-500/20 flex items-center justify-center">
              <span className="text-accent-400 font-bold">JS</span>
            </div>
            <div>
              <div className="text-lg font-semibold">Dashboard</div>
              <div className="text-xs text-gray-400">JisanTech</div>
            </div>
          </div>
          <nav className="md:ml-auto flex gap-2">
            <Link className="navlink" href="/">Main Page | </Link>
            <Link className="navlink" href="/history">History Page | </Link>
            <Link className="navlink" href="/setting">Setting</Link>
          </nav>
        </header>
        {children}
      </div>
    </body>
  </html>);
}
