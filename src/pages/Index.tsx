import { useState } from "react";
import Navbar from "@/components/Navbar";
import AnalysisForm from "@/components/AnalysisForm";
import ComplexityDashboard from "@/components/ComplexityDashboard";
import { ComplexityAnalyzer, ComplexityMetrics } from "@/utils/complexity-analyzer";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [metrics, setMetrics] = useState<ComplexityMetrics | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedUrl, setAnalyzedUrl] = useState<string>("");
  const { toast } = useToast();
  
  const analyzer = new ComplexityAnalyzer();

  const handleAnalyze = async (data: { type: 'url' | 'file', content: string }) => {
    setIsAnalyzing(true);
    
    toast({
      title: "Početak analize",
      description: data.type === 'url' ? "Dohvaćam i analiziram web stranicu..." : "Analiziram uploadovani HTML...",
    });

    try {
      let result: ComplexityMetrics;
      
      if (data.type === 'url') {
        console.log('Pokušavam analizirati URL:', data.content);
        result = await analyzer.analyzeFromUrl(data.content);
        setAnalyzedUrl(data.content);
        
        // Provjeri jesu li podaci mock ili stvarni
        if ((result as any)._isMockData) {
          const originalError = (result as any)._originalError;
          toast({
            title: "Analiza sa simuliranim podacima",
            description: `Ne mogu dohvatiti stranicu (${originalError}), prikazujem simulirane podatke.`,
            variant: "default"
          });
        } else {
          toast({
            title: "Analiza završena",
            description: "Uspješno analizirana web stranica!",
            variant: "default"
          });
        }
      } else {
        console.log('Analiziram HTML fajl...');
        result = analyzer.analyzeFromHtml(data.content);
        setAnalyzedUrl("Uploaded HTML file");
        
        toast({
          title: "Analiza završena", 
          description: "Uspješno analiziran HTML fajl!",
          variant: "default"
        });
      }
      
      console.log('Analiza rezultat:', result);
      setMetrics(result);
      
    } catch (error) {
      console.error('Analysis failed:', error);
      
      // Detaljnije error handling
      let errorTitle = "Greška pri analizi";
      let errorDescription = "Dogodila se neočekivana greška. Molimo pokušajte ponovo.";
      
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorTitle = "Greška mrože";
          errorDescription = "Ne mogu se povezati na server. Provjerite je li CORS proxy server pokrenut na portu 3001.";
        } else if (error.message.includes('HTTP 403')) {
          errorTitle = "Pristup zabranjen";
          errorDescription = "Web stranica blokira pristup. Pokušajte sa drugom stranicom ili uploadajte HTML fajl.";
        } else if (error.message.includes('HTTP 404')) {
          errorTitle = "Stranica nije pronađena";
          errorDescription = "URL koji ste unijeli ne postoji. Provjerite adresu stranice.";
        } else if (error.message.includes('ENOTFOUND')) {
          errorTitle = "Domena ne postoji";
          errorDescription = "Domena koju ste unijeli ne postoji ili nije dostupna.";
        }
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive"
      });
      
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        {!metrics ? (
          <div className="max-w-2xl mx-auto">
            <AnalysisForm onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
          </div>
        ) : (
          <ComplexityDashboard metrics={metrics} url={analyzedUrl} />
        )}
      </div>
    </div>
  );
};

export default Index;
