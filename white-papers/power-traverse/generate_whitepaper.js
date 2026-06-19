#!/usr/bin/env node
/**
 * INSPIN Power Traverse White Paper Generator
 * Entity: INSPIN Private Limited, Ghaziabad, UP, India
 * Font: Latin Modern Roman
 * Output: DOCX (PDF via LibreOffice headless)
 */

const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
  Header, Footer, AlignmentType, LevelFormat,
  TabStopType, TabStopPosition,
  TableOfContents, HeadingLevel, BorderStyle, WidthType, ShadingType,
  VerticalAlign, PageNumber, PageBreak, SectionType
} = require("docx");

// ============================================================
// CONFIGURATION
// ============================================================

const REPORT_META = {
  displayTitle: "Power Traverse for Gun Stabilization",
  subtitle: "A Parametric Control Architecture for Armoured Vehicle Turret Drive Systems",
  moduleInfo: null,
  coverDocType: "WHITE PAPER",
  revision: null,
  headerLeft: "WHITE PAPER",
  classification: "CONFIDENTIAL",
  date: "JUNE 19, 2026",
  authorName: null,      // NO author on cover
  authorTitle: null,     // NO title on cover
  company: "INSPIN Private Limited",
  companyLocation: "Ghaziabad, Uttar Pradesh, India",
  filename: "Power Traverse White Paper 2026-06-19 REV01.docx",
  coverStyle: "light",
};

// ============================================================
// BRAND CONSTANTS
// ============================================================

const FONT = "Latin Modern Roman";
const FONT_BOLD = "Latin Modern Roman";
const COLOR = {
  primary:  "1B3A5C",  // Navy
  accent:   "2E75B6",  // Steel blue
  accent2:  "C45911",  // Warm amber
  light:    "D6E4F0",  // Pale blue
  lighter:  "EDF2F8",  // Very pale blue
  text:     "1A1A1A",  // Near black
  gray:     "666666",  // Secondary
  white:    "FFFFFF",
  dark:     "0D1B2A",
};

const PAGE_W = 12240;
const PAGE_H = 15840;
const MARGIN = 1440;
const CONTENT_W = PAGE_W - 2 * MARGIN;

// ============================================================
// BORDER PRESETS
// ============================================================

const thinBorder = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };
const noBorder = { style: BorderStyle.NONE, size: 0 };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

// ============================================================
// HELPERS
// ============================================================

function emptyLine(spacing = { before: 0, after: 120 }) {
  return new Paragraph({ spacing, children: [] });
}

function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 200 },
    keepNext: true,
    children: [new TextRun({ text, font: FONT, size: 32, bold: true, color: COLOR.primary })],
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 160 },
    keepNext: true,
    children: [new TextRun({ text, font: FONT, size: 26, bold: true, color: COLOR.accent })],
  });
}

function heading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 120 },
    keepNext: true,
    children: [new TextRun({ text, font: FONT, size: 22, bold: true, color: COLOR.primary })],
  });
}

function bodyText(text, opts = {}) {
  const { bold = false, italic = false, size = 21, alignment = AlignmentType.JUSTIFIED } = opts;
  return new Paragraph({
    alignment,
    spacing: { before: 80, after: 80, line: 276 },
    children: [new TextRun({ text, font: FONT, size, bold, italics: italic, color: COLOR.text })],
  });
}

function bodyRuns(runs, opts = {}) {
  const { alignment = AlignmentType.JUSTIFIED, spacing = { before: 80, after: 80, line: 276 } } = opts;
  return new Paragraph({
    alignment,
    spacing,
    children: runs.map(r => new TextRun({
      text: r.text,
      font: FONT,
      size: r.size || 21,
      bold: r.bold || false,
      italics: r.italic || false,
      color: r.color || COLOR.text,
    })),
  });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function keyTakeaways(text) {
  return [
    new Paragraph({
      spacing: { before: 200, after: 60 },
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: COLOR.accent, space: 4 } },
      children: [new TextRun({ text: "KEY TAKEAWAYS", font: FONT, size: 19, bold: true, color: COLOR.accent })],
    }),
    new Paragraph({
      spacing: { before: 40, after: 200 },
      indent: { left: 200 },
      children: [new TextRun({ text, font: FONT, size: 20, italics: true, color: COLOR.gray })],
    }),
  ];
}

function tableCell(text, width, opts = {}) {
  const {
    bold = false, color = COLOR.text, fill = null,
    fontSize = 18, alignment = AlignmentType.LEFT, colSpan,
  } = opts;
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: fill ? { fill, type: ShadingType.CLEAR } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    verticalAlign: VerticalAlign.CENTER,
    columnSpan: colSpan,
    children: [
      new Paragraph({
        alignment,
        spacing: { before: 20, after: 20 },
        children: [new TextRun({ text, font: FONT, size: fontSize, bold, color })],
      }),
    ],
  });
}

function makeTable(headers, data, colWidths, opts = {}) {
  const { headerFontSize = 16, dataFontSize = 16 } = opts;
  return new Table({
    width: { size: colWidths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [
      new TableRow({
        children: headers.map((h, i) =>
          tableCell(h, colWidths[i], { bold: true, fill: COLOR.primary, color: COLOR.white, fontSize: headerFontSize })
        ),
      }),
      ...data.map((row, ri) =>
        new TableRow({
          children: row.map((c, ci) =>
            tableCell(c, colWidths[ci], {
              bold: ci === 0,
              fill: ri % 2 === 0 ? COLOR.lighter : COLOR.white,
              fontSize: dataFontSize,
            })
          ),
        })
      ),
    ],
  });
}

function figure(figNum, caption, prompt, imagePath = null) {
  let hasImage = false;
  let imgData;
  if (imagePath) {
    try {
      imgData = fs.readFileSync(imagePath);
      hasImage = imgData.length > 1000;
    } catch (e) {
      hasImage = false;
    }
  }

  const elements = [emptyLine({ before: 240, after: 0 })];

  if (hasImage) {
    elements.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 120, after: 80 },
        children: [
          new ImageRun({
            type: "png",
            data: imgData,
            transformation: { width: 580, height: 380 },
            altText: { title: caption, description: `Figure ${figNum}: ${caption}`, name: `fig_${figNum}` },
          }),
        ],
      })
    );
  } else {
    elements.push(
      new Table({
        width: { size: CONTENT_W, type: WidthType.DXA },
        columnWidths: [CONTENT_W],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders: {
                  top: { style: BorderStyle.DASHED, size: 2, color: COLOR.accent },
                  bottom: { style: BorderStyle.DASHED, size: 2, color: COLOR.accent },
                  left: { style: BorderStyle.DASHED, size: 2, color: COLOR.accent },
                  right: { style: BorderStyle.DASHED, size: 2, color: COLOR.accent },
                },
                width: { size: CONTENT_W, type: WidthType.DXA },
                shading: { fill: COLOR.lighter, type: ShadingType.CLEAR },
                margins: { top: 300, bottom: 300, left: 300, right: 300 },
                verticalAlign: VerticalAlign.CENTER,
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({ text: `[FIGURE ${figNum} PLACEHOLDER]`, font: FONT, size: 24, bold: true, color: COLOR.accent }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      })
    );
  }

  elements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 80, after: 200 },
      children: [
        new TextRun({ text: `Figure ${figNum}. `, font: FONT, size: 19, bold: true, color: COLOR.primary }),
        new TextRun({ text: caption, font: FONT, size: 19, italics: true, color: COLOR.text }),
      ],
    })
  );

  return elements;
}

// ============================================================
// COVER PAGE
// ============================================================

function buildCoverSection() {
  const logoPath = __dirname + "/assets/logo.png";
  let hasLogo = false;
  try { hasLogo = fs.existsSync(logoPath) && fs.statSync(logoPath).size > 100; } catch (e) {}

  const children = [
    emptyLine({ before: 2400, after: 0 }),
  ];

  if (hasLogo) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 200 },
      children: [
        new ImageRun({
          type: "png", data: fs.readFileSync(logoPath),
          transformation: { width: 100, height: 108 },
          altText: { title: "INSPIN Logo", description: "Company logo", name: "Logo" },
        }),
      ],
    }));
  }

  // Company wordmark
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { before: 100, after: 300 },
    children: [new TextRun({ text: "I N S P I N   P R I V A T E   L I M I T E D", font: FONT, size: 18, bold: true, color: COLOR.accent, characterSpacing: 100 })],
  }));

  // Accent line
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { before: 200, after: 300 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 3, color: COLOR.accent, space: 1 } },
    children: [],
  }));

  // Title
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { before: 300, after: 120 },
    children: [new TextRun({ text: REPORT_META.displayTitle.toUpperCase(), font: FONT, size: 48, bold: true, color: COLOR.primary })],
  }));

  // Subtitle
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 },
    children: [new TextRun({ text: REPORT_META.subtitle, font: FONT, size: 24, color: COLOR.gray })],
  }));

  // Document type
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { before: 300, after: 0 },
    children: [new TextRun({ text: "WHITE PAPER", font: FONT, size: 20, bold: true, color: COLOR.gray, characterSpacing: 200 })],
  }));

  // Accent line
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { before: 400, after: 400 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 3, color: COLOR.accent, space: 1 } },
    children: [],
  }));

  // Company (no author name)
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { before: 200, after: 40 },
    children: [new TextRun({ text: REPORT_META.company, font: FONT, size: 20, color: COLOR.gray })],
  }));
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { before: 0, after: 40 },
    children: [new TextRun({ text: REPORT_META.companyLocation, font: FONT, size: 18, color: COLOR.gray })],
  }));

  // Date
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { before: 400, after: 0 },
    children: [new TextRun({ text: REPORT_META.date, font: FONT, size: 18, color: COLOR.gray, characterSpacing: 200 })],
  }));

  // Classification
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { before: 800, after: 0 },
    children: [new TextRun({ text: "CONFIDENTIAL", font: FONT, size: 16, bold: true, color: COLOR.accent2, characterSpacing: 300 })],
  }));

  return {
    properties: {
      page: { size: { width: PAGE_W, height: PAGE_H }, margin: { top: 2160, right: 1440, bottom: 1440, left: 1440 } },
    },
    children,
  };
}

// ============================================================
// CONTENT BUILDER
// ============================================================

function buildContent() {
  const figDir = __dirname + "/figures/";
  const figPath = (n) => {
    const p = figDir + `fig_${n}.png`;
    return fs.existsSync(p) ? p : null;
  };

  return [
    // Table of Contents
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 100, after: 300 },
      children: [new TextRun({ text: "Table of Contents", font: FONT, size: 32, bold: true, color: COLOR.primary })],
    }),
    new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-3" }),
    pageBreak(),

    // ================================================================
    // SECTION 1: Introduction and Problem Statement
    // ================================================================
    heading1("1  Introduction and Problem Statement"),

    bodyText(
      "The Indian Army operates a substantial fleet of main battle tanks whose legacy hydraulic power traverse drives " +
      "are approaching end of life. Sustaining these systems has become increasingly difficult as spare parts dwindle " +
      "and overhaul depots face capacity constraints. The hydraulic actuator, while proven in service over several decades, " +
      "presents fundamental limitations in positional accuracy, response bandwidth, and maintainability that are incompatible " +
      "with the precision engagement requirements of modern armoured warfare."
    ),

    bodyText(
      "This white paper presents the design of an indigenous, electrically actuated power traverse drive intended to " +
      "retrofit the existing turret ring mechanical interface. The proposed system replaces the hydraulic actuator with " +
      "a permanent magnet synchronous machine coupled through a planetary reduction gearbox, governed by an adaptive " +
      "control architecture that resolves gunner assist and gun stabilization as two coupled but distinct control " +
      "subsystems sharing a single physical actuator."
    ),

    bodyText(
      "The architecture closes a stable position loop on a learned inverse driver intent estimate rather than attempting " +
      "to regulate the operator torque, which is fundamentally an exogenous and uncontrollable input to the plant. " +
      "Disturbance rejection is performed through a sensor fused observer that combines the hull rate gyro and the turret " +
      "absolute encoder with a model augmented Kalman residual, driving a multi mode resonant compensator tuned to the " +
      "dominant gun firing recoil resonances and the hull motion bandwidth. A dynamic torque budget allocator with dual " +
      "anti windup unifies the two paths while preserving independent loop stability."
    ),

    bodyText(
      "Motor and gearbox are commodity hardware sourced from indigenous vendors. The defensible intellectual property " +
      "resides entirely in the control kernel and is presently in active patent drafting. The system targets 2 milliradian " +
      "positional accuracy on a turret mass of approximately 13 tonnes across full 360 degree azimuth, with an internally " +
      "parameterized plant model that permits direct retargeting to other armoured fighting vehicles, self propelled " +
      "artillery, naval gun mount stabilization platforms, and electro optical gimbal systems, amortizing the development " +
      "investment across the broader weapons system fleet."
    ),

    ...keyTakeaways(
      "An electrically actuated power traverse drive with adaptive control architecture achieves 2 milliradian positional " +
      "accuracy while enabling fleet wide retargetability through internal model parameterization."
    ),

    pageBreak(),

    // ================================================================
    // SECTION 2: Mechanical Plant Description
    // ================================================================
    heading1("2  Mechanical Plant Description"),

    bodyText(
      "The turret weighs approximately 13 tonnes and rotates about its azimuth axis through a ball race bearing of " +
      "approximately 1.6 to 2.0 metres in diameter. A pinion meshes with the inner ring gear of the bearing assembly " +
      "and transmits rotational torque from a motor and reduction gearbox installed within the hull. The gunner sits " +
      "inside the turret and commands rotation through a control handle."
    ),

    ...figure(1,
      "Power traverse mechanical hardware schematic showing turret on ball race bearing, motor and reducer " +
      "driving the turret ring pinion, gunner control handle, and sensor placements.",
      "Technical engineering schematic of T-72 tank turret traverse mechanism",
      figPath(1)
    ),

    bodyText(
      "Two principal disturbance sources act on the gun line. The gun firing recoil is high amplitude and concentrated " +
      "in narrow spectral bands at structural resonances in the 10 to 30 hertz range. The hull motion across rough " +
      "terrain is lower amplitude and broadband, spanning the frequency range from sub hertz terrain undulations to " +
      "several hertz suspension dynamics."
    ),

    heading2("2.1  Two Mass Plant Model"),

    bodyText(
      "The plant is approximated by a two mass model linking the motor inertia to the turret inertia through a " +
      "compliant reducer coupling. In the rigid coupling limit, which is appropriate for the bandwidth of interest, " +
      "the load equation of motion relates the reflected turret inertia, the viscous damping coefficient, and the " +
      "bearing friction characteristic on one side to the gear reduced motor torque, the operator induced torque " +
      "transmitted through the gunner control handle, and the external disturbance composed of gun firing recoil " +
      "and hull induced motion on the other."
    ),

    bodyText(
      "The bearing friction characteristic exhibits nonlinear breakaway behaviour that exceeds the bandwidth of " +
      "standard Coulomb models, necessitating a dedicated Stribeck friction model with data driven adaptation " +
      "within the compensation layer of the control architecture. The gear backlash in the pinion ring gear mesh " +
      "introduces a dead zone nonlinearity that must be compensated to achieve the target positional accuracy."
    ),

    ...keyTakeaways(
      "The mechanical plant presents coupled nonlinearities in bearing friction, gear backlash, and structural " +
      "compliance that demand a model based compensation strategy beyond conventional linear control."
    ),

    pageBreak(),

    // ================================================================
    // SECTION 3: Control Architecture
    // ================================================================
    heading1("3  Control Architecture"),

    bodyText(
      "The proposed control architecture comprises four functional layers organized around two coupled control " +
      "objectives sharing a single physical actuator. The controller partitions into a gunner assist path and a " +
      "disturbance rejection path, each generating an independent torque demand. A torque budget allocator merges " +
      "these demands within the instantaneous torque envelope of the permanent magnet synchronous machine. Three " +
      "of the four layers contain principal novel architectural elements that constitute the defensible intellectual " +
      "property of the proposed work."
    ),

    ...figure(2,
      "Unified power traverse stabilization architecture. Path 1 is the gunner assist subsystem; " +
      "Path 2 is the disturbance rejection subsystem; the two paths are unified through a dynamic torque " +
      "budget allocator with dual anti windup.",
      "Control system block diagram showing the complete four-layer architecture",
      figPath(2)
    ),

    // Layer 1
    heading2("3.1  Inverse Operator Intent Inference"),

    bodyText(
      "The first functional layer performs operator intent inference and gunner assist. A driver torque observer " +
      "estimates the gunner applied torque from the handle torque sensor and the motor resolver using a Kalman " +
      "observer constructed over a five state augmented plant model. An inverse intent map, instantiated as a " +
      "neural network or a low order regressor with bounded output, transforms the estimated gunner torque into " +
      "a hypothetical commanded angle."
    ),

    bodyText(
      "An offline adaptation layer updates the parameters of the inverse map as steady state and dynamic " +
      "correlations are observed, without affecting instantaneous control. A stable proportional integral " +
      "derivative regulator closes the loop on the angle error between the inferred command and the measured " +
      "turret azimuth, generating the gunner assist motor torque."
    ),

    bodyText(
      "The control theoretic principle underlying this layer is that the gunner torque is an exogenous, " +
      "uncontrollable input to the plant, and that closed loop regulation must therefore act on a controllable " +
      "effect, namely the load angle, rather than on an uncontrollable cause. This formulation is a departure " +
      "from the conventional approach in the literature, which attempts to regulate the operator torque directly " +
      "and suffers from instability under aggressive manual inputs."
    ),

    ...figure(3,
      "Operator intent inference layer showing the torque observer, the learned inverse intent map with offline " +
      "adaptation, and the stable angle loop closure that generates the gunner assist torque.",
      "Block diagram of Layer 1: operator intent inference and gunner assist",
      figPath(3)
    ),

    // Layer 2
    heading2("3.2  Model Augmented Sensor Fusion and Disturbance Rejection"),

    bodyText(
      "The second functional layer performs disturbance estimation and rejection. The high bandwidth hull rate " +
      "gyro and the lower bandwidth turret absolute encoder are fused through a complementary filter, with a " +
      "high pass characteristic on the gyro and a low pass characteristic on the encoder, and are augmented by " +
      "a Kalman observer that exploits the two mass plant model. The fused output is a broadband estimate of " +
      "the disturbance angle deviation."
    ),

    bodyText(
      "The reference for this disturbance subsystem is identically zero. The error drives a multi mode resonant " +
      "compensator with poles tuned to the dominant gun firing recoil resonances and to the hull motion bandwidth. " +
      "A proportional integral compensator alone would be inadequate because the disturbance content is concentrated " +
      "in narrow bands and a generic compensator cannot suppress narrow band content without sacrificing low frequency " +
      "response or compromising outer loop stability."
    ),

    ...figure(4,
      "Sensor fusion and disturbance rejection layer showing the hull rate gyro and turret absolute encoder " +
      "fusion, the model augmented Kalman observer, and the multi mode resonant compensator that produces " +
      "the stabilization torque.",
      "Block diagram of Layer 2: sensor fusion and disturbance rejection",
      figPath(4)
    ),

    // Layer 3
    heading2("3.3  Parametric Friction and Backlash Compensation"),

    bodyText(
      "The third functional layer performs friction and backlash compensation. An internal plant model captures " +
      "the two mass dynamics of the motor, gearbox, and turret chain, including the dominant Coulomb and viscous " +
      "friction of the ball race bearing and the gear backlash. The friction model follows a Stribeck " +
      "characteristic that captures the velocity dependent transition between static and kinetic friction regimes, " +
      "with data driven parameter adaptation that refines the model coefficients during operation."
    ),

    bodyText(
      "Model based feedforward generates a compensation torque that nulls the known nonlinearities before the " +
      "feedback loops close. The compensator is parameterized so that the same code base can be retargeted to " +
      "other turret platforms by re identifying the plant parameters, a capability that is central to the fleet " +
      "wide amortization strategy described in Section 5."
    ),

    // Layer 4
    heading2("3.4  Dynamic Torque Budget Allocator with Dual Anti Windup"),

    bodyText(
      "The fourth functional layer performs dynamic torque budgeting and dual anti windup. The total motor " +
      "torque command combines the gunner assist contribution, the stabilization contribution, and the friction " +
      "and backlash feedforward, all bounded by the instantaneous permanent magnet synchronous machine torque " +
      "envelope."
    ),

    bodyText(
      "A dynamic saturation allocator splits the available envelope between the gunner assist path and the " +
      "stabilization path in real time, prioritizing stabilization during gun firing transients and gunner " +
      "assist during steady tracking. A dual anti windup mechanism feeds the difference between the unsaturated " +
      "and saturated commands back to both path integrators independently, ensuring closed loop stability of " +
      "both paths under any saturation event, including events caused by mutual competition for the torque envelope."
    ),

    ...figure(5,
      "Dynamic torque budget allocator showing the saturation block and dual anti windup feedback " +
      "to both path integrators.",
      "Block diagram of Layer 4: dynamic torque budget allocation",
      figPath(5)
    ),

    ...keyTakeaways(
      "The control architecture resolves the fundamental conflict between gunner assist and gun stabilization " +
      "through a torque budget allocator that preserves independent loop stability under all saturation conditions, " +
      "while a learned inverse intent map replaces the conventional and unstable direct torque regulation approach."
    ),

    pageBreak(),

    // ================================================================
    // SECTION 4: Innovation and Intellectual Property Position
    // ================================================================
    heading1("4  Innovation and Intellectual Property Position"),

    bodyText(
      "The proposed solution introduces several architectural innovations over the legacy hydraulic traverse " +
      "drive and over the standard motion control formulations available in the published literature. Indian " +
      "provisional patent applications on each of the four elements described below are presently in active drafting."
    ),

    heading2("4.1  Novel Architectural Elements"),

    heading3("4.1.1  Inverse Operator Intent Inference"),
    bodyText(
      "Closed loop position regulation on an inferred operator commanded angle, derived through a learned " +
      "inverse intent map from the operator torque estimate, in place of the conventional formulation that " +
      "attempts to regulate the operator torque itself. This approach eliminates the fundamental stability " +
      "limitation of direct torque regulation under aggressive manual inputs."
    ),

    heading3("4.1.2  Model Augmented Sensor Fusion Observer"),
    bodyText(
      "A sensor fusion observer that combines the hull rate gyro and the turret absolute encoder with a " +
      "Kalman residual driven by the two mass plant model, providing a broadband disturbance angle estimate " +
      "without sacrificing low frequency accuracy. The model augmentation exploits known plant dynamics to " +
      "extend the effective bandwidth of the observer beyond what either sensor can achieve independently."
    ),

    heading3("4.1.3  Multi Mode Resonant Compensator"),
    bodyText(
      "A resonant compensator with poles tuned to the dominant gun firing recoil resonances and to the hull " +
      "motion bandwidth, achieving narrow band suppression while preserving outer loop stability margins. " +
      "This is distinct from conventional proportional integral disturbance rejection, which cannot suppress " +
      "narrow band disturbance content without compromising broadband response."
    ),

    heading3("4.1.4  Dynamic Torque Budget Allocator with Dual Anti Windup"),
    bodyText(
      "A torque budget allocator with dual anti windup that resolves the actuator sharing problem between " +
      "two coupled feedback loops while preserving independent loop stability under all saturation events. " +
      "The dual anti windup structure ensures that saturation in one path does not destabilize the other, " +
      "a property that is not guaranteed by conventional single channel anti windup designs."
    ),

    heading2("4.2  Portfolio Level Innovation: Internal Model Parameterization"),

    bodyText(
      "A portfolio level innovation arises from the internal model parameterization of the entire control " +
      "kernel, which permits direct retargeting of the same software to other armoured fighting vehicle turrets, " +
      "self propelled artillery, towed gun mounts, naval gun mounts, and surface launcher stabilization platforms " +
      "by re identification of plant parameters alone. This amortizes the development investment across the " +
      "broader weapons system fleet."
    ),

    ...figure(6,
      "Retargetability concept showing the parameterized control kernel adapted to multiple platform classes " +
      "through three parameter sets: inertia and friction, disturbance spectrum, and torque envelope.",
      "Diagram showing control kernel retargetability across platforms",
      figPath(6)
    ),

    bodyText(
      "Three parameter sets govern the retargeting: the inertia and friction parameters that characterize " +
      "the mechanical plant, the disturbance spectrum parameters that capture the dominant recoil and platform " +
      "motion frequencies, and the torque envelope parameters that define the actuator capacity. Re identification " +
      "of these three sets adapts the entire control kernel to a new platform without modification of the " +
      "control structure or the software architecture."
    ),

    heading2("4.3  Prior Intellectual Property Portfolio"),

    bodyText(
      "The proposed work builds on an extensive prior intellectual property portfolio in structurally analogous " +
      "motion control domains, with representative patent families spanning United States, European, German, and " +
      "Chinese jurisdictions. These prior inventions in cascaded position control architecture, disturbance " +
      "feedforward and observer design, torque ripple compensation, dynamic decoupling, and anti windup compensator " +
      "design each map directly onto a layer of the proposed architecture, providing a proven foundation for the " +
      "novel extensions described in this paper."
    ),

    makeTable(
      ["Control Layer", "Prior IP Domain", "Representative Patents"],
      [
        ["Operator intent inference", "Cascaded position control for steering", "US 11,203,379 B2; DE 102019108996 B4; CN 110341785 B"],
        ["Disturbance estimation and rejection", "Disturbance feedforward and observer design", "US 11,180,186 B2; US 10,340,828 B2; US 11,515,813 B2"],
        ["Friction and backlash compensation", "Rack force estimation and plant identification", "US 12,054,204 B2; DE 102019118831 A1"],
        ["Dynamic torque budgeting", "Anti windup compensator design", "US 10,773,748 B2; US 11,177,752 B2; US 10,411,634 B2"],
      ],
      [2200, 3200, 3960]
    ),

    emptyLine(),

    ...keyTakeaways(
      "Four novel architectural elements, each subject to active patent drafting, are supported by an extensive " +
      "prior IP portfolio in structurally analogous motion control domains. Internal model parameterization enables " +
      "fleet wide deployment from a single control kernel."
    ),

    pageBreak(),

    // ================================================================
    // SECTION 5: Implementation Feasibility and Risk Mitigation
    // ================================================================
    heading1("5  Implementation Feasibility and Risk Mitigation"),

    heading2("5.1  Hardware Strategy"),

    bodyText(
      "Motor and reduction gearbox are commodity hardware sourced from indigenous vendors with established " +
      "defence supply track records. The permanent magnet synchronous machine provides the high torque density " +
      "and precise controllability required for the application, while the planetary gearbox delivers the " +
      "necessary torque multiplication at the pinion interface. Drive electronics, embedded controller, and " +
      "sensor interface boards are designed and manufactured indigenously."
    ),

    heading2("5.2  Development Approach"),

    bodyText(
      "Bench validation precedes physical turret access, decoupling controller development from platform " +
      "availability and reducing schedule risk. A bench friction emulator replicates the turret relevant dynamics, " +
      "allowing the bulk of controller development to proceed in parallel with turret availability. The " +
      "qualification programme employs accredited laboratories for MIL STD 810 environmental and MIL STD 461 " +
      "electromagnetic interference testing."
    ),

    heading2("5.3  Risk Register"),

    makeTable(
      ["Risk", "Impact", "Mitigation Strategy"],
      [
        [
          "Nonlinear bearing friction",
          "Positional accuracy degradation",
          "Dedicated bench friction emulator and data driven friction model fallback within the compensation layer"
        ],
        [
          "Recoil spectral content above compensator bandwidth",
          "Residual stabilization error",
          "Pre fire feedforward signal channel and observer based residual rejection within the disturbance layer"
        ],
        [
          "Supply chain qualification gaps",
          "Schedule and quality risk",
          "Two vendor sourcing strategy and bench qualification of vendor candidates during Phase 1"
        ],
        [
          "MIL STD qualification first pass failure",
          "Schedule extension",
          "Early thermal and shock pre testing and design margins set at 1.5 times specification"
        ],
        [
          "Turret access schedule slip",
          "Integration delay",
          "Bench rig replicates turret relevant dynamics; controller development proceeds in parallel"
        ],
      ],
      [2400, 2400, 4560]
    ),

    emptyLine(),

    heading2("5.4  Retargetability and Fleet Wide Deployment"),

    bodyText(
      "The internal parameterization of the control kernel enables retargeting to multiple platform classes. " +
      "Target platforms include main battle tanks of various types, infantry fighting vehicles, self propelled " +
      "artillery systems and their successors, towed gun mounts, naval gun mounts, surface to air launcher " +
      "stabilization platforms, and electro optical and radar gimbal stabilization systems. The same architecture " +
      "applies wherever precision azimuth or elevation control is required under recoil, platform motion, and " +
      "aerodynamic disturbances."
    ),

    ...figure(7,
      "Platform retargetability matrix showing the three parameter sets (inertia and friction, disturbance spectrum, " +
      "torque envelope) adapted across armoured vehicles, artillery, naval, and surveillance platform classes.",
      "Matrix diagram showing retargetability across multiple defence platforms",
      figPath(7)
    ),

    ...keyTakeaways(
      "A commodity hardware strategy with indigenous sourcing, a bench first development approach that " +
      "decouples from platform availability, and five identified risk mitigations provide confidence in " +
      "the feasibility of the proposed system across multiple platform classes."
    ),

    pageBreak(),

    // ================================================================
    // SECTION 6: Principal Investigator Credentials
    // ================================================================
    heading1("6  Principal Investigator Credentials"),

    bodyRuns([
      { text: "Principal Investigator: ", bold: true },
      { text: "Prerit Pramod" },
    ]),

    bodyRuns([
      { text: "Organization: ", bold: true },
      { text: "INSPIN Private Limited, Ghaziabad, Uttar Pradesh, India" },
    ]),

    emptyLine(),

    heading2("6.1  Operational Experience"),

    bodyText(
      "Over a decade of safety critical electric motion control product development across electric power " +
      "steering, steer by wire, advanced driver assistance systems, autonomous vehicle LiDAR perception, and " +
      "electric motor drive research and development, covering plant modelling, control design, embedded software, " +
      "and intellectual property generation across the same class of servo control problem represented by the " +
      "power traverse stabilization problem."
    ),

    heading2("6.2  Intellectual Property Portfolio"),

    bodyText(
      "An extensive portfolio of intellectual property artefacts including granted patents across the United States, " +
      "Europe, Germany, and China, with additional patents pending worldwide, defensive publications, and formal " +
      "trade secrets, commercialized on production vehicle programmes for major automotive manufacturers. The " +
      "portfolio includes directly relevant inventions in cascaded position control architecture, disturbance " +
      "feedforward, disturbance observers, multi mode torque ripple compensation, dynamic decoupling, anti windup " +
      "compensator design, multi phase synchronous motor drives, and rack force estimation, each of which maps " +
      "directly onto a layer of the proposed architecture."
    ),

    heading2("6.3  Academic and Research Linkage"),

    bodyText(
      "Doctoral committee advisor at North Carolina State University on rare earth free biaxial excitation " +
      "synchronous machines, providing direct connection to academic research on indigenous motor design " +
      "relevant to the supply chain strategy. Published technical papers in IEEE and SAE conferences and " +
      "journals with substantial citations from researchers across multiple continents."
    ),

    heading2("6.4  Professional Standing"),

    bodyText(
      "IEEE Senior Member. Associate Editor of the IEEE Transactions on Industry Applications (Industrial " +
      "Drives Committee). Handling Editor at SAE International. Topic and session chair for international " +
      "conferences in transportation electrification. Prior roles spanning engineering management, advanced " +
      "engineering organization leadership, and electric motor drives research and development group creation " +
      "at major automotive technology companies."
    ),

    pageBreak(),

    // ================================================================
    // APPENDIX A
    // ================================================================
    heading1("Appendix A  Invention Disclosure: Inverse Operator Intent Inference"),

    heading2("A.1  Problem Statement"),
    bodyText(
      "Conventional power traverse systems attempt to regulate the operator torque directly, treating it as " +
      "a controllable setpoint. This formulation is fundamentally flawed because the operator torque is an " +
      "exogenous input to the plant and cannot be controlled by the feedback system. Aggressive manual inputs " +
      "drive the conventional regulator into instability, a well documented limitation in the published literature " +
      "on manual human machine interfaces for heavy rotating loads."
    ),

    heading2("A.2  Proposed Solution"),
    bodyText(
      "The invention replaces direct torque regulation with closed loop position regulation on an inferred " +
      "operator commanded angle. A Kalman observer constructed over a five state augmented plant model estimates " +
      "the gunner applied torque. A learned inverse intent map, instantiated as a neural network or low order " +
      "regressor with bounded output, transforms the estimated torque into a hypothetical commanded angle. " +
      "A stable proportional integral derivative regulator closes the loop on the angle error."
    ),

    heading2("A.3  Novelty"),
    bodyText(
      "The key novelty is the inversion of the conventional control formulation: instead of regulating an " +
      "uncontrollable cause (operator torque), the system regulates a controllable effect (load angle). The " +
      "offline adaptation of the inverse map parameters ensures that the mapping accuracy improves over time " +
      "without affecting instantaneous control stability."
    ),

    pageBreak(),

    // ================================================================
    // APPENDIX B
    // ================================================================
    heading1("Appendix B  Invention Disclosure: Model Augmented Sensor Fusion Observer"),

    heading2("B.1  Problem Statement"),
    bodyText(
      "The hull rate gyro provides high bandwidth disturbance information but drifts at low frequencies. " +
      "The turret absolute encoder provides accurate low frequency position information but is bandwidth " +
      "limited. Neither sensor alone provides a broadband disturbance estimate suitable for high performance " +
      "stabilization."
    ),

    heading2("B.2  Proposed Solution"),
    bodyText(
      "The invention fuses the hull rate gyro and turret absolute encoder through a complementary filter " +
      "augmented by a Kalman observer that exploits the two mass plant model. The high pass characteristic " +
      "on the gyro extracts its high bandwidth content; the low pass characteristic on the encoder provides " +
      "the low frequency anchor. The Kalman residual, driven by the plant model prediction error, extends the " +
      "effective bandwidth beyond what either sensor achieves independently."
    ),

    heading2("B.3  Novelty"),
    bodyText(
      "The novelty lies in the model augmentation of the complementary filter with the two mass plant model " +
      "Kalman residual, which provides a broadband disturbance angle estimate that is not achievable through " +
      "conventional complementary filtering alone. The plant model exploits known dynamics to fill the " +
      "information gap between the gyro high frequency content and the encoder low frequency anchor."
    ),

    pageBreak(),

    // ================================================================
    // APPENDIX C
    // ================================================================
    heading1("Appendix C  Invention Disclosure: Multi Mode Resonant Compensator"),

    heading2("C.1  Problem Statement"),
    bodyText(
      "Gun firing recoil produces high amplitude disturbance concentrated in narrow spectral bands at structural " +
      "resonances. Hull motion produces broadband disturbance at lower amplitudes. A conventional proportional " +
      "integral compensator cannot suppress the narrow band recoil content without sacrificing low frequency " +
      "response or compromising outer loop stability."
    ),

    heading2("C.2  Proposed Solution"),
    bodyText(
      "The invention introduces a multi mode resonant compensator with poles tuned to the dominant gun firing " +
      "recoil resonances (in the 10 to 30 hertz range) and to the hull motion bandwidth. Each resonant mode " +
      "provides infinite gain at its tuned frequency, achieving complete rejection of sinusoidal disturbance " +
      "at that frequency without requiring high gain at other frequencies."
    ),

    heading2("C.3  Novelty"),
    bodyText(
      "The novelty lies in the application of multi mode resonant compensation to the armoured vehicle gun " +
      "stabilization problem, with simultaneous tuning to both the narrow band recoil resonances and the " +
      "broadband hull motion spectrum, preserving outer loop stability margins throughout. The combination " +
      "of resonant poles with the model augmented observer of Appendix B provides a rejection bandwidth that " +
      "is not achievable by either technique independently."
    ),

    pageBreak(),

    // ================================================================
    // APPENDIX D
    // ================================================================
    heading1("Appendix D  Invention Disclosure: Dynamic Torque Budget Allocator with Dual Anti Windup"),

    heading2("D.1  Problem Statement"),
    bodyText(
      "The gunner assist and stabilization subsystems share a single physical actuator whose torque envelope " +
      "is finite. When both subsystems simultaneously demand torque that exceeds the available envelope, one " +
      "or both must be curtailed. Conventional single channel anti windup designs do not guarantee independent " +
      "loop stability when two coupled feedback paths compete for a shared actuator, and integrator windup in " +
      "one path can destabilize the other."
    ),

    heading2("D.2  Proposed Solution"),
    bodyText(
      "The invention introduces a dynamic saturation allocator that splits the available torque envelope between " +
      "the gunner assist path and the stabilization path in real time, prioritizing stabilization during gun " +
      "firing transients and gunner assist during steady tracking. A dual anti windup mechanism feeds the " +
      "difference between the unsaturated and saturated commands back to both path integrators independently."
    ),

    heading2("D.3  Novelty"),
    bodyText(
      "The key novelty is the dual anti windup structure that ensures closed loop stability of both paths " +
      "under any saturation event, including events caused by mutual competition for the torque envelope. " +
      "The dynamic allocation priority, which shifts between stabilization and assist based on the operating " +
      "regime, is a further novel element that adapts the system behaviour to the tactical context without " +
      "operator intervention."
    ),

    // End
    emptyLine({ before: 600, after: 0 }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 200 },
      border: { top: { style: BorderStyle.SINGLE, size: 3, color: COLOR.accent, space: 8 } },
      children: [],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 0 },
      children: [new TextRun({ text: "End of Document", font: FONT, size: 20, italic: true, color: COLOR.gray })],
    }),
    emptyLine(),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 0 },
      children: [new TextRun({ text: "INSPIN Private Limited  |  Ghaziabad, Uttar Pradesh, India", font: FONT, size: 16, color: COLOR.gray })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 0 },
      children: [new TextRun({ text: "CONFIDENTIAL", font: FONT, size: 14, bold: true, color: COLOR.accent2, characterSpacing: 200 })],
    }),
  ];
}

// ============================================================
// DOCUMENT ASSEMBLY
// ============================================================

const content = buildContent();

const doc = new Document({
  styles: {
    default: { document: { run: { font: FONT, size: 21, color: COLOR.text } } },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: FONT, color: COLOR.primary },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 },
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: FONT, color: COLOR.accent },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 },
      },
      {
        id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 22, bold: true, font: FONT, color: COLOR.primary },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 },
      },
    ],
  },
  sections: [
    buildCoverSection(),
    {
      properties: {
        page: {
          size: { width: PAGE_W, height: PAGE_H },
          margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: "WHITE PAPER", font: FONT, size: 16, bold: true, color: COLOR.primary }),
                new TextRun({ text: "\tCONFIDENTIAL", font: FONT, size: 16, bold: true, color: COLOR.accent2 }),
                new TextRun({ text: "\tJUNE 19, 2026", font: FONT, size: 16, color: COLOR.gray }),
              ],
              tabStops: [
                { type: TabStopType.CENTER, position: Math.round(CONTENT_W / 2) },
                { type: TabStopType.RIGHT, position: CONTENT_W },
              ],
              border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR.accent, space: 4 } },
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              border: { top: { style: BorderStyle.SINGLE, size: 2, color: COLOR.accent, space: 4 } },
              children: [
                new TextRun({ text: "INSPIN PRIVATE LIMITED", font: FONT, size: 14, color: COLOR.gray }),
                new TextRun({ text: "\tGHAZIABAD, UTTAR PRADESH, INDIA", font: FONT, size: 14, color: COLOR.gray }),
                new TextRun({ text: "\tPAGE ", font: FONT, size: 14, color: COLOR.gray }),
                new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 14, color: COLOR.gray }),
                new TextRun({ text: " OF ", font: FONT, size: 14, color: COLOR.gray }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT, size: 14, color: COLOR.gray }),
              ],
              tabStops: [
                { type: TabStopType.CENTER, position: Math.round(CONTENT_W / 2) },
                { type: TabStopType.RIGHT, position: CONTENT_W },
              ],
            }),
          ],
        }),
      },
      children: content,
    },
  ],
});

// Build and write file
Packer.toBuffer(doc).then((buffer) => {
  const outPath = __dirname + "/" + REPORT_META.filename;
  fs.writeFileSync(outPath, buffer);
  console.log(`Document generated: ${outPath} (${(buffer.length / 1024).toFixed(0)} KB)`);
}).catch(err => {
  console.error("Error generating document:", err);
  process.exit(1);
});
