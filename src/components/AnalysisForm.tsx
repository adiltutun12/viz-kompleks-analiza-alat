import { useState } from "react";
import { Upload, Globe, Loader2, FileCode, Zap, CheckCircle, XCircle } from "lucide-react";
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
  const [isValidatingUrl, setIsValidatingUrl] = useState(false);
  // Dodaj state za detaljniji status
  const [urlStatus, setUrlStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [urlStatusDetails, setUrlStatusDetails] = useState<{message?: string, status?: number}>({});
  const { toast } = useToast();

  // Funkcija za validaciju URL-a preko backend API-ja
  const validateUrl = async (urlToValidate: string): Promise<{valid: boolean, message?: string, status?: number}> => {
    try {
      // Koristi ispravan endpoint /api/validate
      const response = await fetch(`http://localhost:3001/api/validate?url=${encodeURIComponent(urlToValidate)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Provjeri specifične HTTP status kodove
      if (data.status) {
        if (data.status === 403) {
          return {
            valid: false,
            message: "pristup_zabranjen",
            status: data.status
          };
        } else if (data.status === 401) {
          return {
            valid: false,
            message: "potrebna_autentifikacija",
            status: data.status
          };
        } else if (data.status === 429) {
          return {
            valid: false,
            message: "previse_zahtjeva",
            status: data.status
          };
        } else if (data.status >= 500) {
          return {
            valid: false,
            message: "server_greska",
            status: data.status
          };
        }
      }
      
      return {
        valid: data.valid && data.reachable,
        message: data.valid && data.reachable ? "dostupan" : "nedostupan",
        status: data.status
      };
    } catch (error) {
      console.error("Error validating URL via backend:", error);
      
      // Fallback na direktnu provjeru ako backend nije dostupan
      try {
        console.log("Falling back to direct validation...");
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        await fetch(urlToValidate, {
          method: 'HEAD',
          mode: 'no-cors',
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        return { valid: true, message: "dostupan" };
      } catch (fallbackError) {
        console.error("Fallback validation also failed:", fallbackError);
        return { valid: false, message: "nedostupan" };
      }
    }
  };

  // Real-time URL validacija
  const handleUrlChange = async (newUrl: string) => {
    setUrl(newUrl);
    
    if (!newUrl.trim()) {
      setUrlStatus('idle');
      return;
    }

    // Osnovni format check
    let formattedUrl = newUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    try {
      new URL(formattedUrl);
    } catch {
      setUrlStatus('invalid');
      return;
    }

    // Debounce validaciju
    setTimeout(async () => {
      if (url === newUrl) { // Provjeri da korisnik još uvijek kuca isti URL
        setUrlStatus('checking');
        const result = await validateUrl(formattedUrl);
        setUrlStatus(result.valid ? 'valid' : 'invalid');
        setUrlStatusDetails({ message: result.message, status: result.status });
      }
    }, 1000);
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast({
        title: "Greška",
        description: "Molimo unesite validan URL",
        variant: "destructive"
      });
      return;
    }
    
    // Osnovna validacija formata URL-a
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }
    
    try {
      new URL(formattedUrl);
      setUrl(formattedUrl);
    } catch {
      toast({
        title: "Nevalidan URL format",
        description: "Molimo unesite valjan URL (npr. example.com ili https://example.com)",
        variant: "destructive"
      });
      return;
    }

    // Ako već nije validiran, validiraj sada
    if (urlStatus !== 'valid') {
      setIsValidatingUrl(true);
      
      toast({
        title: "Provjeravam URL...",
        description: "Molimo sačekajte dok provjeravamo da li stranica postoji"
      });

      try {
        const result = await validateUrl(formattedUrl);
        
        if (!result.valid) {
          let errorTitle = "Stranica nije dostupna";
          let errorDescription = "URL koji ste unijeli nije dostupan ili ne postoji. Molimo provjerite adresu.";
          
          // Prilagodi poruku na osnovu statusa
          if (result.message === "pristup_zabranjen") {
            errorTitle = "Pristup zabranjen";
            errorDescription = "Stranica postoji, ali zabranjuje automatski pristup. Ovo je česta zaštitna mjera web stranica. Možete pokušati uploadovati HTML fajl umjesto URL-a.";
          } else if (result.message === "potrebna_autentifikacija") {
            errorTitle = "Potrebna prijava";
            errorDescription = "Stranica zahtijeva prijavu ili autentifikaciju. Molimo pokušajte sa javno dostupnom stranicom.";
          } else if (result.message === "previse_zahtjeva") {
            errorTitle = "Previše zahtjeva";
            errorDescription = "Stranica ograničava broj zahtjeva. Molimo pokušajte ponovo za nekoliko minuta.";
          } else if (result.message === "server_greska") {
            errorTitle = "Greška na serveru";
            errorDescription = "Stranica ima tehnički problem. Molimo pokušajte kasnije ili koristite drugu stranicu.";
          }
          
          toast({
            title: errorTitle,
            description: errorDescription,
            variant: "destructive"
          });
          setUrlStatus('invalid');
          setUrlStatusDetails({ message: result.message, status: result.status });
          setIsValidatingUrl(false);
          return;
        }
        setUrlStatus('valid');
        setUrlStatusDetails({ message: result.message, status: result.status });
      } catch (error) {
        toast({
          title: "Greška pri validaciji",
          description: "Došlo je do greške prilikom provjere URL-a. Molimo pokušajte ponovo.",
          variant: "destructive"
        });
        setIsValidatingUrl(false);
        return;
      }
      setIsValidatingUrl(false);
    }

    // Ako je URL valjan, nastavi s analizom
    onAnalyze({ type: 'url', content: formattedUrl });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      toast({
        title: "Nevaljan fajl",
        description: "Molimo odaberite HTML fajl (.html ili .htm)",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "Fajl je prevelik",
        description: "Molimo odaberite fajl manji od 5MB",
        variant: "destructive"
      });
      return;
    }

    // Samo postavi fajl, ne analiziraj odmah
    setSelectedFile(file);
    
    toast({
      title: "Fajl učitan",
      description: `Uspješno učitan fajl: ${file.name}`,
      variant: "default"
    });
  };

  // Nova funkcija za analizu fajla
  const handleFileAnalyze = () => {
    if (!selectedFile) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      onAnalyze({ type: 'file', content });
    };
    reader.onerror = () => {
      toast({
        title: "Greška pri čitanju fajla",
        description: "Došlo je do greške prilikom čitanja fajla. Molimo pokušajte ponovo.",
        variant: "destructive"
      });
    };
    reader.readAsText(selectedFile);
  };

  // Helper funkcije za status indikatore
  const getUrlStatusIcon = () => {
    switch (urlStatus) {
      case 'checking':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'invalid':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getUrlStatusText = () => {
    switch (urlStatus) {
      case 'checking':
        return <p className="text-sm text-blue-600">Provjeravam URL...</p>;
      case 'valid':
        return <p className="text-sm text-green-600">URL je valjan i dostupan</p>;
      case 'invalid':
        // Prilagodi poruku na osnovu detaljnog statusa
        if (urlStatusDetails.message === "pristup_zabranjen") {
          return (
            <div className="text-sm text-amber-600">
              <p className="font-medium">Pristup zabranjen (HTTP 403)</p>
              <p className="text-xs mt-1">Stranica blokira automatski pristup. Pokušajte upload HTML fajla.</p>
            </div>
          );
        } else if (urlStatusDetails.message === "potrebna_autentifikacija") {
          return (
            <div className="text-sm text-amber-600">
              <p className="font-medium">Potrebna prijava (HTTP 401)</p>
              <p className="text-xs mt-1">Stranica zahtijeva autentifikaciju.</p>
            </div>
          );
        } else if (urlStatusDetails.message === "previse_zahtjeva") {
          return (
            <div className="text-sm text-amber-600">
              <p className="font-medium">Previše zahtjeva (HTTP 429)</p>
              <p className="text-xs mt-1">Pokušajte ponovo za nekoliko minuta.</p>
            </div>
          );
        } else if (urlStatusDetails.message === "server_greska") {
          return (
            <div className="text-sm text-red-600">
              <p className="font-medium">Greška servera (HTTP {urlStatusDetails.status})</p>
              <p className="text-xs mt-1">Tehnički problem na stranici.</p>
            </div>
          );
        } else {
          return <p className="text-sm text-red-600">URL nije dostupan ili ne postoji</p>;
        }
      default:
        return null;
    }
  };

  const isUrlDisabled = isAnalyzing || isValidatingUrl;
  const canSubmit = !isUrlDisabled && url.trim() && urlStatus !== 'invalid';

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card className="shadow-lg border-2 border-primary/20">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Analiza Vizuelne Kompleksnosti
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Analizirajte web stranice pomoću naprednih kvantitativnih metrika
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Tabs defaultValue="url" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="url" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Globe className="h-4 w-4" />
                URL Analiza
              </TabsTrigger>
              <TabsTrigger value="file" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <FileCode className="h-4 w-4" />
                HTML Upload
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="url" className="space-y-4">
              <form onSubmit={handleUrlSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="url" className="text-base">URL Web Stranice</Label>
                  <div className="relative">
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://example.com ili example.com"
                      value={url}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      disabled={isUrlDisabled}
                      className="focus:ring-2 focus:ring-primary py-2 text-lg pr-10"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      {getUrlStatusIcon()}
                    </div>
                  </div>
                  {getUrlStatusText()}
                </div>
                <Button 
                  type="submit" 
                  className="w-full py-3 text-lg font-semibold transition-all duration-300 hover:shadow-lg" 
                  variant="default"
                  disabled={!canSubmit}
                >
                  {isAnalyzing || isValidatingUrl ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {isValidatingUrl ? "Provjeravam URL..." : "Analiziranje..."}
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-5 w-5" />
                      Analiziraj Stranicu
                    </>
                  )}
                </Button>
              </form>
              
              {/* Status indikator za backend konekciju */}
              <div className="text-xs text-muted-foreground text-center p-2 bg-muted/50 rounded">
                Backend server: http://localhost:3001
              </div>
              
              <div className="text-sm text-muted-foreground mt-4 p-3 bg-muted rounded-lg">
                <p className="font-semibold">Primjeri valjanih URL-ova:</p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>https://www.klix.ba</li>
                  <li>klix.ba (automatski dodaje https://)</li>
                  <li>https://example.com</li>
                  <li>google.com</li>
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="file" className="space-y-6">
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="file" className="text-base font-medium">HTML Fajl</Label>
                  <div className="border-2 border-dashed border-primary/20 rounded-lg p-6 hover:border-primary/40 transition-colors">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <div className="text-center">
                        <Input
                          id="file"
                          type="file"
                          accept=".html,.htm"
                          onChange={handleFileUpload}
                          disabled={isAnalyzing}
                          className="sr-only"
                        />
                        <Label
                          htmlFor="file"
                          className="cursor-pointer inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium"
                        >
                          <FileCode className="mr-2 h-4 w-4" />
                          Odaberi HTML Fajl
                        </Label>
                        <p className="text-sm text-muted-foreground mt-2">
                          Podržani formati: .html, .htm (maksimalno 5MB)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedFile && (
                  <div className="space-y-4">
                    <div className="bg-muted/50 rounded-lg p-4 border">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <FileCode className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{selectedFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(selectedFile.size / 1024).toFixed(1)} KB • HTML fajl
                          </p>
                        </div>
                        <div className="text-green-500">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                      </div>
                    </div>

                    <Button 
                      type="button" 
                      className="w-full py-3 text-lg font-semibold transition-all duration-300 hover:shadow-lg" 
                      variant="default"
                      disabled={isAnalyzing}
                      onClick={handleFileAnalyze}
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Analiziranje fajla...
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2 h-5 w-5" />
                          Analiziraj HTML Fajl
                        </>
                      )}
                    </Button>
                  </div>
                )}

                <div className="text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg border-l-4 border-primary/50">
                  <p className="font-semibold mb-2">Savjeti za HTML upload:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Sačuvajte web stranicu kao "Complete HTML" iz browsera</li>
                    <li>Možete koristiti "Ctrl+S" na bilo kojoj stranici</li>
                    <li>Fajl treba da ima .html ili .htm ekstenziju</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisForm;