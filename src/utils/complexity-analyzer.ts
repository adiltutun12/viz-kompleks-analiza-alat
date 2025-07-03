export interface ComplexityMetrics {
  // DOM Structure Metrics
  domDepth: number;
  totalElements: number;
  elementTypes: number;
  nestingRatio: number;
  
  // Visual Content Metrics
  imageCount: number;
  textLength: number;
  imageToTextRatio: number;
  
  // Layout Complexity
  cssRules: number;
  layoutElements: number;
  positionedElements: number;
  
  // Interactive Elements
  clickableElements: number;
  formElements: number;
  inputElements: number;
  
  // Typography
  fontFamilies: number;
  fontSizes: number;
  
  // Colors
  colorCount: number;
  contrastIssues: number;
  
  // Overall Complexity Score (0-100)
  complexityScore: number;
}

export class ComplexityAnalyzer {
  private parser: DOMParser;
  
  constructor() {
    this.parser = new DOMParser();
  }
  
  async analyzeFromUrl(url: string): Promise<ComplexityMetrics> {
    try {
      // For demo purposes, we'll simulate analysis
      // In real implementation, you'd need CORS proxy or backend service
      const mockMetrics = this.generateMockMetrics(url);
      return mockMetrics;
    } catch (error) {
      throw new Error(`Failed to analyze URL: ${error}`);
    }
  }
  
  analyzeFromHtml(htmlContent: string): ComplexityMetrics {
    const doc = this.parser.parseFromString(htmlContent, 'text/html');
    return this.calculateMetrics(doc);
  }
  
  private calculateMetrics(doc: Document): ComplexityMetrics {
    const allElements = doc.querySelectorAll('*');
    
    // DOM Structure
    const domDepth = this.calculateDOMDepth(doc.body);
    const totalElements = allElements.length;
    const elementTypes = new Set(Array.from(allElements).map(el => el.tagName)).size;
    const nestingRatio = totalElements > 0 ? domDepth / totalElements : 0;
    
    // Visual Content
    const images = doc.querySelectorAll('img, svg, picture');
    const imageCount = images.length;
    const textLength = doc.body.textContent?.length || 0;
    const imageToTextRatio = textLength > 0 ? imageCount / textLength * 1000 : 0;
    
    // Layout Complexity
    const cssRules = this.estimateCSSComplexity(doc);
    const layoutElements = doc.querySelectorAll('[style*="display"], [style*="position"], [class*="flex"], [class*="grid"]').length;
    const positionedElements = doc.querySelectorAll('[style*="position: absolute"], [style*="position: fixed"], [style*="position: relative"]').length;
    
    // Interactive Elements
    const clickableElements = doc.querySelectorAll('button, a, [onclick], [role="button"]').length;
    const formElements = doc.querySelectorAll('form').length;
    const inputElements = doc.querySelectorAll('input, textarea, select').length;
    
    // Typography
    const fontFamilies = this.countFontFamilies(doc);
    const fontSizes = this.countFontSizes(doc);
    
    // Colors
    const colorCount = this.countColors(doc);
    const contrastIssues = this.checkContrastIssues(doc);
    
    // Calculate overall complexity score
    const complexityScore = this.calculateComplexityScore({
      domDepth,
      totalElements,
      elementTypes,
      nestingRatio,
      imageCount,
      textLength,
      imageToTextRatio,
      cssRules,
      layoutElements,
      positionedElements,
      clickableElements,
      formElements,
      inputElements,
      fontFamilies,
      fontSizes,
      colorCount,
      contrastIssues
    });
    
    return {
      domDepth,
      totalElements,
      elementTypes,
      nestingRatio,
      imageCount,
      textLength,
      imageToTextRatio,
      cssRules,
      layoutElements,
      positionedElements,
      clickableElements,
      formElements,
      inputElements,
      fontFamilies,
      fontSizes,
      colorCount,
      contrastIssues,
      complexityScore
    };
  }
  
  private calculateDOMDepth(element: Element | null, depth = 0): number {
    if (!element) return depth;
    
    let maxChildDepth = depth;
    for (const child of element.children) {
      const childDepth = this.calculateDOMDepth(child, depth + 1);
      maxChildDepth = Math.max(maxChildDepth, childDepth);
    }
    
    return maxChildDepth;
  }
  
  private estimateCSSComplexity(doc: Document): number {
    const styleSheets = doc.querySelectorAll('style, link[rel="stylesheet"]');
    const inlineStyles = doc.querySelectorAll('[style]');
    const classNames = new Set();
    
    doc.querySelectorAll('[class]').forEach(el => {
      el.className.split(' ').forEach(cls => {
        if (cls.trim()) classNames.add(cls.trim());
      });
    });
    
    return styleSheets.length * 10 + inlineStyles.length + classNames.size;
  }
  
  private countFontFamilies(doc: Document): number {
    const fonts = new Set<string>();
    const elements = doc.querySelectorAll('*');
    
    elements.forEach(el => {
      const computed = window.getComputedStyle(el);
      if (computed.fontFamily) {
        fonts.add(computed.fontFamily);
      }
    });
    
    return fonts.size;
  }
  
  private countFontSizes(doc: Document): number {
    const sizes = new Set<string>();
    const elements = doc.querySelectorAll('*');
    
    elements.forEach(el => {
      const computed = window.getComputedStyle(el);
      if (computed.fontSize) {
        sizes.add(computed.fontSize);
      }
    });
    
    return sizes.size;
  }
  
  private countColors(doc: Document): number {
    const colors = new Set<string>();
    const elements = doc.querySelectorAll('*');
    
    elements.forEach(el => {
      const computed = window.getComputedStyle(el);
      if (computed.color) colors.add(computed.color);
      if (computed.backgroundColor && computed.backgroundColor !== 'rgba(0, 0, 0, 0)') {
        colors.add(computed.backgroundColor);
      }
    });
    
    return colors.size;
  }
  
  private checkContrastIssues(doc: Document): number {
    // Simplified contrast checking - in real implementation use WCAG contrast formulas
    let issues = 0;
    const elements = doc.querySelectorAll('*');
    
    elements.forEach(el => {
      const computed = window.getComputedStyle(el);
      const color = computed.color;
      const bgColor = computed.backgroundColor;
      
      // Simplified check - in reality you'd parse RGB values and calculate contrast ratio
      if (color && bgColor && color === bgColor) {
        issues++;
      }
    });
    
    return issues;
  }
  
  private calculateComplexityScore(metrics: Omit<ComplexityMetrics, 'complexityScore'>): number {
    // Weighted scoring algorithm
    const weights = {
      domDepth: 0.15,
      totalElements: 0.12,
      elementTypes: 0.10,
      imageCount: 0.08,
      layoutElements: 0.12,
      clickableElements: 0.08,
      fontSizes: 0.10,
      colorCount: 0.10,
      cssRules: 0.15
    };
    
    // Normalize values to 0-1 scale
    const normalizedMetrics = {
      domDepth: Math.min(metrics.domDepth / 20, 1),
      totalElements: Math.min(metrics.totalElements / 1000, 1),
      elementTypes: Math.min(metrics.elementTypes / 50, 1),
      imageCount: Math.min(metrics.imageCount / 100, 1),
      layoutElements: Math.min(metrics.layoutElements / 100, 1),
      clickableElements: Math.min(metrics.clickableElements / 50, 1),
      fontSizes: Math.min(metrics.fontSizes / 20, 1),
      colorCount: Math.min(metrics.colorCount / 30, 1),
      cssRules: Math.min(metrics.cssRules / 500, 1)
    };
    
    let score = 0;
    Object.entries(weights).forEach(([key, weight]) => {
      score += normalizedMetrics[key as keyof typeof normalizedMetrics] * weight;
    });
    
    return Math.round(score * 100);
  }
  
  private generateMockMetrics(url: string): ComplexityMetrics {
    // Generate realistic mock data for demo
    const baseComplexity = Math.random() * 0.6 + 0.2; // 20-80% complexity
    
    return {
      domDepth: Math.floor(baseComplexity * 25 + 5),
      totalElements: Math.floor(baseComplexity * 800 + 100),
      elementTypes: Math.floor(baseComplexity * 40 + 10),
      nestingRatio: Number((baseComplexity * 0.05 + 0.01).toFixed(3)),
      imageCount: Math.floor(baseComplexity * 50 + 5),
      textLength: Math.floor(baseComplexity * 10000 + 1000),
      imageToTextRatio: Number((baseComplexity * 5 + 1).toFixed(2)),
      cssRules: Math.floor(baseComplexity * 400 + 50),
      layoutElements: Math.floor(baseComplexity * 80 + 10),
      positionedElements: Math.floor(baseComplexity * 20 + 2),
      clickableElements: Math.floor(baseComplexity * 40 + 5),
      formElements: Math.floor(baseComplexity * 5 + 1),
      inputElements: Math.floor(baseComplexity * 15 + 2),
      fontFamilies: Math.floor(baseComplexity * 8 + 2),
      fontSizes: Math.floor(baseComplexity * 15 + 5),
      colorCount: Math.floor(baseComplexity * 25 + 8),
      contrastIssues: Math.floor(baseComplexity * 10),
      complexityScore: Math.floor(baseComplexity * 100)
    };
  }
}