import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import KLine from "./pages/KLine";
import Market from "./pages/Market";
import Submit from "./pages/Submit";
import About from "./pages/About";

function Router() {
  return (
    <Switch>
      {/* 首页 = 个人K线 */}
      <Route path={"/"} component={KLine} />
      {/* 大盘为次要页面 */}
      <Route path={"/market"} component={Market} />
      <Route path={"/submit"} component={Submit} />
      <Route path={"/about"} component={About} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
