import { BarChart3, FileText } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const Navbar = () => {
  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                WebComplexity Analyzer
              </h1>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors hover:text-primary ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`
                }
              >
                Analiza
              </NavLink>
              <NavLink
                to="/compare"
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors hover:text-primary ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`
                }
              >
                Poređenje
              </NavLink>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <FileText className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>O aplikaciji - WebComplexity Analyzer</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 text-sm">
                  <div>
                    <h3 className="font-semibold mb-2">Šta ova aplikacija radi:</h3>
                    <p className="text-muted-foreground">
                      WebComplexity Analyzer je alat za kvantitativnu analizu vizuelne kompleksnosti web stranica. 
                      Koristi različite metrike poput broja DOM elemenata, dubine strukture, tipografije i interakcija 
                      da bi dao numeričku ocjenu kompleksnosti stranice (0-100).
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Funkcionalnosti:</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li><strong>Analiza:</strong> Analiziraj pojedinačne stranice putem URL-a ili upload HTML fajla</li>
                      <li><strong>Poređenje:</strong> Uporedi kompleksnost više stranica istovremeno</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Metrike koje se analiziraju:</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>DOM struktura (broj elemenata, dubina)</li>
                      <li>Vizualni sadržaj (slike, boje, fontovi)</li>
                      <li>Layout kompleksnost (grid, flexbox)</li>
                      <li>Interakcije (klikabilni elementi, forme)</li>
                    </ul>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;