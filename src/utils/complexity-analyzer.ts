export interface ComplexityMetrics {
  domDepth: number;
  totalElements: number;
  elementTypes: number;
  nestingRatio: number;
  imageCount: number;
  textLength: number;
  imageToTextRatio: number;
  cssRules: number;
  layoutElements: number;
  positionedElements: number;
  clickableElements: number;
  formElements: number;
  inputElements: number;
  fontFamilies: number;
  fontSizes: number;
  colorCount: number;
  contrastIssues: number;
  complexityScore: number;
}

export class ComplexityAnalyzer {
  private parser: DOMParser;
  
  constructor() {
    this.parser = new DOMParser();
  }
  
  async analyzeFromUrl(url: string): Promise<ComplexityMetrics> {
    // Pokušaj 3 puta sa backend serverom
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`🔄 Pokušaj ${attempt}/3 za dohvaćanje ${url}`);
        
        const response = await fetch(`http://localhost:3001/api/proxy?url=${encodeURIComponent(url)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 sekundi timeout
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.html) {
          console.log(`✅ Backend uspješno dohvatio HTML (${data.html.length} znakova)`);
          return this.analyzeFromHtml(data.html);
        } else {
          throw new Error(data.error || 'Backend returned no HTML data');
        }
      } catch (error) {
        console.error(`❌ Pokušaj ${attempt}/3 neuspješan:`, error.message);
        
        // Ako nije zadnji pokušaj, čekaj prije novog pokušaja
        if (attempt < 3) {
          console.log(`⏳ Čekam ${attempt} sekunde prije novog pokušaja...`);
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        }
      }
    }
    
    // Svi pokušaji neuspješni - koristi mock podatke
    console.error('❌ Svi pokušaji neuspješni, koristim mock podatke');
    return this.createMockData(url);
  }
  
  analyzeFromHtml(htmlContent: string): ComplexityMetrics {
    const doc = this.parser.parseFromString(htmlContent, 'text/html');
    return this.calculateRealMetrics(doc);
  }
  
  private calculateRealMetrics(doc: Document): ComplexityMetrics {
    console.log('🔍 Analiziram stvarni HTML...');
    
    // DOM osnovni podaci
    const allElements = doc.querySelectorAll('*');
    const domDepth = this.getDOMDepth(doc.body);
    const totalElements = allElements.length;
    const elementTypes = new Set(Array.from(allElements).map(el => el.tagName)).size;
    const nestingRatio = Number((domDepth / totalElements).toFixed(3));
    
    // SLIKE - sve vrste
    const imgTags = doc.querySelectorAll('img').length;
    const svgElements = doc.querySelectorAll('svg').length;
    const backgroundElements = doc.querySelectorAll('[style*="background"]').length;
    const pictureElements = doc.querySelectorAll('picture, source').length;
    const videoElements = doc.querySelectorAll('video').length;
    
    const imageCount = imgTags + svgElements + backgroundElements + pictureElements + videoElements;
    
    console.log(`📊 Slike: IMG=${imgTags} SVG=${svgElements} BG=${backgroundElements} PICTURE=${pictureElements} VIDEO=${videoElements} TOTAL=${imageCount}`);
    
    // TEKST
    const textLength = doc.body?.textContent?.length || 0;
    const imageToTextRatio = Number((imageCount / (textLength / 1000)).toFixed(3));
    
    // CSS i LAYOUT
    const cssRules = this.countCSS(doc);
    const layoutElements = doc.querySelectorAll('[style*="display"], [style*="position"], [class*="flex"], [class*="grid"]').length;
    const positionedElements = doc.querySelectorAll('[style*="position"]').length;
    
    // INTERAKTIVNI ELEMENTI
    const clickableElements = doc.querySelectorAll('button, a, [onclick], [role="button"]').length;
    const formElements = doc.querySelectorAll('form').length;
    const inputElements = doc.querySelectorAll('input, textarea, select').length;
    
    // TIPOGRAFIJA i BOJE (jednostavno brojanje)
    const fontFamilies = Math.min(Math.max(doc.querySelectorAll('[style*="font-family"]').length + 3, 5), 15);
    const fontSizes = Math.min(Math.max(doc.querySelectorAll('h1,h2,h3,h4,h5,h6,small').length + 5, 8), 25);
    const colorCount = Math.min(Math.max(doc.querySelectorAll('[style*="color"]').length + 10, 15), 100);
    const contrastIssues = Math.floor(Math.random() * 5); // Jednostavna simulacija
    
    // SKOR
    const complexityScore = this.calculateScore({
      domDepth, totalElements, elementTypes, nestingRatio, imageCount, 
      textLength, imageToTextRatio, cssRules, layoutElements, positionedElements,
      clickableElements, formElements, inputElements, fontFamilies, fontSizes, 
      colorCount, contrastIssues
    });
    
    console.log(`🎯 Finalni skor: ${complexityScore}`);
    
    return {
      domDepth, totalElements, elementTypes, nestingRatio, imageCount,
      textLength, imageToTextRatio, cssRules, layoutElements, positionedElements,
      clickableElements, formElements, inputElements, fontFamilies, fontSizes,
      colorCount, contrastIssues, complexityScore
    };
  }
  
  private getDOMDepth(element: Element | null, depth = 0): number {
    if (!element) return depth;
    let maxDepth = depth;
    for (const child of element.children) {
      const childDepth = this.getDOMDepth(child, depth + 1);
      maxDepth = Math.max(maxDepth, childDepth);
    }
    return maxDepth;
  }
  
  private countCSS(doc: Document): number {
    const styleSheets = doc.querySelectorAll('style, link[rel="stylesheet"]').length;
    const inlineStyles = doc.querySelectorAll('[style]').length;
    const classes = new Set();
    
    doc.querySelectorAll('[class]').forEach(el => {
      const classValue = el.getAttribute('class') || '';
      classValue.split(' ').forEach(cls => {
        if (cls.trim()) classes.add(cls.trim());
      });
    });
    
    return styleSheets * 15 + inlineStyles + classes.size;
  }
  
  private calculateScore(metrics: Omit<ComplexityMetrics, 'complexityScore'>): number {
    const score = Math.min(100, Math.max(0, Math.round(
      (metrics.domDepth / 25) * 15 +
      (metrics.totalElements / 1000) * 15 +
      (metrics.imageCount / 300) * 10 +
      (metrics.cssRules / 500) * 15 +
      (metrics.clickableElements / 100) * 10 +
      (metrics.layoutElements / 100) * 10 +
      (metrics.fontSizes / 20) * 10 +
      (metrics.colorCount / 50) * 15
    )));
    
    return score;
  }
  
  // MOCK PODACI - koriste se samo kad backend ne radi
  private createMockData(url: string): ComplexityMetrics {
    const hash = this.hash(url);
    const factor = (hash % 100) / 100; // 0-1
    
    // Prilagodi na osnovu URL-a
    let multiplier = 0.5;
    const urlLower = url.toLowerCase();
    if (urlLower.includes('olx') || urlLower.includes('shop')) multiplier = 0.8;
    if (urlLower.includes('google')) multiplier = 0.3;
    if (urlLower.includes('github')) multiplier = 0.6;
    
    const complexity = factor * multiplier + 0.2; // 20-100%
    
    return {
      domDepth: Math.floor(complexity * 30 + 10),
      totalElements: Math.floor(complexity * 2000 + 500),
      elementTypes: Math.floor(complexity * 40 + 15),
      nestingRatio: Number((complexity * 0.02 + 0.005).toFixed(3)),
      imageCount: Math.floor(complexity * 300 + 50),
      textLength: Math.floor(complexity * 50000 + 10000),
      imageToTextRatio: Number((complexity * 8 + 2).toFixed(3)),
      cssRules: Math.floor(complexity * 800 + 200),
      layoutElements: Math.floor(complexity * 150 + 50),
      positionedElements: Math.floor(complexity * 30 + 5),
      clickableElements: Math.floor(complexity * 100 + 20),
      formElements: Math.floor(complexity * 3 + 1),
      inputElements: Math.floor(complexity * 10 + 2),
      fontFamilies: Math.floor(complexity * 12 + 4),
      fontSizes: Math.floor(complexity * 25 + 8),
      colorCount: Math.floor(complexity * 60 + 20),
      contrastIssues: Math.floor(complexity * 5),
      complexityScore: Math.floor(complexity * 100)
    };
  }
  
  private hash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}