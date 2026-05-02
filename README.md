# OWL-FOL Bidirectional Translator (OFBT)

A round-trip translation layer between OWL 2 DL ontologies and First-Order Logic, designed to preserve axiomatic content across the formats' expressivity gap.

## Problem

OWL 2 DL is decidable, fast, and broadly tooled. First-Order Logic is fully expressive but undecidable. Real ontology work — particularly anything involving time-indexed relations (BFO 2020 ternary parthood), negative constraints, or multi-variable bindings — needs both. The standard practice is to choose: live within OWL's restrictions, or exit to FOL and lose interoperability with the semantic-web stack.

OFBT refuses the choice. It maintains a synchronized representation in both formats and projects between them according to declared fidelity contracts. What can be expressed cleanly in OWL stays in OWL. What requires FOL is held in FOL and exposed to OWL via property chains and structural annotations.

## Architecture

OFBT is a dual-engine system anchored by a shared logical core.

### ARC — Axiomatic Relational Core

ARC is the catalogue of verified relations the translator operates over. For each relation, ARC specifies the BFO/RO parent property, the OWL characteristics actually declared on the IRI, the FOL definition (in CL or KIF), domain and range with disjointness implications, and inverse / property-chain dependencies. ARC is the truth source; both engines defer to it for every relation they handle.

The current ARC tabulation lives in `relations_catalogue.tsv` and covers the core BFO/RO/CCO mereological, dependence, realization, spatial, temporal, and information-bridge layers, plus the deontic sublayer for the Realist Deontic Modeling specification.

### Lifting Engine — OWL → FOL

OWL triples are loaded into a Tau Prolog environment alongside ARC's FOL axioms. Where OWL has dropped a temporal argument — e.g. `continuant_part_of` is binary in BFO 2020 OWL but ternary in the CL definition — the lifter restores it from available temporal annotations. Where OWL declares only `TransitiveProperty` for a relation that is also reflexive and antisymmetric in CL, the lifter imports the missing axioms. The result is a Prolog environment in which the original OWL graph plus its full FOL specification is queryable.

### Projection Engine — FOL → OWL

Inferences computed in the FOL layer are serialized back to OWL using one of three strategies, selected per axiom:

| Strategy | When applicable | OWL realization |
|---|---|---|
| **Direct mapping** | Axiom is within OWL 2 DL | Property characteristic, subClassOf, equivalentClass |
| **Property-chain realization** | Derived implication expressible as a chain | `owl:propertyChainAxiom` |
| **Annotated approximation** | Axiom exceeds OWL 2 DL | Structural annotation + machine-readable FOL string carried as a custom annotation property |

The result is consumable by standard semantic-web tooling without a Prolog engine. An advanced agent (Fandaws, an inference service) can recover the full FOL by reading the annotations.

## Fidelity Contract

The annotated-approximation strategy is the load-bearing one — and the one most likely to be misread. It is not a metaphor for the original logic. It is a structured residue, designed to be machine-recoverable. Each annotated approximation carries four components: the original FOL axiom in CL or KIF; the reason it cannot be expressed in OWL 2 DL (decidability, missing characteristic, expressivity gap); the OWL approximation actually used; and a round-trip identifier so the FOL form can be reconstituted by the lifter.

This makes OFBT lossless across a single round trip. A graph can be lifted to FOL, reasoned over, projected to OWL with annotations, and re-lifted without information loss. The lossy direction — consuming the OWL projection in a third-party tool that ignores the annotations — is acknowledged and documented per axiom rather than hidden.

## On Representational Fidelity

A common failure mode in ontology engineering is forcing high-expressivity logic into low-expressivity formats and pretending nothing was lost. OFBT's stance is that expressivity gaps are real, locatable, and tractable — but only if you stop pretending.

Direct mapping handles the cases where OWL and FOL agree. Property-chain realization handles the cases where an OWL shortcut faithfully encodes an FOL inference. Annotated approximation handles the residue: the cases where OWL cannot represent the axiom, period. In those cases OFBT does not silently drop the axiom and does not produce an OWL form that *looks* equivalent but is not. It produces an OWL form that is honestly weaker, accompanied by a precise specification of what was weakened and how to recover it.

## Architectural Constraints

OFBT inherits the edge-canonical execution principle from the broader OFI stack:

- Runs unmodified in a browser or via `node index.js`
- No required infrastructure dependencies
- Deterministic behavior — same input produces byte-stable output
- JSON-LD canonical representation for inputs and outputs
- Offline-first

These constraints are non-negotiable. They shape every implementation choice, including the selection of Tau Prolog over server-side Prolog implementations.

## Position in the OFI Stack

OFBT is the synchronization layer beneath Fandaws. Fandaws assembles graphs from natural-language inputs (via TagTeam.js) and from structured sources; OFBT keeps those graphs simultaneously valid as OWL and as FOL so that downstream services can choose their reasoning regime per query. Speed-critical queries hit the OWL projection; correctness-critical queries hit the FOL lift.

The longer trajectory is the Synthetic Moral Person Architecture. A synthetic agent capable of moral accountability needs a reasoning substrate that does not silently drop axioms — every weakening must be inspectable and reversible. OFBT is the ontology-level component of that requirement.

## Status

- **ARC.** Definitions for ~50 core BFO/RO/CCO relations stable. Deontic and information-bridge sublayers in draft.
- **Lifting engine.** Specification phase. Tau Prolog selected for the FOL layer to preserve edge-canonical execution.
- **Projection engine.** Specification phase. The three-strategy router is the next concrete deliverable.
- **TagTeam.js bridge.** Gated on Fandaws vocabulary completion.

## Roadmap

1. Finalize ARC definitions for the remaining BFO 2020 / RO / CCO relations.
2. Specify the projection-strategy decision algorithm: given an FOL axiom, which of the three strategies applies, and what diagnostics fire when none does.
3. Implement the Tau Prolog lifter against the ARC catalogue.
4. Implement the OWL serializer with annotation-property conventions.
5. Bridge TagTeam.js output directly into the lifted environment.

## License

MIT License
