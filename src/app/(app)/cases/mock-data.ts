import type { CaseData } from "@/components/case-data-table";

export function generateMockCaseData(): CaseData[] {
  const lawyers = [
    "Sarah Johnson",
    "Michael Chen",
    "Emily Rodriguez",
    "David Thompson",
    "Lisa Anderson",
    "Robert Kim",
    "Jennifer Martinez",
    "Christopher Lee",
  ];

  const clients = [
    "Acme Corporation",
    "Global Industries",
    "Tech Solutions Inc",
    "Metro Holdings",
    "Sunrise Enterprises",
    "Pacific Group",
    "Northern Trust",
    "Eastern Alliance",
    "Western Partners",
    "Central Systems",
    "Alpha Dynamics",
    "Beta Innovations",
  ];

  const caseTitles = [
    "Contract Dispute Resolution",
    "Intellectual Property Infringement",
    "Employment Discrimination Case",
    "Personal Injury Claim",
    "Corporate Merger Review",
    "Real Estate Transaction",
    "Insurance Coverage Dispute",
    "Product Liability Lawsuit",
    "Environmental Compliance Issue",
    "Tax Assessment Appeal",
    "Trademark Registration",
    "Securities Fraud Investigation",
    "Workers Compensation Claim",
    "Breach of Fiduciary Duty",
    "Construction Contract Dispute",
    "Medical Malpractice Case",
    "Antitrust Violation Review",
    "Data Privacy Compliance",
    "Partnership Dissolution",
    "Regulatory Compliance Audit",
  ];

  const descriptions = [
    "Complex litigation involving multiple parties and jurisdictions",
    "Detailed review of contractual obligations and potential breaches",
    "Investigation into alleged violations of federal regulations",
    "Comprehensive analysis of damages and liability issues",
    "Strategic planning for dispute resolution and settlement negotiations",
    "Due diligence review for potential acquisition or merger",
    "Regulatory compliance assessment and remediation planning",
    "Risk assessment and mitigation strategy development",
    "Multi-jurisdictional legal research and case preparation",
    "Settlement negotiations and alternative dispute resolution",
  ];

  const statuses: CaseData["status"][] = [
    "PENDING",
    "IN_PROGRESS",
    "COMPLETED",
    "DISMISSED",
  ];

  const cases: CaseData[] = [];

  for (let i = 0; i < 25; i++) {
    const createdDate = new Date(
      Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
    );
    const updatedDate = new Date(
      createdDate.getTime() +
        Math.random() * (Date.now() - createdDate.getTime())
    );

    cases.push({
      id: `case_${Math.random().toString(36).substr(2, 9)}`,
      title: caseTitles[Math.floor(Math.random() * caseTitles.length)],
      description:
        Math.random() > 0.3
          ? descriptions[Math.floor(Math.random() * descriptions.length)]
          : undefined,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      lawyerId: lawyers[Math.floor(Math.random() * lawyers.length)],
      clientId: clients[Math.floor(Math.random() * clients.length)],
      createdAt: createdDate,
      updatedAt: updatedDate,
    });
  }

  return cases;
}
