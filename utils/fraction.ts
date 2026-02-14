export class Fraction {
  numerator: number;
  denominator: number;

  constructor(numerator: number, denominator: number = 1) {
    if (denominator === 0) {
      throw new Error("Denominator cannot be zero");
    }
    this.numerator = numerator;
    this.denominator = denominator;
    this.simplify();
  }

  // Greatest Common Divisor
  private static gcd(a: number, b: number): number {
    return b === 0 ? a : Fraction.gcd(b, a % b);
  }

  private simplify() {
    const common = Fraction.gcd(Math.abs(this.numerator), Math.abs(this.denominator));
    this.numerator /= common;
    this.denominator /= common;
    
    // Ensure negative sign is on numerator
    if (this.denominator < 0) {
      this.numerator = -this.numerator;
      this.denominator = -this.denominator;
    }
  }

  add(other: Fraction): Fraction {
    return new Fraction(
      this.numerator * other.denominator + other.numerator * this.denominator,
      this.denominator * other.denominator
    );
  }

  sub(other: Fraction): Fraction {
    return new Fraction(
      this.numerator * other.denominator - other.numerator * this.denominator,
      this.denominator * other.denominator
    );
  }

  mul(other: Fraction): Fraction {
    return new Fraction(
      this.numerator * other.numerator,
      this.denominator * other.denominator
    );
  }

  div(other: Fraction): Fraction {
    if (other.numerator === 0) throw new Error("Division by zero");
    return new Fraction(
      this.numerator * other.denominator,
      this.denominator * other.numerator
    );
  }

  abs(): Fraction {
    return new Fraction(Math.abs(this.numerator), Math.abs(this.denominator));
  }

  equals(other: Fraction): boolean {
    return this.numerator === other.numerator && this.denominator === other.denominator;
  }

  isZero(): boolean {
    return this.numerator === 0;
  }
  
  isOne(): boolean {
      return this.numerator === 1 && this.denominator === 1;
  }

  toString(): string {
    if (this.denominator === 1) return `${this.numerator}`;
    return `${this.numerator}/${this.denominator}`;
  }
  
  toLatex(): string {
    if (this.denominator === 1) return `${this.numerator}`;
    if (this.numerator < 0) return `-\\frac{${Math.abs(this.numerator)}}{${this.denominator}}`;
    return `\\frac{${this.numerator}}{${this.denominator}}`;
  }

  static fromString(str: string): Fraction {
    if (!str) return new Fraction(0);
    const parts = str.split('/');
    if (parts.length === 2) {
      return new Fraction(parseInt(parts[0]), parseInt(parts[1]));
    }
    // Handle decimals by converting to fraction
    const val = parseFloat(str);
    if (isNaN(val)) return new Fraction(0); // Fallback
    
    // Simple decimal conversion
    const len = str.includes('.') ? str.split('.')[1].length : 0;
    const denominator = Math.pow(10, len);
    const numerator = Math.round(val * denominator);
    return new Fraction(numerator, denominator);
  }
  
  static fromNumber(num: number): Fraction {
     // Handle approximate integers to avoid floating point mess (e.g. 1.00000000001)
     if (Math.abs(Math.round(num) - num) < 1e-10) {
         return new Fraction(Math.round(num));
     }
     
     // Basic conversion
     const len = num.toString().includes('.') ? num.toString().split('.')[1].length : 0;
     // Cap length to avoid overflow
     const safeLen = Math.min(len, 6); 
     const denominator = Math.pow(10, safeLen);
     const numerator = Math.round(num * denominator);
     return new Fraction(numerator, denominator);
  }

  static zero() { return new Fraction(0); }
  static one() { return new Fraction(1); }
}