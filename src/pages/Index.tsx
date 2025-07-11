import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Session } from "@supabase/supabase-js";
import Auth from "./Auth";
import Dashboard from "./Dashboard";
import Trades from "./Trades";
import AccountsPage from "./Accounts";
import MainLayout from "@/components/Layout/MainLayout";
import GrowthPath from "./GrowthPath";
import ChecklistPage from "./ChecklistPage";
import Predictor from "./Predictor";
import AdminEvents from "./Admin/Events";
import AdminNotifications from "./Admin/Notifications";
import Performance from "./Performance";

const Index = () => {
  const [supabaseClient] = useState(() => createClientComponentClient());
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
    return <Auth />;
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
