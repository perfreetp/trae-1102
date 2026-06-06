import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import Replenishment from "@/pages/Replenishment";
import Promotion from "@/pages/Promotion";
import Schedule from "@/pages/Schedule";
import Inspection from "@/pages/Inspection";
import Reports from "@/pages/Reports";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/replenishment" element={<Replenishment />} />
          <Route path="/promotion" element={<Promotion />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/inspection" element={<Inspection />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
      </Routes>
    </Router>
  );
}
