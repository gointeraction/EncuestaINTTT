/** Dispara la descarga de una URL (Content-Disposition: attachment) sin salir de la SPA. */
export function downloadUrl(url: string): void {
  const a = document.createElement('a');
  a.href = url;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
}
