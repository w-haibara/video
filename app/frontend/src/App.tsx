import { Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { EditorPage } from "./pages/EditorPage";
import { JobLogPage } from "./pages/JobLogPage";
import { PreviewTestPage } from "./pages/PreviewTestPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/projects/:id" element={<EditorPage />} />
      <Route path="/projects/:id/jobs" element={<JobLogPage />} />
      <Route path="/preview-test" element={<PreviewTestPage />} />
    </Routes>
  );
}
