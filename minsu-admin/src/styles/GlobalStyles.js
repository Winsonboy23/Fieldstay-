import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
:root {
    &, &.light-mode{
    /* Grey */
    --color-grey-0: #fdfbf8;
    --color-grey-50: #f7f1e9;
    --color-grey-100: #ebe0d1;
    --color-grey-200: #d7c9b8;
    --color-grey-300: #c3b3a2;
    --color-grey-400: #a8917a;
    --color-grey-500: #817261;
    --color-grey-600: #675c50;
    --color-grey-700: #4b443d;
    --color-grey-800: #302c28;
    --color-grey-900: #211f1c;
  
    --color-blue-100: #e8f4ef;
    --color-blue-700: #005348;
    --color-green-100: #dff3e7;
    --color-green-700: #007965;
    --color-yellow-100: #f8ead1;
    --color-yellow-700: #8b5e12;
    --color-silver-100: #ebe0d1;
    --color-silver-700: #675c50;
    --color-indigo-100: #e8f4ef;
    --color-indigo-700: #003f37;
  
    --color-red-100: #fee2e2;
    --color-red-700: #b91c1c;
    --color-red-800: #991b1b;
  
    --backdrop-color: rgba(255, 255, 255, 0.1);
  
    --shadow-sm: 0 1px 2px rgba(48, 44, 40, 0.05);
    --shadow-md: 0px 1.2rem 3.2rem rgba(48, 44, 40, 0.08);
    --shadow-lg: 0 2.4rem 4.8rem rgba(48, 44, 40, 0.14);

    /* For dark mode */
    --image-grayscale: 0;
    --image-opacity: 100%;
    }
  
    &.dark-mode {
     // FOR DARK MODE
    --color-grey-0: #18212f;
    --color-grey-50: #111827;
    --color-grey-100: #1f2937;
    --color-grey-200: #374151;
    --color-grey-300: #4b5563;
    --color-grey-400: #6b7280;
    --color-grey-500: #9ca3af;
    --color-grey-600: #d1d5db;
    --color-grey-700: #e5e7eb;
    --color-grey-800: #f3f4f6;
    --color-grey-900: #f9fafb;
    
    --color-blue-100: #075985;
    --color-blue-700: #e0f2fe;
    --color-green-100: #166534;
    --color-green-700: #dcfce7;
    --color-yellow-100: #854d0e;
    --color-yellow-700: #fef9c3;
    --color-silver-100: #374151;
    --color-silver-700: #f3f4f6;
    --color-indigo-100: #3730a3;
    --color-indigo-700: #e0e7ff;
    
    --color-red-100: #fee2e2;
    --color-red-700: #b91c1c;
    --color-red-800: #991b1b;
    
    --backdrop-color: rgba(0, 0, 0, 0.3);
    
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.4);
    --shadow-md: 0px 0.6rem 2.4rem rgba(0, 0, 0, 0.3);
    --shadow-lg: 0 2.4rem 3.2rem rgba(0, 0, 0, 0.4);
    
    --image-grayscale: 10%;
    --image-opacity: 90%;
    }

    --color-brand-50: #e8f4ef;
    --color-brand-100: #c8e5da;
    --color-brand-200: #94cbbb;
    --color-brand-500: #218374;
    --color-brand-600: #007965;
    --color-brand-700: #005348;
    --color-brand-800: #003f37;
    --color-brand-900: #002820;

    --border-radius-tiny: 3px;
    --border-radius-sm: 6px;
    --border-radius-md: 8px;
    --border-radius-lg: 10px;
  }
  
  *,
  *::before,
  *::after {
    box-sizing: border-box;
    padding: 0;
    margin: 0;
  
    /* Creating animations for dark mode */
    transition: background-color 0.3s, border 0.3s;
  }
  
  html {
    font-size: 50%;
  }
  
  body {
    font-family: "Noto Sans TC", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    color: var(--color-grey-700);
    background: var(--color-grey-50);
  
    transition: color 0.3s, background-color 0.3s;
    min-height: 100vh;
    line-height: 1.5;
    font-size: 1.6rem;
  }
  
  input,
  button,
  textarea,
  select {
    font: inherit;
    color: inherit;
  }
  
  button {
    cursor: pointer;
  }
  
  *:disabled {
    cursor: not-allowed;
  }
  
  select:disabled,
  input:disabled {
    background-color: var(--color-grey-200);
    color: var(--color-grey-500);
  }
  
  input:focus,
  button:focus,
  textarea:focus,
  select:focus {
    outline: 2px solid var(--color-brand-600);
    outline-offset: -1px;
  }
  
  /* Parent selector, finally 😃 */
  button:has(svg) {
    line-height: 0;
  }
  
  a {
    color: inherit;
    text-decoration: none;
  }
  
  ul {
    list-style: none;
  }
  
  p,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    overflow-wrap: break-word;
    hyphens: auto;
  }

  h1,
  h2,
  h3,
  h4 {
    font-family: "Noto Serif TC", Georgia, serif;
    letter-spacing: 0;
  }
  
  img {
    max-width: 100%;
  
    /* For dark mode */
    filter: grayscale(var(--image-grayscale)) opacity(var(--image-opacity));
  }
  
  /*
  FOR DARK MODE
  
  --color-grey-0: #18212f;
  --color-grey-50: #111827;
  --color-grey-100: #1f2937;
  --color-grey-200: #374151;
  --color-grey-300: #4b5563;
  --color-grey-400: #6b7280;
  --color-grey-500: #9ca3af;
  --color-grey-600: #d1d5db;
  --color-grey-700: #e5e7eb;
  --color-grey-800: #f3f4f6;
  --color-grey-900: #f9fafb;
  
  --color-blue-100: #075985;
  --color-blue-700: #e0f2fe;
  --color-green-100: #166534;
  --color-green-700: #dcfce7;
  --color-yellow-100: #854d0e;
  --color-yellow-700: #fef9c3;
  --color-silver-100: #374151;
  --color-silver-700: #f3f4f6;
  --color-indigo-100: #3730a3;
  --color-indigo-700: #e0e7ff;
  
  --color-red-100: #fee2e2;
  --color-red-700: #b91c1c;
  --color-red-800: #991b1b;
  
  --backdrop-color: rgba(0, 0, 0, 0.3);
  
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.4);
  --shadow-md: 0px 0.6rem 2.4rem rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 2.4rem 3.2rem rgba(0, 0, 0, 0.4);
  
  --image-grayscale: 10%;
  --image-opacity: 90%;
  */
`;

export default GlobalStyles;
