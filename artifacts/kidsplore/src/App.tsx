import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import { ConfettiProvider } from "@/components/confetti-context";

// Pages
import { Home } from "@/pages/home";
import { AnimateStudio } from "@/pages/animate";
import { Robotics } from "@/pages/robotics";
import { Worlds } from "@/pages/worlds";
import { Games } from "@/pages/games";
import { Achievements } from "@/pages/achievements";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/animate" component={AnimateStudio} />
        <Route path="/robotics" component={Robotics} />
        <Route path="/worlds" component={Worlds} />
        <Route path="/games" component={Games} />
        <Route path="/achievements" component={Achievements} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ConfettiProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </ConfettiProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
