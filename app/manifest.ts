import type { MetadataRoute } from 'next';

/**
 * Web App Manifest — declares this app as installable in
 * standalone mode. Once installed via Chrome/Edge's "Install app"
 * (the icon in the omnibox) or iOS Safari's "Add to Home Screen",
 * the app opens in its own window without the URL/tab bar.
 *
 * Works on localhost too — Chrome treats `http://localhost`
 * as a secure origin for PWA purposes.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Legal Office - Ashraf Sharif',
    short_name: 'Legal Office',
    description: 'Legal Office Management',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#FDFBF5',
    theme_color: '#FDFBF5',
    lang: 'he',
    dir: 'rtl',
    icons: [
      {
        src: '/icons/nav-home.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/nav-home.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
