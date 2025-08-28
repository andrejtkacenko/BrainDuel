import Header from "@/components/header";
import Dashboard from "@/components/dashboard";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <Dashboard />
    </div>
  );
}
