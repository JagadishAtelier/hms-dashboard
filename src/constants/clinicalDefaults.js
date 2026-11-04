// frontend/src/constants/clinicalDefaults.js

export const CLINICAL_SYSTEM_DEFAULTS = [
  // --- LAB UNITS ---
  { category: "LAB_UNIT", code: "MG_DL", display_label: "mg/dL", sort_order: 1 },
  { category: "LAB_UNIT", code: "G_DL", display_label: "g/dL", sort_order: 2 },
  { category: "LAB_UNIT", code: "UG_DL", display_label: "µg/dL", sort_order: 3 },
  { category: "LAB_UNIT", code: "NG_ML", display_label: "ng/mL", sort_order: 4 },
  { category: "LAB_UNIT", code: "PG_ML", display_label: "pg/mL", sort_order: 5 },
  { category: "LAB_UNIT", code: "MMOL_L", display_label: "mmol/L", sort_order: 6 },
  { category: "LAB_UNIT", code: "UMOL_L", display_label: "µmol/L", sort_order: 7 },
  { category: "LAB_UNIT", code: "MEQ_L", display_label: "mEq/L", sort_order: 8 },
  { category: "LAB_UNIT", code: "IU_L", display_label: "IU/L", sort_order: 9 },
  { category: "LAB_UNIT", code: "U_L", display_label: "U/L", sort_order: 10 },
  { category: "LAB_UNIT", code: "K_UL", display_label: "10^3/µL", sort_order: 11 },
  { category: "LAB_UNIT", code: "M_UL", display_label: "10^6/µL", sort_order: 12 },
  { category: "LAB_UNIT", code: "CELLS_MCL", display_label: "cells/mcL", sort_order: 13 },
  { category: "LAB_UNIT", code: "PERCENT", display_label: "%", sort_order: 14 },
  { category: "LAB_UNIT", code: "RATIO", display_label: "ratio", sort_order: 15 },
  { category: "LAB_UNIT", code: "INR", display_label: "INR", sort_order: 16 },
  { category: "LAB_UNIT", code: "SEC", display_label: "sec", sort_order: 17 },
  { category: "LAB_UNIT", code: "COPIES_ML", display_label: "copies/mL", sort_order: 18 },
  { category: "LAB_UNIT", code: "QUALITATIVE", display_label: "Positive/Negative", sort_order: 19 },
  { category: "LAB_UNIT", code: "REACTIVE", display_label: "Reactive/Non-Reactive", sort_order: 20 },

  // --- LAB CATEGORIES ---
  { category: "LAB_CATEGORY", code: "BIOCHEMISTRY", display_label: "Biochemistry", sort_order: 1 },
  { category: "LAB_CATEGORY", code: "HEMATOLOGY", display_label: "Hematology & Coagulation", sort_order: 2 },
  { category: "LAB_CATEGORY", code: "MICROBIOLOGY", display_label: "Clinical Microbiology", sort_order: 3 },
  { category: "LAB_CATEGORY", code: "SEROLOGY", display_label: "Serology & Immunology", sort_order: 4 },
  { category: "LAB_CATEGORY", code: "HISTOPATHOLOGY", display_label: "Histopathology & Cytology", sort_order: 5 },
  { category: "LAB_CATEGORY", code: "PATHOLOGY_URINE", display_label: "Clinical Pathology & Urinalysis", sort_order: 6 },
  { category: "LAB_CATEGORY", code: "MOLECULAR_PCR", display_label: "Molecular Diagnostics & PCR", sort_order: 7 },
  { category: "LAB_CATEGORY", code: "BLOOD_BANK", display_label: "Blood Banking & Transfusion", sort_order: 8 },
  { category: "LAB_CATEGORY", code: "ENDOCRINOLOGY", display_label: "Endocrinology & Hormones", sort_order: 9 },

  // --- LAB METHODS ---
  { category: "LAB_METHOD", code: "AUTO_BIOCHEM", display_label: "Automated Biochemistry Analyzer", sort_order: 1 },
  { category: "LAB_METHOD", code: "SPECTRO", display_label: "Spectrophotometry / Colorimetric", sort_order: 2 },
  { category: "LAB_METHOD", code: "FLOW_CYTO", display_label: "Automated Cell Counter / Flow Cytometry", sort_order: 3 },
  { category: "LAB_METHOD", code: "CLIA", display_label: "Chemiluminescence Immunoassay (CLIA)", sort_order: 4 },
  { category: "LAB_METHOD", code: "ELISA", display_label: "Enzyme-Linked Immunosorbent Assay (ELISA)", sort_order: 5 },
  { category: "LAB_METHOD", code: "ECLIA", display_label: "Electrochemiluminescence (ECLIA)", sort_order: 6 },
  { category: "LAB_METHOD", code: "RT_PCR", display_label: "Real-Time PCR (RT-PCR)", sort_order: 7 },
  { category: "LAB_METHOD", code: "MICROSCOPY", display_label: "Brightfield Microscopy / Gram Stain", sort_order: 8 },
  { category: "LAB_METHOD", code: "CULTURE_SENS", display_label: "Culture & Antimicrobial Sensitivity", sort_order: 9 },
  { category: "LAB_METHOD", code: "RAPID_CARD", display_label: "Rapid Chromatographic Immunoassay", sort_order: 10 },

  // --- SPECIMEN TYPES ---
  { category: "SPECIMEN_TYPE", code: "EDTA_BLOOD", display_label: "Whole Blood (EDTA - Purple Top)", metadata: { tube_color: "#7e22ce" }, sort_order: 1 },
  { category: "SPECIMEN_TYPE", code: "SERUM_SST", display_label: "Serum (SST - Gold/Red Top)", metadata: { tube_color: "#eab308" }, sort_order: 2 },
  { category: "SPECIMEN_TYPE", code: "CITRATE_PLASMA", display_label: "Plasma (Sodium Citrate - Blue Top)", metadata: { tube_color: "#3b82f6" }, sort_order: 3 },
  { category: "SPECIMEN_TYPE", code: "HEPARIN_PLASMA", display_label: "Plasma (Lithium Heparin - Green Top)", metadata: { tube_color: "#22c55e" }, sort_order: 4 },
  { category: "SPECIMEN_TYPE", code: "URINE_RANDOM", display_label: "Urine (Random Specimen)", metadata: { tube_color: "#f59e0b" }, sort_order: 5 },
  { category: "SPECIMEN_TYPE", code: "URINE_24H", display_label: "Urine (24-Hour Collection)", metadata: { tube_color: "#d97706" }, sort_order: 6 },
  { category: "SPECIMEN_TYPE", code: "CSF", display_label: "Cerebrospinal Fluid (CSF)", metadata: { tube_color: "#64748b" }, sort_order: 7 },
  { category: "SPECIMEN_TYPE", code: "SPUTUM", display_label: "Sputum", metadata: { tube_color: "#94a3b8" }, sort_order: 8 },
  { category: "SPECIMEN_TYPE", code: "STOOL", display_label: "Stool Specimen", metadata: { tube_color: "#78350f" }, sort_order: 9 },
  { category: "SPECIMEN_TYPE", code: "SWAB_THROAT", display_label: "Nasopharyngeal / Throat Swab", metadata: { tube_color: "#06b6d4" }, sort_order: 10 },
  { category: "SPECIMEN_TYPE", code: "BODY_FLUID", display_label: "Pleural / Ascitic Fluid", metadata: { tube_color: "#64748b" }, sort_order: 11 },
  { category: "SPECIMEN_TYPE", code: "BIOPSY", display_label: "Tissue Biopsy (Formalin Fixed)", metadata: { tube_color: "#ef4444" }, sort_order: 12 },

  // --- TURNAROUND TIME ---
  { category: "TURNAROUND_TIME", code: "TAT_30M", display_label: "30 Minutes (STAT Emergency)", sort_order: 1 },
  { category: "TURNAROUND_TIME", code: "TAT_1H", display_label: "1 Hour (Urgent)", sort_order: 2 },
  { category: "TURNAROUND_TIME", code: "TAT_2H", display_label: "2 Hours", sort_order: 3 },
  { category: "TURNAROUND_TIME", code: "TAT_4H", display_label: "4 Hours", sort_order: 4 },
  { category: "TURNAROUND_TIME", code: "TAT_6H", display_label: "6 Hours", sort_order: 5 },
  { category: "TURNAROUND_TIME", code: "TAT_12H", display_label: "12 Hours", sort_order: 6 },
  { category: "TURNAROUND_TIME", code: "TAT_24H", display_label: "24 Hours (Next Day Routine)", sort_order: 7 },
  { category: "TURNAROUND_TIME", code: "TAT_48H", display_label: "48 Hours (Microbiology Culture)", sort_order: 8 },
  { category: "TURNAROUND_TIME", code: "TAT_72H", display_label: "72 Hours - 5 Days (Histopathology)", sort_order: 9 },

  // --- DOSAGE FORMS ---
  { category: "DOSAGE_FORM", code: "TABLETS", display_label: "Tablets", sort_order: 1 },
  { category: "DOSAGE_FORM", code: "CAPSULES", display_label: "Capsules", sort_order: 2 },
  { category: "DOSAGE_FORM", code: "CHEWABLE_TAB", display_label: "Chewable Tablets", sort_order: 3 },
  { category: "DOSAGE_FORM", code: "DISPERSIBLE_TAB", display_label: "Dispersible Tablets", sort_order: 4 },
  { category: "DOSAGE_FORM", code: "SYRUP_ML", display_label: "Syrup (ml)", sort_order: 5 },
  { category: "DOSAGE_FORM", code: "SUSPENSION_ML", display_label: "Suspension (ml)", sort_order: 6 },
  { category: "DOSAGE_FORM", code: "ORAL_DROPS", display_label: "Oral Drops (ml)", sort_order: 7 },
  { category: "DOSAGE_FORM", code: "VIAL_INJ", display_label: "Vial (Inj)", sort_order: 8 },
  { category: "DOSAGE_FORM", code: "AMPOULE", display_label: "Ampoule", sort_order: 9 },
  { category: "DOSAGE_FORM", code: "PFS", display_label: "Pre-filled Syringe (PFS)", sort_order: 10 },
  { category: "DOSAGE_FORM", code: "IV_INFUSION", display_label: "IV Infusion (ml)", sort_order: 11 },
  { category: "DOSAGE_FORM", code: "OINTMENT", display_label: "Ointment (g)", sort_order: 12 },
  { category: "DOSAGE_FORM", code: "CREAM", display_label: "Cream (g)", sort_order: 13 },
  { category: "DOSAGE_FORM", code: "INHALER", display_label: "Inhaler / Puffs", sort_order: 14 },
  { category: "DOSAGE_FORM", code: "NASAL_SPRAY", display_label: "Nasal Spray (doses)", sort_order: 15 },

  // --- ROOM TYPES ---
  { category: "ROOM_TYPE", code: "GENERAL", display_label: "General Ward", sort_order: 1 },
  { category: "ROOM_TYPE", code: "SEMI_PRIVATE", display_label: "Semi-Private Room", sort_order: 2 },
  { category: "ROOM_TYPE", code: "PRIVATE_DELUXE", display_label: "Private Deluxe Room", sort_order: 3 },
  { category: "ROOM_TYPE", code: "ICU", display_label: "Intensive Care Unit (ICU)", sort_order: 4 },
  { category: "ROOM_TYPE", code: "NICU", display_label: "Neonatal ICU (NICU)", sort_order: 5 },
  { category: "ROOM_TYPE", code: "HDU", display_label: "High Dependency Unit (HDU)", sort_order: 6 },
  { category: "ROOM_TYPE", code: "ISOLATION", display_label: "Isolation / Negative Pressure Room", sort_order: 7 },

  // --- SURGICAL RISK ---
  { category: "SURGICAL_RISK", code: "LOW", display_label: "Low", sort_order: 1 },
  { category: "SURGICAL_RISK", code: "MEDIUM", display_label: "Medium", sort_order: 2 },
  { category: "SURGICAL_RISK", code: "HIGH", display_label: "High", sort_order: 3 },
  { category: "SURGICAL_RISK", code: "CRITICAL", display_label: "Critical", sort_order: 4 },
];

export const TEST_TO_SPECIMEN_RULES = [
  { keywords: ["cbc", "hemogram", "esr", "hba1c", "blood count", "platelet", "wbc", "rbc", "edta"], specimen: "Whole Blood (EDTA - Purple Top)" },
  { keywords: ["glucose", "sugar", "lipid", "cholesterol", "triglyceride", "lft", "liver", "kft", "renal", "creatinine", "urea", "electrolyte", "thyroid", "tsh", "t3", "t4", "bilirubin", "crp", "ferritin", "calcium", "sst", "serum"], specimen: "Serum (SST - Gold/Red Top)" },
  { keywords: ["pt", "inr", "aptt", "coagulation", "fibrinogen", "d-dimer", "citrate", "prothrombin"], specimen: "Plasma (Sodium Citrate - Blue Top)" },
  { keywords: ["urine", "urinalysis", "urine routine", "proteinuria", "glycosuria"], specimen: "Urine (Random Specimen)" },
  { keywords: ["24h urine", "24-hour urine", "24 hour creatinine"], specimen: "Urine (24-Hour Collection)" },
  { keywords: ["csf", "cerebrospinal", "lumbar puncture"], specimen: "Cerebrospinal Fluid (CSF)" },
  { keywords: ["sputum", "afb", "mycobacterium", "tb sputum"], specimen: "Sputum" },
  { keywords: ["stool", "fecal", "occult blood", "parasite"], specimen: "Stool Specimen" },
  { keywords: ["covid", "swab", "throat swab", "nasopharyngeal", "rtpcr swab"], specimen: "Nasopharyngeal / Throat Swab" },
  { keywords: ["pleural", "ascitic", "synovial", "peritoneal fluid", "pericardial"], specimen: "Pleural / Ascitic Fluid" },
  { keywords: ["biopsy", "histopathology", "tissue", "formalin", "excisional"], specimen: "Tissue Biopsy (Formalin Fixed)" },
];

export function determineSpecimenType(testName = "", testCode = "", category = "") {
  const combined = `${testName} ${testCode} ${category}`.toLowerCase();
  for (const rule of TEST_TO_SPECIMEN_RULES) {
    if (rule.keywords.some((kw) => combined.includes(kw))) {
      return rule.specimen;
    }
  }
  if (category && category.toLowerCase().includes("hematology")) {
    return "Whole Blood (EDTA - Purple Top)";
  }
  return "Serum (SST - Gold/Red Top)";
}

export default {
  CLINICAL_SYSTEM_DEFAULTS,
  TEST_TO_SPECIMEN_RULES,
  determineSpecimenType,
};

