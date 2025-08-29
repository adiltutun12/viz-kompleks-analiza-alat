import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Globe } from "lucide-react";

const Results = () => {
  // Mock data for demonstration
  const mockResults = [
    {
      id: 1,
      url: "https://example.com",
      complexity: 45,
      date: "2025-01-03",
      metrics: { dom: 42, visual: 38, layout: 55, interactivity: 35 }
    },
    {
      id: 2,
      url: "https://news.ycombinator.com",
      complexity: 25,
      date: "2025-01-02",
      metrics: { dom: 20, visual: 15, layout: 30, interactivity: 35 }
    },
    {
      id: 3,
      url: "https://amazon.com",
      complexity: 78,
      date: "2025-01-01",
      metrics: { dom: 85, visual: 70, layout: 80, interactivity: 75 }
    }
  ];

  const getComplexityColor = (score: number) => {
    if (score < 30) return "text-green-400";
    if (score < 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getComplexityBadge = (score: number) => {
    if (score < 30) return <Badge variant="secondary" className="bg-green-500/20 text-green-400">Niska</Badge>;
    if (score < 60) return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">Srednja</Badge>;
    return <Badge variant="secondary" className="bg-red-500/20 text-red-400">Visoka</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Sačuvani Rezultati
          </h1>
          <p className="text-muted-foreground text-lg">
            Pregled historije analiza kompleksnosti
          </p>
        </div>

        <div className="grid gap-6">
          {mockResults.map((result) => (
            <Card key={result.id} className="border-border bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-all">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <CardTitle className="flex items-center gap-2 text-primary">
                      <Globe className="h-5 w-5" />
                      {result.url}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {result.date}
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className={`text-3xl font-bold ${getComplexityColor(result.complexity)}`}>
                      {result.complexity}/100
                    </div>
                    {getComplexityBadge(result.complexity)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">DOM</div>
                    <div className="text-lg font-semibold">{result.metrics.dom}/100</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Vizuelno</div>
                    <div className="text-lg font-semibold">{result.metrics.visual}/100</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Layout</div>
                    <div className="text-lg font-semibold">{result.metrics.layout}/100</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Interakcije</div>
                    <div className="text-lg font-semibold">{result.metrics.interactivity}/100</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {mockResults.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Još nema sačuvanih rezultata analiza
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;