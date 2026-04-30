import {
  ShieldCheck,
  ShieldAlert,
  Building2,
  LayoutGrid,
  Wrench,
  Users,
  Award,
  FileText,
  Activity,
  type LucideIcon,
} from "lucide-react";

/* ─── Types ─────────────────────────────────────────────────────────────── */

export type GateStatus = "pending" | "passed" | "failed";

export type ChecklistItem = {
  id: string;
  title: string;
  detail?: string;
  gateType?: string;   // if set, status comes from DB GoLiveGate
  hardGate?: boolean;  // hint — reflected in UI even for non-DB items
};

export type SectionAccent =
  | "blue"
  | "violet"
  | "amber"
  | "green"
  | "red"
  | "slate"
  | "indigo"
  | "orange";

export type Section = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accent: SectionAccent;
  items: ChecklistItem[];
};

/* ─── Comprehensive Indian-lab go-live checklist ───────────────────────────
 * Compiled from a 25-year lab consultant's playbook. Items map to live DB
 * gates where possible (gateType set); the rest are reference items the
 * lab owner ticks off as they complete them.
 * ─────────────────────────────────────────────────────────────────────── */

export const SECTIONS: Section[] = [
  {
    id: "compliance",
    title: "Compliance & Certifications",
    description: "Statutory licences without which the lab cannot legally operate.",
    icon: ShieldCheck,
    accent: "blue",
    items: [
      { id: "comp-1",  title: "Clinical Establishments Act registration",       detail: "State CEA approval. Required in all states that have notified the Act. Renewal cycle varies by state.", gateType: "cea_approval", hardGate: true },
      { id: "comp-2",  title: "BMW Authorisation – Form II (BMW Rules 2016)",   detail: "Issued by State Pollution Control Board. Valid 5 years, renewable. Mandatory regardless of volume.", gateType: "bmw_authorization", hardGate: true },
      { id: "comp-3",  title: "CBWTF tie-up agreement",                          detail: "Signed contract with the Common Bio-medical Waste Treatment Facility. Without this, BMW authorisation will not be issued.", hardGate: true },
      { id: "comp-4",  title: "Fire NOC from local fire department",             detail: "State fire services. Inspect for extinguishers, exits, and material storage. Renewal annual or biennial.", gateType: "fire_noc", hardGate: true },
      { id: "comp-5",  title: "SPCB Consent to Establish + Consent to Operate",  detail: "Under Water Act 1974 and Air Act 1981. CTE before construction; CTO before operations. Scale-based fees.", hardGate: true },
      { id: "comp-6",  title: "AERB licence (only if X-ray / CT)",               detail: "Atomic Energy Regulatory Board – eLORA portal. Skip for routine pathology labs.", hardGate: false },
      { id: "comp-7",  title: "PC-PNDT registration (only if USG / genetics)",   detail: "State health department under PC-PNDT Act 1994. Heavily audited; record-keeping is non-negotiable.", hardGate: false },
      { id: "comp-8",  title: "Drug Licence Form 20B / 21B",                     detail: "Required if storing / dispensing Schedule H reagents or controlled chemicals. State Drug Controller.", hardGate: false },
      { id: "comp-9",  title: "Shops & Establishment Act registration",          detail: "Local labour department. Required for any commercial establishment.", hardGate: true },
      { id: "comp-10", title: "GST registration (and HSN/SAC codes for tests)",  detail: "GSTIN must reflect lab name. Diagnostic services are largely exempt under healthcare; verify per latest CBIC notifications.", hardGate: true },
      { id: "comp-11", title: "PAN, TAN, Professional Tax registrations",        detail: "TAN required for TDS on staff salaries. PT varies by state.", hardGate: true },
      { id: "comp-12", title: "Trade Licence from Municipal Corporation",        detail: "Required for the premises to legally house a commercial establishment. Renewal annual.", hardGate: true },
      { id: "comp-13", title: "Lift licence (if multi-storey)",                  detail: "State Lifts & Escalators Act. Inspector-issued certificate.", hardGate: false },
      { id: "comp-14", title: "DG-set NOC (if onsite generator)",                detail: "From SPCB plus local pollution norms. Acoustic enclosure compliance.", hardGate: false },
      { id: "comp-15", title: "NABL accreditation – application submitted",     detail: "ISO 15189 for medical labs. Pre-assessment, assessment, surveillance cycle. Plan minimum 6 months.", gateType: "nabl_readiness", hardGate: false },
      { id: "comp-16", title: "Lab name display board per state norms",          detail: "Pathologist name, qualification, registration number, lab name, hours. Some states mandate fonts/sizes.", hardGate: true },
    ],
  },
  {
    id: "infrastructure",
    title: "Infrastructure",
    description: "Power, water, network, and physical safeguards the lab depends on 24×7.",
    icon: Building2,
    accent: "violet",
    items: [
      { id: "infra-1",  title: "Sanctioned electrical load adequate",            detail: "Compute total: analyzers + freezers + HVAC + lighting + UPS. Add 30% headroom for future expansion." },
      { id: "infra-2",  title: "Three-phase supply for chemistry / autoclave",   detail: "Chemistry analyzers, autoclaves, deep freezers all need 3-phase. Verify with vendor specs." },
      { id: "infra-3",  title: "Online UPS for analyzers + LIS server",          detail: "Minimum 30 minutes runtime at full load. Online (double-conversion), not line-interactive." },
      { id: "infra-4",  title: "DG-set / inverter backup with 8 hr fuel",        detail: "Auto-changeover with 30-second cutover. Test monthly under load." },
      { id: "infra-5",  title: "Earthing tested (resistance < 1Ω)",              detail: "Annual test by licensed electrical contractor. Certificate filed." },
      { id: "infra-6",  title: "Continuous water supply + 1000L overhead tank",  detail: "Lab water stops, lab stops. Two-day buffer minimum." },
      { id: "infra-7",  title: "Type II/III water purification (Milli-Q grade)", detail: "For chemistry analyzer dilution. Conductivity < 1 µS/cm. Daily QC of feed water." },
      { id: "infra-8",  title: "Effluent treatment / disposal pathway documented", detail: "Per SPCB consent. Acid/alkali neutralisation; biological waste through CBWTF." },
      { id: "infra-9",  title: "HVAC: 18–25°C, humidity 40–60%",                 detail: "Reagent stability and analyzer specs depend on this. Log temp/humidity twice daily." },
      { id: "infra-10", title: "Primary broadband + cellular failover for LIS",  detail: "Two ISPs ideally. LIS uptime is non-negotiable for report delivery." },
      { id: "infra-11", title: "LAN cabling – 1 socket per workstation",         detail: "Cat 6 minimum. Patch panel + managed switch. WiFi for tablets/phones only." },
      { id: "infra-12", title: "Landline + dedicated mobile for the lab",        detail: "Critical-value calls and TPA / vendor coordination need a stable phone line." },
      { id: "infra-13", title: "CCTV with 30-day retention",                     detail: "Cover entries, sample handling, reagent storage, cash counter. Many states mandate camera coverage in PNDT-relevant labs." },
      { id: "infra-14", title: "Access control for restricted zones",            detail: "Biometric or RFID for sample storage, server room, narcotics-grade reagents." },
      { id: "infra-15", title: "Fire suppression per BIS norms",                 detail: "Smoke detectors, ABC + CO2 extinguishers (CO2 near electricals). Annual refill certificate." },
    ],
  },
  {
    id: "facility",
    title: "Facility Setup",
    description: "Physical zoning and finishes that meet regulatory inspections and patient flow.",
    icon: LayoutGrid,
    accent: "amber",
    items: [
      { id: "fac-1",  title: "Reception + waiting area (8–10 seats minimum)",    detail: "Separate from sample collection. Washable seating; visible test menu / price board." },
      { id: "fac-2",  title: "Private phlebotomy room ≥ 50 sq ft",               detail: "One bed/chair, sharps container, hand-wash sink, privacy curtain. Patient cannot see reception." },
      { id: "fac-3",  title: "Specimen reception / accessioning counter",        detail: "Separate from phlebotomy. Barcode printer here. Sample-rejection criteria displayed." },
      { id: "fac-4",  title: "Hematology workstation",                           detail: "Analyzer, manual differential microscope, IQC zone. Bench depth ≥ 60 cm." },
      { id: "fac-5",  title: "Biochemistry workstation",                         detail: "Analyzer + reagent fridge ≤ 2 m away. Water purification system within reach." },
      { id: "fac-6",  title: "Microbiology section (BSL-2, if offered)",         detail: "Biosafety cabinet Class II Type A2, autoclave, separate entry. Negative pressure preferred." },
      { id: "fac-7",  title: "Histopathology / cytology room (if offered)",      detail: "Fume hood for xylene/formalin. Cassette/grossing station. Slide archive cabinet." },
      { id: "fac-8",  title: "Pathologist's chamber – private, with PC",         detail: "Dual monitor, printer, signing space. Separate from technician area for confidentiality." },
      { id: "fac-9",  title: "Reagent storage zones – ambient / 2-8 / -20 / -80", detail: "Each zone has its own fridge/freezer with logger and alarm. Inventory by FEFO (first-expired-first-out)." },
      { id: "fac-10", title: "BMW segregation area – colour-coded bins",         detail: "Yellow / Red / White-translucent / Blue. Pedal-operated, lined, labelled, weighed daily." },
      { id: "fac-11", title: "Staff change room with lockers",                   detail: "Separate from work zones. PPE donning/doffing area. Boot covers if wet-area transfer." },
      { id: "fac-12", title: "Toilets – separate male/female + accessible",      detail: "Disabled-friendly toilet mandated by many state CEA rules." },
      { id: "fac-13", title: "Pantry / break area – away from work zones",       detail: "No food/drink in lab — enforced by signage and SOP." },
      { id: "fac-14", title: "Records storage with fireproof cabinet",           detail: "Legal retention: NABL 5 years, histopath slides 10 years, registers 7+ years. Off-site backup for digital." },
      { id: "fac-15", title: "Disabled-access ramp + grab bars",                 detail: "Slope ≤ 1:12. Many states block CEA approval without this." },
      { id: "fac-16", title: "Floors epoxy/vinyl, walls washable, coved skirting", detail: "No 90° corners between floor and wall — coved finish prevents dirt traps. Auditor will check." },
      { id: "fac-17", title: "Ventilation – 6 air changes per hour minimum",     detail: "Higher for microbiology / histopath sections. Exhaust away from intake." },
    ],
  },
  {
    id: "equipment",
    title: "Equipment Readiness",
    description: "Every analyser installed, calibrated, and under contract before the first patient sample.",
    icon: Wrench,
    accent: "violet",
    items: [
      { id: "eq-1",  title: "Hematology analyzer (5-part diff)",                 detail: "Installed, IQC running 2 levels twice daily, reference range verified.", gateType: "equipment_calibration", hardGate: true },
      { id: "eq-2",  title: "Biochemistry analyzer",                              detail: "Installed, calibrated per analyte, IQC charts started." },
      { id: "eq-3",  title: "Coagulation analyzer (PT/INR, APTT)",                detail: "ISI verified for thromboplastin lot. INR check on patient pool." },
      { id: "eq-4",  title: "Urine chemistry analyzer + microscopy setup",       detail: "Strip reader + binocular microscope for sediment. Reference photos at workstation." },
      { id: "eq-5",  title: "ESR analyzer or Westergren stand",                  detail: "Westergren remains the reference; auto analyzers must correlate." },
      { id: "eq-6",  title: "Centrifuges – clinical + microhematocrit",          detail: "Annual rotor inspection, RPM verification. Imbalance sensor functional." },
      { id: "eq-7",  title: "Binocular microscope with oil immersion",           detail: "Halogen or LED illumination. Annual servicing of objective lenses." },
      { id: "eq-8",  title: "Refrigerator (2–8°C) for reagents – temp logger",   detail: "24×7 logging with audible alarm at < 2°C or > 8°C. Daily AM/PM manual log." },
      { id: "eq-9",  title: "Deep freezer (-20°C / -80°C) – logger + alarm",     detail: "For sample retention and molecular reagents. UPS-backed; alarm SMS escalation." },
      { id: "eq-10", title: "Autoclave + hot air oven",                          detail: "Bowie-Dick test (autoclave) + biological indicator weekly. Validation cycle records." },
      { id: "eq-11", title: "Calibrated pipettes – multi-volume set",            detail: "Annual gravimetric calibration by accredited agency. Certificates filed." },
      { id: "eq-12", title: "Weighing balance (for reagent prep)",               detail: "Annual calibration with traceable weights. Daily 2-point verification." },
      { id: "eq-13", title: "UPS per critical analyzer",                          detail: "Surge + outage protection. Battery health check quarterly." },
      { id: "eq-14", title: "AMC contracts signed with each vendor",              detail: "Response time SLA (4 hr / 24 hr / next-day). Spares included or not — read fine print." },
      { id: "eq-15", title: "Equipment asset tagging + master list",              detail: "Asset ID, vendor, install date, warranty, AMC, serial. Auditor's first ask." },
      { id: "eq-16", title: "Calibration certificates within validity",           detail: "Vendor calibration is not enough — third-party for traceability where NABL applies." },
      { id: "eq-17", title: "IQC materials – multi-level per analyte, in stock", detail: "Minimum 2 levels (normal + abnormal). Monitor expiry; lot change triggers re-verification." },
      { id: "eq-18", title: "EQAS / PT enrolment – CMC Vellore / Bio-Rad / RIQAS", detail: "Enrolment confirmed for every reportable analyte. Cycle calendar visible." },
      { id: "eq-19", title: "Equipment SOP printed at each workstation",         detail: "Operator card laminated next to each analyzer. Step-by-step start/stop/QC." },
      { id: "eq-20", title: "Service contact numbers posted",                    detail: "Vendor support, field engineer, escalation. Time-to-call documented in breakdown log." },
    ],
  },
  {
    id: "staffing",
    title: "Staffing",
    description: "Right qualifications, registrations, and training before opening day.",
    icon: Users,
    accent: "green",
    items: [
      { id: "staff-1",  title: "Pathologist – MD/DCP, state council registered", detail: "Signed contract, registration number on every report. Locum arrangement also documented.", gateType: "pathologist_onboard", hardGate: true },
      { id: "staff-2",  title: "Microbiologist (if microbiology offered)",       detail: "MD Microbiology preferred. Required for NABL scope in microbiology." },
      { id: "staff-3",  title: "Senior biochemist / lab manager",                detail: "MSc / MD Biochemistry. Oversees IQC, EQAS, method validation." },
      { id: "staff-4",  title: "Lab Technicians – DMLT/BMLT, allied health reg.", detail: "State Allied & Healthcare Council registration where notified (e.g. NCAHP-aligned states)." },
      { id: "staff-5",  title: "Phlebotomists – certified and trained",          detail: "Vacutainer order of draw, paediatric technique, mastectomy-arm avoidance, fasting samples." },
      { id: "staff-6",  title: "Receptionist / front desk",                      detail: "Trained on test menu, sample requirements, TAT, payment modes." },
      { id: "staff-7",  title: "Billing / accounts staff",                       detail: "GST invoicing, TPA claim filing, refund/credit-note workflow." },
      { id: "staff-8",  title: "Housekeeping with BMW handler training",         detail: "Trained per BMW Rules. PPE drill. Vaccination status verified." },
      { id: "staff-9",  title: "Appointment letters with role + KRAs",           detail: "Probation, notice period, confidentiality clause, PF/ESI deduction visible." },
      { id: "staff-10", title: "PF, ESI, gratuity, professional tax registered",  detail: "EPFO + ESIC registrations active. Monthly returns calendar set up." },
      { id: "staff-11", title: "Hepatitis B vaccination (3 doses) – every staff", detail: "Mandatory under occupational health. Anti-HBs titre check post-series." },
      { id: "staff-12", title: "Induction training: lab safety, BMW, ISO 15189", detail: "Day-1 induction signed off. Refresher annually." },
      { id: "staff-13", title: "Biosafety training certificate per staff",        detail: "BSL-2 protocols, spill response, sharps handling.", gateType: "staff_training", hardGate: true },
      { id: "staff-14", title: "Customer service / phone etiquette training",     detail: "Front desk + phlebotomy. Critical-value call script practised." },
      { id: "staff-15", title: "Backup pathologist / locum arrangement",          detail: "Reports cannot wait. Tie-up with another lab or partner pathologist documented." },
      { id: "staff-16", title: "Roster, leave policy, attendance system",         detail: "Biometric or app-based. Overtime tracking. Statutory leave entitlements respected." },
      { id: "staff-17", title: "Staff ID cards + uniforms",                       detail: "Photo ID, role, blood group, HepB status. Uniform colour-coded by role helps workflow." },
    ],
  },
  {
    id: "qc",
    title: "Quality Control",
    description: "The systems that keep results trustworthy day after day.",
    icon: Award,
    accent: "blue",
    items: [
      { id: "qc-1",  title: "IQC – multi-level per analyte",                    detail: "Two levels minimum (normal + abnormal); three for critical analytes. Run with every shift / batch." },
      { id: "qc-2",  title: "Levey-Jennings charts maintained",                 detail: "LIS-driven preferred. Manual fallback for short-term / off-line analytes." },
      { id: "qc-3",  title: "Westgard rules implemented",                       detail: "1-3s, 2-2s, R-4s, 4-1s, 10x. Action and rejection rules documented; staff trained on response." },
      { id: "qc-4",  title: "EQAS / PT enrolment confirmed",                    detail: "Every reportable analyte. Cycle calendar pinned. Performance reviewed in management review.", hardGate: true },
      { id: "qc-5",  title: "Calibration verification per instrument",          detail: "At install, after major service, post-lot change. Record retained per IQC SOP." },
      { id: "qc-6",  title: "Reference ranges validated for local population",  detail: "Either local 120-sample validation or vendor-derived with documented justification." },
      { id: "qc-7",  title: "Linearity verification per quantitative test",     detail: "5-point dilution series annually + after major service. CLSI EP6 protocol simplified." },
      { id: "qc-8",  title: "Carryover study (chemistry, hematology)",          detail: "High-low sequence test. Acceptable carryover < 1% typically." },
      { id: "qc-9",  title: "Method comparison study (when method changes)",    detail: "Bland-Altman or Deming regression on 40+ samples spanning the reportable range." },
      { id: "qc-10", title: "Test menu signed by pathologist",                  detail: "Every test the lab will report — specimen type, method, units, reference range, TAT." },
      { id: "qc-11", title: "Critical / panic / reportable values list",        detail: "Reviewed annually with clinicians. Posted at every workstation. Communication SOP defined." },
      { id: "qc-12", title: "Reagent lot-to-lot verification protocol",         detail: "Parallel testing on QC + 5 patient samples old vs new lot. Acceptance criteria documented." },
      { id: "qc-13", title: "TAT targets per test category",                    detail: "Routine vs urgent vs stat. 90% within target — measured and reviewed." },
      { id: "qc-14", title: "Sample rejection criteria documented",             detail: "Hemolysis, lipemia, clotting, insufficient volume, mislabelled. Front-of-house aware." },
      { id: "qc-15", title: "Internal audit schedule (quarterly minimum)",      detail: "Cross-sectional checks of SOP adherence, records, calibration, training.", gateType: "internal_audit", hardGate: false },
      { id: "qc-16", title: "Management review meeting cadence",                detail: "Quarterly or biannual. Inputs: NCs, complaints, EQAS, training, equipment, customer feedback." },
    ],
  },
  {
    id: "safety",
    title: "Safety Protocols",
    description: "Biosafety, occupational health, and emergency readiness.",
    icon: ShieldAlert,
    accent: "red",
    items: [
      { id: "saf-1",  title: "BSL-2 protocols documented",                     detail: "WHO Lab Biosafety Manual + CDC BMBL framework. Risk assessment per procedure." },
      { id: "saf-2",  title: "PPE inventory: gloves, masks, shields, coats",   detail: "Sized inventory (S/M/L/XL). N95 + surgical. Face shields for high-splash. Closed-toe footwear policy." },
      { id: "saf-3",  title: "Eye-wash station + emergency shower",            detail: "Within 10 seconds of any corrosive workstation. Weekly flush log." },
      { id: "saf-4",  title: "Spill kits at every workstation",                detail: "Biological + chemical. Sodium hypochlorite, absorbent, bags, labels, gloves, scoop." },
      { id: "saf-5",  title: "Sharps disposal at every collection point",      detail: "Puncture-proof, hand-free, never more than 3/4 full. White-translucent BMW category." },
      { id: "saf-6",  title: "Needle-stick injury (NSI) protocol + PEP",       detail: "Written, accessible to staff. Source testing within 1 hr; PEP within 2 hr if indicated." },
      { id: "saf-7",  title: "Hepatitis B vaccination of all staff – logged",  detail: "3-dose series complete. Anti-HBs titre. Booster if titre < 10 mIU/mL." },
      { id: "saf-8",  title: "Annual staff health check program",              detail: "Pre-employment baseline + annual. CBC, LFT, HBV/HCV, chest X-ray as per occupational risk." },
      { id: "saf-9",  title: "BMW colour-coded segregation (Y/R/W/B)",         detail: "Yellow (anatomical/microbio), Red (contaminated plastics), White-translucent (sharps), Blue (glass/metal)." },
      { id: "saf-10", title: "BMW vendor pickup + Form IV manifest",            detail: "Daily pickup or per agreement. Form IV annual return to SPCB by 30 June." },
      { id: "saf-11", title: "MSDS file for every chemical / reagent",          detail: "Vendor-supplied + lab summary. Accessible to staff in seconds, not minutes." },
      { id: "saf-12", title: "Fire drill conducted, attendance logged",         detail: "At least one before opening day. Annual cadence after." },
      { id: "saf-13", title: "Mock drills: NSI / chemical spill / fire",        detail: "Quarterly rotation. Findings -> corrective action -> SOP update if needed." },
      { id: "saf-14", title: "Emergency contacts posted at every workstation", detail: "Fire, police, ambulance, pathologist, MoH, electrical contractor, BMW vendor." },
      { id: "saf-15", title: "First-aid kit – stocked, expiry-checked",        detail: "Minimum BIS-IS 12245 contents. Monthly expiry sweep." },
      { id: "saf-16", title: "Lab signage – biohazard, no eating, PPE required", detail: "Pictograms at every entry to lab zones. Multilingual where relevant." },
    ],
  },
  {
    id: "documentation",
    title: "Documentation",
    description: "Manuals, SOPs, registers, and policies that prove the lab can be audited.",
    icon: FileText,
    accent: "slate",
    items: [
      { id: "doc-1",  title: "Quality Manual (NABL ISO 15189 format)",          detail: "Even if not pursuing NABL on day one, structure the manual to ISO 15189 to avoid rewrites later.", gateType: "quality_manual", hardGate: false },
      { id: "doc-2",  title: "Document Control Master List",                   detail: "Every controlled document — name, version, owner, review date, next review. The auditor's index." },
      { id: "doc-3",  title: "SOPs: collection, accessioning, processing, reporting", detail: "One per process. Author + reviewer + approver signatures. Annual review enforced.", gateType: "sample_collection_sops", hardGate: true },
      { id: "doc-4",  title: "SOPs: BMW disposal, calibration, IQC, EQAS, complaints", detail: "Operational SOPs distinct from analytical. Linked from Quality Manual." },
      { id: "doc-5",  title: "Patient consent forms (general + HIV/genetic)",  detail: "HIV requires explicit pre-test counselling consent in many states. Genetic tests need PNDT-aligned consent." },
      { id: "doc-6",  title: "Test request / requisition slip template",       detail: "Patient ID, clinician, test list, sample type, time of collection, special instructions." },
      { id: "doc-7",  title: "Sample collection manual for clinicians",        detail: "Tube types, volumes, preparation, transport, stability. Sent to referring clinics." },
      { id: "doc-8",  title: "Test menu booklet – sample, prep, TAT, MRP",     detail: "Patient-facing version + clinician version. Printed and on website." },
      { id: "doc-9",  title: "Pathologist signature register",                  detail: "Every report signed by named pathologist. Digital signature with audit trail acceptable." },
      { id: "doc-10", title: "Equipment logbooks per instrument",               detail: "Calibration, maintenance, breakdown, IQC. Bound register or LIS module." },
      { id: "doc-11", title: "Temperature logs – fridges, freezers, room",     detail: "Twice daily AM/PM. Out-of-range = corrective action documented." },
      { id: "doc-12", title: "Reagent inventory + expiry register",             detail: "FEFO discipline. Expired reagent quarantined, not just discarded — auditor wants to see the process." },
      { id: "doc-13", title: "Patient register (manual + LIS)",                 detail: "Sequential lab numbers. Cross-checked with billing daily." },
      { id: "doc-14", title: "Report template – logo, NABL symbol, disclaimer", detail: "NABL symbol only if accredited. Disclaimer per IMA/PCI guidance. Pathologist signature, registration number." },
      { id: "doc-15", title: "Complaint / feedback register + closure log",    detail: "Categorised: clinical, service, billing. Root cause + corrective action + closure date." },
      { id: "doc-16", title: "DPDP Act 2023 – privacy & data protection policy", detail: "Patient consent for data processing, retention period, breach response, grievance officer named." },
      { id: "doc-17", title: "BMW annual return – Form IV filed by 30 June",   detail: "Volumes by category, treatment route. Late filing attracts notice." },
      { id: "doc-18", title: "Insurance: indemnity, public liability, fire",   detail: "Professional indemnity for pathologist + lab entity. Public liability ≥ ₹1 cr. Equipment + fire/burglary cover.", gateType: "insurance_policies", hardGate: false },
      { id: "doc-19", title: "AMC contracts filed and indexed",                 detail: "Vendor, equipment, period, response time, escalation. Calendar reminder 60 days before expiry." },
      { id: "doc-20", title: "NABL document checklist – complete",              detail: "Even pre-application. Surveillance assessor will use this checklist verbatim.", gateType: "nabl_document_checklist", hardGate: false },
    ],
  },
  {
    id: "operations",
    title: "Operational Workflows",
    description: "How patients move, samples flow, and reports reach the right hands.",
    icon: Activity,
    accent: "indigo",
    items: [
      { id: "ops-1",  title: "LIS installed + UAT signed off",                  detail: "User acceptance test against test cases for registration, accessioning, reporting, billing.", gateType: "lims_integration", hardGate: true },
      { id: "ops-2",  title: "LIS-analyzer interface tested (HL7 / ASTM)",      detail: "Bidirectional ideally. Test order down, result up. Error-handling for partial sends." },
      { id: "ops-3",  title: "Barcode generation + scanner at accessioning",   detail: "Lab number + patient ID. Unique, sequential, scan-driven workflow eliminates transcription errors." },
      { id: "ops-4",  title: "Patient registration workflow tested end-to-end", detail: "Walk-in + appointment + home collection + repeat patient flows." },
      { id: "ops-5",  title: "Sample tracking from collection to reporting",   detail: "Every status: collected, in-transit, received, processing, reported, delivered. Lost-sample rate tracked." },
      { id: "ops-6",  title: "Cash / card / UPI payment integration",          detail: "Settlement reconciliation daily. UPI QR static + dynamic. Card terminal with EMV/PIN." },
      { id: "ops-7",  title: "TPA empanelment (if accepting insurance)",       detail: "Star, HDFC ERGO, ICICI Lombard, Bajaj Allianz, etc. Cashless workflow + rate negotiation." },
      { id: "ops-8",  title: "Home collection logistics tested",                detail: "Phlebotomist routing, sample transport at correct temp (cold chain), TAT to lab." },
      { id: "ops-9",  title: "Outsourced / referred test workflow",             detail: "Sample-out tracker + report-in tracker. Reference lab list with TAT and pricing." },
      { id: "ops-10", title: "Report delivery: SMS, email, WhatsApp, hard copy", detail: "Patient consent for channel. Encrypted PDF preferred for email/WhatsApp." },
      { id: "ops-11", title: "Critical value protocol – call within 30 min",   detail: "Call clinician + read-back confirmation + log. Documented in patient record." },
      { id: "ops-12", title: "Doctor-side login / referral management",         detail: "Online portal for referring clinicians to track samples, download reports, see history." },
      { id: "ops-13", title: "Trial run: 50–100 dummy / staff samples",         detail: "End-to-end before opening. Find broken workflows now, not on patients." },
      { id: "ops-14", title: "Daily morning huddle / handover protocol",        detail: "Pending samples, instrument issues, IQC failures, staff schedule, urgent reports." },
      { id: "ops-15", title: "Inventory reorder triggers (min stock alerts)",  detail: "Reagents, controls, consumables. Lead time + buffer per item." },
      { id: "ops-16", title: "Vendor management contact sheet",                 detail: "Reagents, AMC, calibration, courier, IT, biomedical waste. SLA + escalation per vendor." },
      { id: "ops-17", title: "Marketing collateral – clinician kit, web, GMB",  detail: "Doctor visit kit (test menu + business card + sample report). Google Business listing live." },
      { id: "ops-18", title: "Pricing / MRP list finalised and displayed",     detail: "Reception display + website. Discount matrix separate; not advertised." },
      { id: "ops-19", title: "Discount / package authorisation matrix",         detail: "Who can approve what discount. Audit trail in LIS." },
      { id: "ops-20", title: "Refund / re-test policy documented",              detail: "When sample compromised, when result questioned, when patient unsatisfied. Clear thresholds." },
      { id: "ops-21", title: "Soft launch plan – limited hours / referrals",   detail: "First 2–4 weeks with controlled volume. Review daily, scale only after stable." },
    ],
  },
];

export const ALL_ITEMS: ChecklistItem[] = SECTIONS.flatMap((s) => s.items);

/* ─── Legacy localStorage cleanup ────────────────────────────────────────
 * State now lives in MongoDB via /api/go-live/checklist. Older browsers
 * may still hold a `go-live-checklist:v1` key from the previous version —
 * call this once on mount to clear it so nothing persists locally.
 * ─────────────────────────────────────────────────────────────────────── */

const LEGACY_LS_KEY = "go-live-checklist:v1";

export function purgeLegacyLocalState() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(LEGACY_LS_KEY);
  } catch {
    /* swallow access errors (private mode etc.) */
  }
}
