import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Guardian from "@/pages/guardian";
import Enforcer from "@/pages/enforcer";
import Defender from "@/pages/defender";
import Architect from "@/pages/architect";
import Coach from "@/pages/coach";
import PolicyBuilder from "@/pages/policy-builder";
import IdentityAccess from "@/pages/identity-access";
import MlModels from "@/pages/ml-models";
import Analytics from "@/pages/analytics";
import Sidebar from "@/components/sidebar";

function Router() {
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/guardian" component={Guardian} />
          <Route path="/enforcer" component={Enforcer} />
          <Route path="/defender" component={Defender} />
          <Route path="/architect" component={Architect} />
          <Route path="/coach" component={Coach} />
          <Route path="/policy-builder" component={PolicyBuilder} />
          <Route path="/identity-access" component={IdentityAccess} />
          <Route path="/ml-models" component={MlModels} />
          <Route path="/analytics" component={Analytics} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
