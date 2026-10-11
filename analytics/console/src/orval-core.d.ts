// El cliente generado por Orval importa el tipo `DeepNonNullable` desde
// `@orval/core`. Es solo de tipos (se borra en runtime), así que lo declaramos
// aquí para no añadir `@orval/core` como dependencia de la consola.
declare module '@orval/core' {
  export type DeepNonNullable<T> = T;
}
