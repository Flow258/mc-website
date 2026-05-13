// app/globals.d.ts
// TypeScript declarations for CSS imports

declare module '*.css' {
  const content: string;
  export default content;
}

// Allow side-effect imports (import "./globals.css")
declare module '*.css' {
  const css: string;
  export default css;
}