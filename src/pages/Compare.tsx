import { useState } from "react";
import Navbar from "@/components/Navbar";
import AnalysisForm from "@/components/AnalysisForm";
import MetricsCard from "@/components/MetricsCard";
import { ComplexityAnalyzer, ComplexityMetrics } from "@/utils/complexity-analyzer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Compare = () => {
  const [sites, setSites] = useState<Array<{ url: string; metrics: ComplexityMetrics }>>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const analyzer = new ComplexityAnalyzer();

  const handleAnalyze = async (data: { type: 'url' | 'file', content: string }) => {
    setIsAnalyzing(true);
    try {
      let result: ComplexityMetrics;
      
      if (data.type === 'url') {
        result = await analyzer.analyzeFromUrl(data.content);
        setSites(prev => [...prev, { url: data.content, metrics: result }]);
      } else {
        result = analyzer.analyzeFromHtml(data.content);
        setSites(prev => [...prev, { url: "Uploaded HTML file", metrics: result }]);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearAll = () => {
    setSites([]);
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Poređenje Stranica
          </h1>
          <p className="text-muted-foreground text-lg">
            Analizirajte i uporedite kompleksnost više web stranica
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-8">
          <AnalysisForm onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
        </div>

        {sites.length > 0 && (
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Rezultati poređenja</h2>
            <Button variant="outline" onClick={clearAll}>
              Obriši sve
            </Button>
          </div>
        )}

        {sites.length > 0 && (
          <div className="grid gap-6">
            {sites.map((site, index) => (
              <Card key={index} className="border-border bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-primary">{site.url}</CardTitle>
                  <div className="text-2xl font-bold text-foreground">
                    Kompleksnost: {site.metrics.complexityScore}/100
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MetricsCard
                      title="DOM Elementi"
                      value={site.metrics.totalElements}
                      maxValue={1000}
                    />
                    <MetricsCard
                      title="Dubina DOM"
                      value={site.metrics.domDepth}
                      maxValue={30}
                    />
                    <MetricsCard
                      title="Slike"
                      value={site.metrics.imageCount}
                      maxValue={100}
                    />
                    <MetricsCard
                      title="Interakcije"
                      value={site.metrics.clickableElements}
                      maxValue={50}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {sites.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Dodajte stranice za poređenje koristeći formu iznad
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Compare;