/// <reference types="vite/client" />

// Vite handles SVG/image imports as URL strings by default
declare module '*.svg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}
