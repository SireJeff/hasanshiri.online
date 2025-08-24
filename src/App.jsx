import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { Home } from "./pages/Home";
import { NotFound } from "./pages/NotFound";
import { Toaster } from "@/components/ui/toaster";
import { useEffect } from "react";
import { ThemeProvider } from "@/lib/ThemeProvider";

function App() {
  useEffect(() => {
    // This effect is now only for dark/light mode
    const darkMode = localStorage.getItem('theme') === 'dark';
    document.documentElement.classList.toggle('dark', darkMode);
  }, []);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <HelmetProvider>
          <div className="min-h-screen bg-background text-foreground relative">
            <Toaster />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </HelmetProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
