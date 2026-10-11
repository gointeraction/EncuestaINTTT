/* design-system — embedded DS barrel.
   ds-* primitives (components/) + runtime system (system/) + brand themes (themes/).
   The FAB (design tool) is NOT here: it lives in ../fab (particular
   implementation, not needed by every application). Pages import from here
   (or from the app root shared barrel). */
export * from './components';
export * from './system';
export * from './themes';