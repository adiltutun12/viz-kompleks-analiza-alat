import { useState } from "react";
import { Upload, Globe, Loader2, FileCode, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface AnalysisFormProps {
  onAnalyze: (data: { type: 'url' | 'file', content: string }) => void;
  isAnalyzing: boolean;
}

const AnalysisForm = ({ onAnalyze, isAnalyzing }: AnalysisFormProps) => {
  const [url, setUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      toast({
        title: "Greška",
        description: "Molimo unesite validan URL",
        variant: "destructive"
      });
      return;
    }
    
    // Basic URL validation
    try {
      new URL(url);
      onAnalyze({ type: 'url', content: url });
    } catch {
      toast({
        title: "Nevalidan URL",
        description: "Molimo unesite validan URL (npr. https://example.com)",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      toast({
        title: "Nevalidan fajl",
        description: "Molimo odaberite HTML fajl",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      onAnalyze({ type: 'file', content });
    };
    reader.readAsText(file);
  };

  return (
    <Card className="shadow-card border-border">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Analiza Vizualne Kompleksnosti</CardTitle>
        <CardDescription>
          Analizirajte web stranice pomoću naprednih kvantitativnih metrika
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="url" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              URL Analiza
            </TabsTrigger>
            <TabsTrigger value="file" className="flex items-center gap-2">
              <FileCode className="h-4 w-4" />
              HTML Upload
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="url" className="space-y-4 mt-6">
            <form onSubmit={handleUrlSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">URL Web Stranice</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isAnalyzing}
                  className="focus:ring-primary"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                variant="glow"
                disabled={isAnalyzing || !url.trim()}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analiziranje...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Analiziraj Stranicu
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="file" className="space-y-4 mt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">HTML Fajl</Label>
                <div className="relative">
                  <Input
                    id="file"
                    type="file"
                    accept=".html,.htm"
                    onChange={handleFileUpload}
                    disabled={isAnalyzing}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                </div>
              </div>
              {selectedFile && (
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AnalysisForm;