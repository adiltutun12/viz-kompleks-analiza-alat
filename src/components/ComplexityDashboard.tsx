import { ComplexityMetrics } from "@/utils/complexity-analyzer";
import MetricsCard from "./MetricsCard";
import { 
  TreePine, 
  FileText, 
  Image, 
  Layout, 
  MousePointer, 
  Type, 
  Palette,
  TrendingUp,
  Layers,
  Grid3X3,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ComplexityDashboardProps {
  metrics: ComplexityMetrics;
  url?: string;
}

const ComplexityDashboard = ({ metrics, url }: ComplexityDashboardProps) => {
  const getComplexityLevel = (score: number) => {
    if (score < 30) return { label: "Niska", variant: "success" as const };
    if (score < 70) return { label: "Srednja", variant: "warning" as const };
    return { label: "Visoka", variant: "danger" as const };
  };

  const complexity = getComplexityLevel(metrics.complexityScore);
  const isMockData = (metrics as any)._isMockData;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Mock Data Warning */}
      {isMockData && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Simulirani podaci:</strong> Ne mogu dohvatiti stvarnu web stranicu, prikazujem simulirane rezultate na osnovu URL-a. 
            Za tačnu analizu pokušajte s drugom stranicom ili uploadajte HTML fajl.
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Rezultati Analize</h2>
        {url && (
          <p className="text-muted-foreground">
            Analizirano: <span className="text-primary font-medium">{url}</span>
            {isMockData && <span className="text-amber-600 ml-2 text-sm">(simulirani podaci)</span>}
          </p>
        )}
      </div>

      {/* Overall Complexity Score */}
      <Card className="shadow-glow border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            Ukupni Skor Kompleksnosti
          </CardTitle>
          <CardDescription>
            Kompozitna metrika bazirana na svim analiziranim faktorima
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-6xl font-bold text-primary">
            {metrics.complexityScore}
          </div>
          <div className={`text-xl font-semibold ${
            complexity.variant === 'success' ? 'text-success' :
            complexity.variant === 'warning' ? 'text-warning' : 'text-destructive'
          }`}>
            {complexity.label} Kompleksnost
          </div>
          <Progress 
            value={metrics.complexityScore} 
            className="h-4 max-w-md mx-auto" 
          />
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Skor se izračunava na osnovu ponderisanih metrika DOM strukture, 
            vizuelnog sadržaja, layout-a i interaktivnih elemenata.
          </p>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        
        {/* DOM Structure */}
        <MetricsCard
          title="Dubina DOM-a"
          value={metrics.domDepth}
          maxValue={25}
          icon={<TreePine className="h-4 w-4" />}
          description="Maksimalna dubina ugnježdavanja elemenata"
          variant={metrics.domDepth > 15 ? "warning" : "default"}
        />
        
        <MetricsCard
          title="Ukupno Elemenata"
          value={metrics.totalElements}
          maxValue={1000}
          icon={<Layers className="h-4 w-4" />}
          description="Broj HTML elemenata na stranici"
          variant={metrics.totalElements > 500 ? "warning" : "default"}
        />
        
        <MetricsCard
          title="Tipovi Elemenata"
          value={metrics.elementTypes}
          maxValue={50}
          icon={<Grid3X3 className="h-4 w-4" />}
          description="Broj različitih HTML tagova"
        />
        
        <MetricsCard
          title="Nesting Ratio"
          value={metrics.nestingRatio}
          maxValue={0.1}
          unit=""
          icon={<TreePine className="h-4 w-4" />}
          description="Prosječan broj djece po elementu"
        />

        {/* Visual Content */}
        <MetricsCard
          title="Broj Slika"
          value={metrics.imageCount}
          maxValue={100}
          icon={<Image className="h-4 w-4" />}
          description="Slike, SVG-ovi i ostali vizuelni elementi"
          variant={metrics.imageCount > 50 ? "warning" : "default"}
        />
        
        <MetricsCard
          title="Dužina Teksta"
          value={Math.floor(metrics.textLength / 1000)}
          maxValue={10}
          unit="k chars"
          icon={<FileText className="h-4 w-4" />}
          description="Ukupan broj karaktera teksta"
        />
        
        <MetricsCard
          title="Slika/Tekst Ratio"
          value={metrics.imageToTextRatio}
          maxValue={10}
          icon={<Image className="h-4 w-4" />}
          description="Odnos broja slika prema dužini teksta"
        />

        {/* Layout Complexity */}
        <MetricsCard
          title="CSS Pravila"
          value={metrics.cssRules}
          maxValue={500}
          icon={<Layout className="h-4 w-4" />}
          description="Procijenjen broj CSS pravila"
          variant={metrics.cssRules > 300 ? "warning" : "default"}
        />
        
        <MetricsCard
          title="Layout Elementi"
          value={metrics.layoutElements}
          maxValue={100}
          icon={<Layout className="h-4 w-4" />}
          description="Elementi složenog izgleda"
        />
        
        <MetricsCard
          title="Pozicionirani Elementi"
          value={metrics.positionedElements}
          maxValue={50}
          icon={<MousePointer className="h-4 w-4" />}
          description="Absolute, fixed, relative pozicije"
        />

        {/* Interactive Elements */}
        <MetricsCard
          title="Klikabilni Elementi"
          value={metrics.clickableElements}
          maxValue={50}
          icon={<MousePointer className="h-4 w-4" />}
          description="Dugmići, linkovi, interaktivni elementi"
        />
        
        <MetricsCard
          title="Forme"
          value={metrics.formElements}
          maxValue={10}
          icon={<FileText className="h-4 w-4" />}
          description="HTML forme na stranici"
        />
        
        <MetricsCard
          title="Input Polja"
          value={metrics.inputElements}
          maxValue={20}
          icon={<FileText className="h-4 w-4" />}
          description="Input, textarea, select elementi"
        />

        {/* Typography & Design */}
        <MetricsCard
          title="Font Familije"
          value={metrics.fontFamilies}
          maxValue={10}
          icon={<Type className="h-4 w-4" />}
          description="Broj različitih fontova"
          variant={metrics.fontFamilies > 5 ? "warning" : "default"}
        />
        
        <MetricsCard
          title="Font Veličine"
          value={metrics.fontSizes}
          maxValue={20}
          icon={<Type className="h-4 w-4" />}
          description="Broj različitih font veličina"
          variant={metrics.fontSizes > 10 ? "warning" : "default"}
        />
        
        <MetricsCard
          title="Broj Boja"
          value={metrics.colorCount}
          maxValue={30}
          icon={<Palette className="h-4 w-4" />}
          description="Različite boje teksta i pozadine"
          variant={metrics.colorCount > 20 ? "warning" : "default"}
        />
        
        <MetricsCard
          title="Contrast Issues"
          value={metrics.contrastIssues}
          maxValue={20}
          icon={<Palette className="h-4 w-4" />}
          description="Potencijalni problemi sa kontrastom"
          variant={metrics.contrastIssues > 5 ? "danger" : metrics.contrastIssues > 0 ? "warning" : "success"}
        />
      </div>

      {/* Analysis Summary */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Analiza i Preporuke</CardTitle>
          <CardDescription>
            Interpretacija rezultata i prijedlozi za poboljšanje
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2 text-success">Pozitivni Aspekti:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {metrics.contrastIssues === 0 && (
                  <li>• Dobra pristupačnost boja</li>
                )}
                {metrics.domDepth < 10 && (
                  <li>• Jednostavna DOM struktura</li>
                )}
                {metrics.fontFamilies < 4 && (
                  <li>• Konzistentna tipografija</li>
                )}
                {metrics.complexityScore < 50 && (
                  <li>• Niska ukupna kompleksnost</li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-warning">Mogućnosti Poboljšanja:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {metrics.contrastIssues > 0 && (
                  <li>• Poboljšajte kontrast boja</li>
                )}
                {metrics.domDepth > 15 && (
                  <li>• Smanjite ugnježdavanje elemenata</li>
                )}
                {metrics.fontFamilies > 5 && (
                  <li>• Ograničite broj fontova</li>
                )}
                {metrics.totalElements > 500 && (
                  <li>• Razmotriti podjelu na manje stranica</li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplexityDashboard;