import { InjectionToken, signal, type Signal } from '@angular/core';

/**
 * A "data pair" a page registers with the Data Tools: its LOCAL mock and a
 * loader for the REAL api-sdk value — both the SAME model. The verifier compares
 * them and reports whether mock and api agree.
 */
export interface DataPair {
  id: string;
  label: string;
  /** The local (mock) value. */
  mock: unknown;
  /** Fetch the real value from the api-sdk. */
  loadApi: () => Promise<unknown>;
}

export type DataVerifyStatus = 'idle' | 'running' | 'pass' | 'fail' | 'error';

export interface DataVerifyResult {
  id: string;
  status: DataVerifyStatus;
  mockKeys: string[];
  apiKeys: string[];
  missingInMock: string[];
  missingInApi: string[];
  message?: string;
}

/* ── Data manifest — the page's data-management logic, shown in the Data Tools
   modal (dev-only; created during the page build/adjustment, worthless once the
   page is certified and never shipped to production). ──────────────────────── */

/** A data model used by the page, on the mock and/or the api-sdk side. */
export interface DataModelInfo {
  name: string;
  fields: string[];
  /** Where the model exists. */
  source: 'mock' | 'api' | 'both';
}

/** An api-sdk endpoint the page uses. */
export interface DataEndpointInfo {
  method: string;
  path: string;
  service: string;
  purpose: string;
}

/**
 * Working-memory model of the page: whether the INITIAL load (cold data shown on
 * open) is separated from the WORKING data the user mutates against the backend
 * (like an interactive dashboard that manages data live).
 */
export interface WorkingMemoryInfo {
  initialLoad: string;
  workingData: string;
  separated: boolean;
  interactive: boolean;
  notes?: string;
}

/** A directed edge of the page's data flow (for the flow diagram). */
export interface DataFlowStep {
  from: string;
  to: string;
  label?: string;
}

export interface DataManifest {
  id: string;
  label: string;
  /** The MODULE the page belongs to (e.g. `invesbase`). */
  module?: string;
  /** Access route and layout. */
  route?: string;
  layout?: string;
  /** Page maturity level (e.g. `scaffold` | `body` | `data` | `certified`). */
  maturity?: string;
  /** Section components created for the page. */
  sections?: string[];
  /** Integrator components created for the page. */
  integrators?: string[];
  models: DataModelInfo[];
  endpoints: DataEndpointInfo[];
  workingMemory: WorkingMemoryInfo;
  flow: DataFlowStep[];
}

/**
 * DATA_TOOLS_SERVICE — optional seam (like DATA_SOURCE_SERVICE). The app provides
 * it; pages register their mock/api pair + their data manifest; the FAB (Data
 * Tools tab → modal) lists the pairs, runs the verifier and shows the manifest.
 * The design system never assumes a backend or a page model.
 */
export interface IDataToolsService {
  readonly pairs: Signal<DataPair[]>;
  register(pair: DataPair): void;
  verify(id: string): Promise<DataVerifyResult>;

  readonly manifests: Signal<DataManifest[]>;
  registerManifest(manifest: DataManifest): void;
}

export const DATA_TOOLS_SERVICE = new InjectionToken<IDataToolsService>('DATA_TOOLS_SERVICE');

/** No-op default — the Data Tools tab is hidden when no service is provided. */
export class NoopDataToolsService implements IDataToolsService {
  readonly pairs = signal<DataPair[]>([]);
  readonly manifests = signal<DataManifest[]>([]);
  register(_pair: DataPair): void {}
  registerManifest(_manifest: DataManifest): void {}
  verify(_id: string): Promise<DataVerifyResult> {
    return Promise.resolve({ id: _id, status: 'idle', mockKeys: [], apiKeys: [], missingInMock: [], missingInApi: [] });
  }
}
