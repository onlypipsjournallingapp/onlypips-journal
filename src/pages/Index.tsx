
import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { Session } from "@supabase/supabase-js";
import Auth from "./Auth";
import Dashboard from "./Dashboard";
import Trades from "./Trades";
import AccountsPage from "./Accounts";
import MainLayout from "@/components/Layout/MainLayout";
import GrowthPath from "./GrowthPath";
import ChecklistPage from "./ChecklistPage";
import Predictor from "./Predictor";
import AdminEvents from "./AdminEvents";
import AdminNotifications from "./AdminNotifications";
import Performance from "./Performance";

const Index = () => {
  const [supabaseClient] = useState(() => createClient(
    "https://ewzsiiclccdhszlbqzex.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3enNpaWNsY2NkaHN6bGJxemV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxMDc1NzMsImV4cCI6MjA1OTY4MzU3M30.6vMbsVs0N4h_hmlB-kOMRfaEfkbrffQGYSAhc6XA1uY"
  ));
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getSession = async () => {
      setLoading(true);
      const { data: { session } } = await supabaseClient.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    getSession();

    supabaseClient.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });
  }, [supabaseClient]);

  const handleLogout = async () => {
    await supabaseClient.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-pulse text-primary text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return <Auth onLogin={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <MainLayout onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard userId={session.user.id} />} />
          <Route path="/dashboard" element={<Dashboard userId={session.user.id} />} />
          <Route path="/trades" element={<Trades userId={session.user.id} />} />
          <Route path="/accounts" element={<AccountsPage userId={session.user.id} />} />
          <Route path="/performance" element={<Performance userId={session.user.id} />} />
          <Route path="/growth-path" element={<GrowthPath userId={session.user.id} />} />
          <Route path="/checklist" element={<ChecklistPage userId={session.user.id} />} />
          <Route path="/predictor" element={<Predictor userId={session.user.id} />} />
          <Route path="/admin/events" element={<AdminEvents />} />
          <Route path="/admin/notifications" element={<AdminNotifications />} />
        </Routes>
      </MainLayout>
    </div>
  );
};

export default Index;
