# OFBT Project Governance

This document explains how decisions get made in the OFBT project, who has authority over what, and how external auditors verify governance claims.

It is a stakeholder-facing artifact, intended to answer questions like:
- "What does 'architect-ratified' mean?"
- "If I claim OFBT has internal review discipline, what artifact can I show my architecture review board?"
- "What's the precedence rule when two architectural decisions conflict?"
- "How do I know a verification claim reflects reality rather than hardcoded text?"

Authored at Phase 1 close (2026-05-05) in response to a Phase 1 demo stakeholder review that flagged the term "architect-ratified" as needing external-verifiability.

---

## 1. Three roles

The project operates with three named roles. They are role-shaped, not seat-shaped — one human may play multiple roles, but at any given moment a decision routes to exactly one role's authority.

### 1.1 SME (Subject Matter Expert / Logic Tester)

**Domain.** Subject-matter expertise in formal ontology, First-Order Logic semantics, and Prolog reasoning. Authoritative on:

- ARC manifest content authorship (relation entries, IRIs, FOL formal definitions, OWL characteristic declarations)
- Test corpus content authorship (fixtures, manifest entries, vocabulary cache, vendored canonical sources)
- Validation discipline (the four-contract consistency check; canonical-source citations; canary-set design)
- Demo-site content authorship (`demo/`, `.github/workflows/pages.yml`)

**What SME produces.** Fixture files, manifest entries, ARC content, vocabulary-cache entries, demo HTML, this governance document. Reviewable by anyone reading the repository.

**What SME does NOT decide.** Implementation choices in the lifter / projector / validator code (Developer's domain). Architectural commitments that affect the spec or cross-role discipline (Architect's domain).

### 1.2 Developer

**Domain.** Implementation of the OFBT codebase. Authoritative on:

- `src/kernel/` (lifter, projector, validator, canonicalization, audit emission)
- `src/composition/` (session lifecycle, ARC loader, configuration types)
- `src/adapters/` (CLI, parser wrappers, packaging)
- `tests/lifter-phase1.test.ts` (test runner, inline regressions, helper extraction)
- `scripts/` (build tooling, lint scripts, gate checks)
- `project/DECISIONS.md` (ADR maintenance — content authored cooperatively with Architect; Developer commits)
- `project/ROADMAP.md` (status grounding — content reflects state; Developer commits)
- `project/reviews/` (entry/exit review documents — content authored cooperatively with SME; Developer commits)
- All `git add` / `git commit` / `git push` operations across all path domains (single-committer model — see Section 5).

**What Developer produces.** Code commits, CI verification reports, ROADMAP grounding updates, ADR text under Architect's substantive direction, review documents under SME's substantive direction.

**What Developer does NOT decide.** Substantive content decisions in SME's domain (ARC content, fixture content). Architectural commitments that change spec semantics or cross-role discipline.

### 1.3 Architect

**Domain.** Architectural commitment authority. Authoritative on:

- Whether a decision is architectural-tier (load-bearing, future-binding) or implementation-choice tier (subject to revision per spec §0.1)
- Ratification of new architectural commitments via explicit ruling text
- Disputes between SME and Developer over who owns a decision
- Spec-level changes per spec §0.2 (post-freeze evidence-gated change control)
- Authorization of escalation routes when path-domain overlap surfaces

**What Architect produces.** Explicit ruling text in escalation cycles. ADR substance for architectural-tier decisions (formalized in `project/DECISIONS.md` under Developer's commit authority). Verification ratifications of routing packets (see Section 4).

**What Architect does NOT do.** Author code. Author fixtures or ARC content. Run git operations. The Architect's authority is over what's permitted, not over execution.

---

## 2. The escalation cycle

When a substantive decision surfaces that exceeds one role's authority, the escalation cycle routes it through Architect ratification. Pattern:

1. **SME or Developer flags** an item that may be architectural-tier (could be: "this fixture amendment changes a previously-ratified contract"; "this implementation choice exposes a previously-undocumented design assumption"; "this decision will bind future phases"; "this surfaces a contradiction between spec and existing implementation").

2. **Routing packet drafted** by the role surfacing the item. Routing packet contents:
   - The artifacts requiring decision (file paths, line ranges, full content).
   - The substantive question framed neutrally ("Is this elision sound w.r.t. OWL semantics?" not "Is my implementation correct?").
   - Prior architect rulings the item depends on (cross-references to `project/DECISIONS.md` ADRs, AUTHORING_DISCIPLINE sections, prior phase-review documents).
   - Ratification scope: what the routing packet asks Architect to verify (substance vs. artifact-shape).

3. **Architect rules**, producing explicit ruling text. Ruling text includes:
   - Decision (Approved / Approved with scope / Rejected / Architect re-routing required).
   - Reasoning (what principle the ruling invokes; what alternatives were rejected).
   - Banking statements (principles to remember for future cycles).
   - Forward-tracks (items deferred to later phases or doc-pass formalization).

4. **Implementation lands** by the role appropriate to the path domain (typically Developer commits per single-committer model). Architect ruling text is preserved verbatim in the commit body and cross-referenced in artifacts that depend on it.

5. **External audit recovery.** Anyone reading the repository can recover the full ruling chain by:
   - `git log --grep="architect"` or `git log --grep="<cycle name>"` for routing-cycle commits.
   - `project/DECISIONS.md` for ADRs (Architect-substantive content).
   - `project/reviews/phase-N-entry.md` and `project/reviews/phase-N-exit.md` for phase-level architect ratifications.
   - `arc/AUTHORING_DISCIPLINE.md` Sections 0+ for cross-cutting ratified disciplines.

---

## 3. What "architect-ratified" produces (artifact list)

When a decision is "architect-ratified," the ratification produces verifiable repo-level artifacts. **A claim that a decision is architect-ratified must point to one or more of:**

| Artifact location | What it records | Example |
|---|---|---|
| `project/DECISIONS.md` ADR section | Architectural commitment formalized as an ADR with Architect's substantive direction | ADR-007 §1 (cycle-guard layer translation, ARCHITECTURAL COMMITMENT per spec §0.1) |
| `arc/AUTHORING_DISCIPLINE.md` Sections 0+ | Cross-cutting discipline ratified by Architect (e.g., path-fencing protocol, single-committer model, four-contract consistency check) | Section 0 (Path-Fencing Protocol, ratified at BFO/CLIF parity routing cycle 2026-05-02) |
| `project/reviews/phase-N-entry.md` | Architect's ratification of a phase's entry conditions (corpus + canaries + scope) | `phase-1-entry.md` Architect sign-off section (2026-05-02) |
| `project/reviews/phase-N-exit.md` | Architect's ratification of a phase's close (acceptance-criteria coverage + risk retrospective + forward-tracks) | `phase-1-exit.md` Section 10 (Phase 1 Close Certification, 2026-05-05) |
| Commit body of the routing-cycle close commit | Verbatim Architect ruling text quoted in the commit message body | Commit `46b7a82` body quotes Architect's "Layer A vs Layer B sharpening" ruling |

**If a claim of "architect-ratified" cannot point to one of these artifacts, the claim is unverifiable and should be challenged.** This is a load-bearing discipline for external auditors: every architectural commitment is reproducible from the repository.

---

## 4. Precedence rule for conflicting architectural decisions

When two architectural decisions appear to conflict:

1. **Later ratifications supersede earlier ones** for the same scope. Example: ADR-007 §7's Step 5 placeholder framing ("Skolem-witness prefix") was reframed at Step 7 implementation ("∃-bindings, no Skolems") per implementation evidence; the §7 text explicitly documents the reframing rather than silently substituting.

2. **Spec §0.2 governs spec-level conflicts.** Post-freeze spec changes require an ADR with implementation evidence (profile data, benchmarks, correctness counterexamples, or consumer-facing breakage). Speculative spec changes ("we should also support X") are not accepted post-freeze; they go on the v0.3 candidate list.

3. **Phase-exit ratifications close prior in-phase decisions** for that phase. Phase 2+ extensions to existing ADRs (e.g., ADR-007 §§11+ if any) land as new sections; they do NOT re-litigate previously-Resolved sections without architect-banked implementation evidence.

4. **Documented framing-corrections are not conflicts.** When implementation reveals a placeholder framing was wrong (the Step 7 example above), the resolution text explicitly documents the correction. This is honest self-correction per spec §0.1's "Status of Claims" framing, not a precedence dispute.

---

## 5. The single-committer model

Per `arc/AUTHORING_DISCIPLINE.md` Section 0.1 (ratified at BFO/CLIF parity reconciliation 2026-05-04):

- **Sole committer: Developer.** Every `git add` / `git commit` / `git push` runs through Developer.
- **SME role: content authorship + review-via-natural-language.** SME authors content into the working tree (path-fenced); routes proposed commits to Developer with suggested commit message + scope.
- **Architect role: ratification text in routing cycles, no commits.** Architect substance feeds into ADRs / AUTHORING_DISCIPLINE / phase-review documents that Developer commits.

This eliminates the two-role-commit-coordination synchronization gaps that surfaced during Phase 1's BFO/CLIF parity routing cycle.

**Orchestrator override** per CLAUDE.md §4 may explicitly authorize SME-side commit authority for a specific commit. When invoked, the override is documented in the commit body and stays bounded to the named commit; future cycles return to single-committer default.

---

## 6. How an external auditor verifies a governance claim

Any stakeholder, auditor, integration partner, or contributor can verify OFBT governance claims via the repository alone. Five anchor commands:

| Question | Verification command |
|---|---|
| "What architectural commitments has the project made?" | Read `project/DECISIONS.md` (all ADRs with Architect-substantive direction) |
| "What disciplines does the project enforce on content authorship?" | Read `arc/AUTHORING_DISCIPLINE.md` (Section 0+ cross-cutting; remaining sections ARC-specific) |
| "What did Phase N's entry/exit review look like?" | Read `project/reviews/phase-N-entry.md` and `project/reviews/phase-N-exit.md` |
| "What did the architect rule on the [BFO/CLIF / cycle-name] routing cycle?" | `git log --grep="<cycle name>"` to find the routing-cycle commits; commit bodies quote the Architect's ruling text verbatim |
| "What does 'architect-ratified' mean for this specific claim?" | The claim must point to one of the artifact locations in Section 3; if it doesn't, challenge it |

---

## 7. Phase-review discipline

Each phase produces two review documents in `project/reviews/`:

- `phase-N-entry.md` — Architect ratification of the phase's entry conditions (corpus + canaries + scope). Authored at phase entry; signed off before implementation begins.
- `phase-N-exit.md` — Phase close certification (acceptance-criteria coverage matrix + risk retrospective + forward-tracks). Authored at phase exit; signed off before next phase begins.

These documents are the primary external-audit artifact for phase-level governance. They cite specific commit SHAs, fixture file paths, and architect ruling text — verifiable by anyone with read access to the repository.

Phase 1 review documents:
- [`project/reviews/phase-1-entry.md`](reviews/phase-1-entry.md) — Architect sign-off 2026-05-02.
- [`project/reviews/phase-1-exit.md`](reviews/phase-1-exit.md) — Phase 1 closed 2026-05-05.

---

## 8. Summary for stakeholders

**OFBT has its own internal review discipline.** Three roles, escalation cycles, architect ratifications, single-committer model, phase-review documents, ADR record. All recorded in the repository, all verifiable by external audit.

**"Architect-ratified" is not a phrase; it's a pointer to an artifact.** Every claim that something is architect-ratified must be traceable to a specific ADR section, AUTHORING_DISCIPLINE entry, phase-review document, or routing-cycle commit body. If you can't follow the pointer, the claim is unverifiable.

**Stakeholders defending OFBT integration to their own architecture review boards can show this document.** It explains the discipline at a level where a non-OFBT-team architect can confirm "yes, that's a legitimate review structure" without having to learn the OFBT-internal vocabulary.

---

**Document version:** 1.0
**Authored at:** Phase 1 close, 2026-05-05
**Authored in response to:** Phase 1 stakeholder demo review (Director of Data Platform / Integration Partner POV); specifically the question "What does 'architect-ratified' actually mean?"
**Maintenance:** This document evolves as governance discipline evolves. Major revisions land as new sections; superseded text is preserved with deprecation notes for historical reference.
