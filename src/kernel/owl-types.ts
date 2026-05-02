/**
 * OWL Input Type Definitions
 *
 * Per API spec §3 (Input Types). The structured-JS form OFBT consumes
 * directly without parsing; matches what RDF parsers (N3.js, etc.) produce
 * and what Fandaws Consumer Requirement §2.6 commits to.
 *
 * Pure type definitions — no runtime code.
 */

// --- §3.1 Top-level ontology shape ---

export interface OWLOntology {
  ontologyIRI: string;
  versionIRI?: string;
  imports?: string[];
  prefixes?: Record<string, string>;
  tbox: TBoxAxiom[];
  abox: ABoxAxiom[];
  rbox: RBoxAxiom[];
  annotations?: AnnotationAxiom[];
}

// --- §3.2 TBox axioms ---

export type TBoxAxiom =
  | SubClassOfAxiom
  | EquivalentClassesAxiom
  | DisjointWithAxiom
  | ClassDefinitionAxiom;

export interface SubClassOfAxiom {
  "@type": "SubClassOf";
  subClass: ClassExpression;
  superClass: ClassExpression;
}

export interface EquivalentClassesAxiom {
  "@type": "EquivalentClasses";
  classes: ClassExpression[];
}

export interface DisjointWithAxiom {
  "@type": "DisjointWith";
  classes: ClassExpression[];
}

export interface ClassDefinitionAxiom {
  "@type": "ClassDefinition";
  iri: string;
  expression: ClassExpression;
}

// --- §3.3 Class expressions ---

export type ClassExpression =
  | NamedClass
  | ClassIntersection
  | ClassUnion
  | ClassComplement
  | ObjectSomeValuesFrom
  | ObjectAllValuesFrom
  | ObjectHasValue
  | ObjectMinCardinality
  | ObjectMaxCardinality
  | ObjectExactCardinality
  | OneOf;

export interface NamedClass {
  "@type": "Class";
  iri: string;
}

export interface ClassIntersection {
  "@type": "ObjectIntersectionOf";
  classes: ClassExpression[];
}

export interface ClassUnion {
  "@type": "ObjectUnionOf";
  classes: ClassExpression[];
}

export interface ClassComplement {
  "@type": "ObjectComplementOf";
  class: ClassExpression;
}

export interface OneOf {
  "@type": "ObjectOneOf";
  individuals: string[];
}

// --- §3.4 Restrictions (OWL 2 standard JSON-LD shape) ---

export interface ObjectSomeValuesFrom {
  "@type": "Restriction";
  onProperty: string;
  someValuesFrom: ClassExpression | DatatypeRestriction;
}

export interface ObjectAllValuesFrom {
  "@type": "Restriction";
  onProperty: string;
  allValuesFrom: ClassExpression;
}

export interface ObjectHasValue {
  "@type": "Restriction";
  onProperty: string;
  hasValue: string;
}

export interface ObjectMinCardinality {
  "@type": "Restriction";
  onProperty: string;
  minCardinality: number;
  onClass?: ClassExpression;
}

export interface ObjectMaxCardinality {
  "@type": "Restriction";
  onProperty: string;
  maxCardinality: number;
  onClass?: ClassExpression;
}

export interface ObjectExactCardinality {
  "@type": "Restriction";
  onProperty: string;
  cardinality: number;
  onClass?: ClassExpression;
}

// --- §3.5 ABox axioms ---

export type ABoxAxiom =
  | ClassAssertion
  | ObjectPropertyAssertion
  | DataPropertyAssertion
  | NegativeObjectPropertyAssertion
  | NegativeDataPropertyAssertion
  | SameIndividual
  | DifferentIndividuals;

export interface ClassAssertion {
  "@type": "ClassAssertion";
  individual: string;
  class: ClassExpression;
}

export interface ObjectPropertyAssertion {
  "@type": "ObjectPropertyAssertion";
  property: string;
  source: string;
  target: string;
}

export interface DataPropertyAssertion {
  "@type": "DataPropertyAssertion";
  property: string;
  source: string;
  value: TypedLiteral;
}

export interface NegativeObjectPropertyAssertion {
  "@type": "NegativeObjectPropertyAssertion";
  property: string;
  source: string;
  target: string;
}

export interface NegativeDataPropertyAssertion {
  "@type": "NegativeDataPropertyAssertion";
  property: string;
  source: string;
  value: TypedLiteral;
}

export interface SameIndividual {
  "@type": "SameIndividual";
  individuals: string[];
}

export interface DifferentIndividuals {
  "@type": "DifferentIndividuals";
  individuals: string[];
}

// --- §3.6 Typed literals ---

export interface TypedLiteral {
  "@value": string;
  "@type": string;
  "@language"?: string;
}

// --- §3.7 RBox axioms ---

export type RBoxAxiom =
  | SubObjectPropertyOfAxiom
  | EquivalentObjectPropertiesAxiom
  | InverseObjectPropertiesAxiom
  | ObjectPropertyChainAxiom
  | ObjectPropertyDomainAxiom
  | ObjectPropertyRangeAxiom
  | DisjointObjectPropertiesAxiom
  | ObjectPropertyCharacteristicAxiom;

export interface SubObjectPropertyOfAxiom {
  "@type": "SubObjectPropertyOf";
  subProperty: string;
  superProperty: string;
}

export interface EquivalentObjectPropertiesAxiom {
  "@type": "EquivalentObjectProperties";
  properties: string[];
}

export interface InverseObjectPropertiesAxiom {
  "@type": "InverseObjectProperties";
  first: string;
  second: string;
}

export interface ObjectPropertyChainAxiom {
  "@type": "ObjectPropertyChain";
  chain: string[];
  superProperty: string;
}

export interface ObjectPropertyDomainAxiom {
  "@type": "ObjectPropertyDomain";
  property: string;
  domain: ClassExpression;
}

export interface ObjectPropertyRangeAxiom {
  "@type": "ObjectPropertyRange";
  property: string;
  range: ClassExpression;
}

export interface DisjointObjectPropertiesAxiom {
  "@type": "DisjointObjectProperties";
  properties: string[];
}

export interface ObjectPropertyCharacteristicAxiom {
  "@type": "ObjectPropertyCharacteristic";
  property: string;
  characteristic:
    | "Functional"
    | "InverseFunctional"
    | "Transitive"
    | "Symmetric"
    | "Asymmetric"
    | "Reflexive"
    | "Irreflexive";
}

// --- §3.8 Annotations ---

export interface AnnotationAxiom {
  "@type": "Annotation";
  property: string;
  subject?: string;
  value: string | TypedLiteral;
  // Per spec §13.1, annotation-on-annotation patterns are punted constructs
  // and rejected by the lifter. The field is typed here so the lifter can
  // detect the pattern; it does NOT participate in any FOL emission.
  annotations?: AnnotationAxiom[];
}

// --- §13.1 punted-construct shapes (typed so the lifter can detect them) ---

export interface DatatypeRestriction {
  "@type": "DatatypeRestriction";
  datatype: string;
  facets: Array<{ facet: string; value: string }>;
}

export interface HasKeyAxiom {
  "@type": "HasKey";
  class: ClassExpression;
  properties: string[];
}
