import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Hair } from "./pages/Hair";
import { Home } from "./pages/Home";
import { SexualHealth } from "./pages/SexualHealth";
import { Skin } from "./pages/Skin";
import { Visit } from "./pages/Visit";
import { WeightLoss } from "./pages/WeightLoss";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="weight-loss" element={<WeightLoss />} />
        <Route path="sexual-health" element={<SexualHealth />} />
        <Route path="hair" element={<Hair />} />
        <Route path="skin" element={<Skin />} />
        <Route path="visit" element={<Visit />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
