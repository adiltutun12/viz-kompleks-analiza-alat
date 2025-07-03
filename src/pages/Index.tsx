import { useState } from "react";
import Navbar from "@/components/Navbar";
import AnalysisForm from "@/components/AnalysisForm";
import ComplexityDashboard from "@/components/ComplexityDashboard";
import { ComplexityAnalyzer, ComplexityMetrics } from "@/utils/complexity-analyzer";

const Index = () => {
  const [metrics, setMetrics] = useState<ComplexityMetrics | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedUrl, setAnalyzedUrl] = useState<string>("");
  
  const analyzer = new ComplexityAnalyzer();

  const handleAnalyze = async (data: { type: 'url' | 'file', content: string }) => {
    setIsAnalyzing(true);
    try {
      let result: ComplexityMetrics;
      
      if (data.type === 'url') {
        result = await analyzer.analyzeFromUrl(data.content);
        setAnalyzedUrl(data.content);
      } else {
        result = analyzer.analyzeFromHtml(data.content);
        setAnalyzedUrl("Uploaded HTML file");
      }
      
      setMetrics(result);
    } catch (error) {
      console.error('Analysis failed:', error);
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
