/**
 * Phase 3 Step 3 — minimal Tau Prolog type declarations.
 *
 * Tau Prolog ships untyped JS; OFBT only consumes a small subset of the
 * Session/Thread API per ADR-007 §11 (consult + query + answer). This
 * declaration file pins the consumed surface in TypeScript without
 * pulling in the whole tau-prolog API.
 *
 * Per the SME-Persona Verification of Vendored Canonical Sources
 * discipline (AUTHORING_DISCIPLINE.md "Vendoring Discipline" subsection):
 * tau-prolog is a peer dependency, NOT a vendored canonical source. No
 * license-verification block applies; the declaration is OFBT-authored
 * type-binding glue.
 *
 * Lives in src/composition/ because Tau Prolog is a composition-layer
 * concern (kernel is pure; no Tau Prolog dependency).
 */

declare module "tau-prolog/modules/lists.js" {
  // The lists module is a function that registers list predicates
  // (member/2, append/3, length/2, etc.) on the passed pl object.
  // Returns void; mutation of the pl object is the side effect.
  const listsModule: (pl: unknown) => void;
  export default listsModule;
}

declare module "tau-prolog" {
  export interface TauPrologConsultOptions {
    /** Treat program string as filename (Node fs lookup). Default true; pass false to force text path. */
    file?: boolean;
    /** Treat program string as URL. Default true (browser only). */
    url?: boolean;
    /** Treat program as DOM node. Default true (browser only). */
    html?: boolean;
    /** Treat program string as DOM script tag id. Default true (browser only). */
    script?: boolean;
    /** Treat program string as Prolog source text. Default true. */
    text?: boolean;
    /** Called on successful consultation. */
    success?: () => void;
    /** Called on parse/load error. */
    error?: (err: unknown) => void;
  }

  export interface TauPrologSession {
    consult(program: string, options?: TauPrologConsultOptions): unknown;
    query(goal: string, options?: unknown): unknown;
    answer(callback: (answer: unknown) => void): unknown;
    answers(callback: (answer: unknown) => void, max?: number, after?: () => void): unknown;
  }

  export interface TauPrologModule {
    create(limit?: number): TauPrologSession;
    version: string;
    type: {
      is_substitution: (x: unknown) => boolean;
      is_error: (x: unknown) => boolean;
    };
  }

  const pl: TauPrologModule;
  export default pl;
}
