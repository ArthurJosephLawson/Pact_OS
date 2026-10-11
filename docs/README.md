# PACT Documentation Index

Welcome to the canonical documentation for **PACT** — a Personal Operating System designed to turn intent into discipline through unbreakable accountability, time-blocked planning, and automated proof-of-work verification.

> 🚀 **Official Production Deployment**: Access the live PACT OS web application at **[https://pact-os.vercel.app](https://pact-os.vercel.app)**
> 🎃 **Hacktoberfest 2026 Documentation Hub**: Canonical open-source specifications, contributor guides, and issue catalogs.

---

## 📚 Core Documentation Directory

```
docs/
├── CI_PIPELINE.md                      # ⚙️ GitHub Actions CI Pipeline & Automated Quality Gates
├── CONTRIBUTING-BEGINNERS.md           # 🌱 Beginner Contributor Zero-to-PR Walkthrough
├── DEPENDENCY_SECURITY.md              # 🛡️ Dependency Health, Security Auditing & Supply-Chain Policy
├── GITHUB_AUTOMATION.md                # 🤖 GitHub Automation, Triage Bot & Policy Engine Architecture
├── GITHUB_BEGINNER_ISSUES.md           # 🎯 Curated Beginner Issue Factory & Master Catalog Index
├── GITHUB_HIGH_IMPACT_ISSUES_187_204.md # 🚀 High-Impact Feature & Growth Issues #187–#204 Catalog (18 Issues)
├── GITHUB_BEGINNER_ISSUES_166_185.md   # 🎃 Curated Hacktoberfest Issues #166–#185 Catalog (20 Issues)
├── GITHUB_BEGINNER_ISSUES_140_164.md   # 🎃 Curated Hacktoberfest Issues Catalog #140–#164
├── GITHUB_BEGINNER_ISSUES_130_138.md   # 🎯 Curated Beginner Issues Catalog #130–#138
├── GITHUB_BEGINNER_ISSUES_107_113.md   # 🎯 Curated Beginner Issues Catalog #107–#113
├── GITHUB_DISCUSSIONS.md               # 💬 Community Discussions, Categories & Contributor Engagement
├── GITHUB_ISSUE_FACTORY.md             # 🏭 Issue Factory Architecture & Search Discovery Guidelines
├── GITHUB_LABELS.md                    # 🏷️ Canonical GitHub Issue Taxonomy & Label Dictionary
├── GITHUB_METADATA.md                  # 🌐 Canonical Repository Topics, Metadata & Discoverability
├── MAINTAINER-HEALTH.md                # 📊 Maintainer Operational Health Dashboard & Governance
├── MAINTAINER-WORKFLOW.md              # Contributor Triage, PR Review & Claim Assignment Runbook
├── CODE_REVIEW_POLICY.md               # ✅ Code Review Criteria, Maintainer SLA & Merge Requirements
├── PACT_MASTER_DOCUMENTATION.md        # 🌟 Comprehensive Central Product & Technical Specification
├── PHASE-16-PUBLICATION-READINESS.md   # 🚀 Phase 16 Publication Readiness & Launch Certification Report
├── PHASE-17-PUBLIC-LAUNCH-CERTIFICATION.md # 📜 Phase 17 Final Public Launch Certification
├── PRODUCT.md                          # Vision, Dual Taglines, Philosophy & User Personas
├── FEATURES.md                         # Inventory of 14 Core Product Systems & Status Matrix
├── ARCHITECTURE.md                     # System Architecture, Tech Stack & Data Flow
├── DATA_MODEL.md                       # Relational Schemas, Constraints, Indexes & RLS
├── INTEGRATIONS.md                     # External Proof Connectors (Google Calendar, GitHub, LeetCode, Codeforces)
├── SECURITY.md                         # Security Matrix, Zero-Trust Boundaries & Sanitization
├── SUPABASE_SECURITY.md                # 🔐 Service Role Key Usage & RLS Policy Best Practices
├── THREAT_MODEL.md                     # 🛡️ Threat Actor Taxonomy, Attack Surfaces & Defense Mitigations
├── DEVELOPMENT.md                      # Local Setup, Development Workflow, Scripts & DB Migrations
├── GIT_WORKFLOW.md                     # Branching, Conventional Commits & Pre-Commit Rules
├── LOCAL_FIRST_STORAGE.md              # 💾 Local-First Persistence, Offline Queue & Sync Architecture
├── RELEASE_MANAGEMENT.md               # 📦 Release Engineering, Semantic Versioning & Changelog Standards
├── ROADMAP.md                          # Current Verified Status & Future Planned Milestones
├── DESIGN_SYSTEM.md                    # Luxury Obsidian Canvas, 3D Celestial Hero & PACT Gold Tokens
├── TESTING.md                          # 56-Suite Automated Test Matrix & Verification Runbook
├── TIMEZONE_GUIDE.md                   # 🌍 Multi-Timezone Setup, UTC Storage & DST Handling
├── TROUBLESHOOTING.md                  # 🔧 Practical Diagnostic Guide for Setup, Build & Git Roadblocks
├── USER_FLOWS.md                       # Core User Workflows & State Lifecycle Transitions
├── DECISIONS.md                        # Architecture Decision Records (ADRs)
├── PRODUCTION_DEPLOYMENT_RUNBOOK.md    # Production Deployment, Environment Variables & Verification
└── archive/                            # Historical Development Phase Reports (Phases 4-6)
    └── README.md                       # Archive Index
```

---

## 🧭 Navigation by Domain

### 1. Product & Strategy
- [**PACT Master Documentation**](./PACT_MASTER_DOCUMENTATION.md): The primary reference covering all systems, data models, and workflows.
- [**Product Vision & Philosophy**](./PRODUCT.md): Dual taglines (*"A System for Keeping Promises to Yourself"* / *"Turn Intent Into Discipline"*), scope rules, and problem definition.
- [**Feature Inventory**](./FEATURES.md): Comprehensive inventory of the 14 integrated modules with implementation status.
- [**User Workflows**](./USER_FLOWS.md): Journey maps for planning, focus sessions, accountability cycles, and weekly reviews.
- [**Roadmap & Implementation Status**](./ROADMAP.md): Current certified milestone status and future architectural directions.

### 2. Engineering & Architecture
- [**System Architecture**](./ARCHITECTURE.md): Next.js 16 App Router structure, Server Actions, state management, and cron infrastructure.
- [**Data Model & Relational Schemas**](./DATA_MODEL.md): Postgres tables, foreign keys, lifecycle constraints, and RLS policies.
- [**Integrations & External Proofs**](./INTEGRATIONS.md): Bi-directional Google Calendar sync, GitHub, LeetCode, and Codeforces connectors.
- [**Security & Zero-Trust Boundaries**](./SECURITY.md): 28-point security checklist, zero-trust server boundaries, and confidential consequence masking.
- [**Supabase Security & RLS**](./SUPABASE_SECURITY.md): Service role vs publishable key, `auth.uid()` RLS policies, and timing-safe cron token protection.
- [**Threat Model Specification**](./THREAT_MODEL.md): Threat actor taxonomy, attack surface analysis, and defense-in-depth security mitigations.
- [**Architecture Decision Records (ADRs)**](./DECISIONS.md): Durable technical choices, trade-offs, and design rationale.
- [**Timezone Guide**](./TIMEZONE_GUIDE.md): UTC ISO 8601 storage, IANA validation, local display, and DST edge cases.
- [**Local-First Data Persistence**](./LOCAL_FIRST_STORAGE.md): Storage tiers, the offline mutation queue, sync engine, delta replication, conflict resolution, and the evidence cache.

### 3. Developer Guide, Community & Operations
- [**Beginner's Contribution Guide**](./CONTRIBUTING-BEGINNERS.md): Zero-to-PR step-by-step tutorial for first-time open-source contributors.
- [**Curated Beginner Issues**](./GITHUB_BEGINNER_ISSUES.md): Master factory of 44 fully specified Good First Issues across all PACT modules ([#107–#113](./GITHUB_BEGINNER_ISSUES_107_113.md), [#130–#138](./GITHUB_BEGINNER_ISSUES_130_138.md)).
- [**Issue Factory Architecture**](./GITHUB_ISSUE_FACTORY.md): 15-part issue specification, SEO discovery rules, and domain search vocabulary.
- [**Community Discussions Guide**](./GITHUB_DISCUSSIONS.md): GitHub Discussions categories, ideas lifecycle, and contributor journey.
- [**GitHub Label Taxonomy**](./GITHUB_LABELS.md): Official issue classification system, difficulty levels, and label composition guide.
- [**GitHub Automation & Bot Architecture**](./GITHUB_AUTOMATION.md): Event-driven triage bot, security model, and lifecycle policies.
- [**GitHub Metadata & Topics**](./GITHUB_METADATA.md): Canonical repository description, topics taxonomy, social preview, and discoverability rules.
- [**Troubleshooting Guide**](./TROUBLESHOOTING.md): Practical diagnostics for Node.js, environment variables, build, port, and Git issues.
- [**Contributing Guide**](../CONTRIBUTING.md): Root guide for opening issues, branching, coding standards, and pull requests.
- [**Code of Conduct**](../CODE_OF_CONDUCT.md): Community participation standards and enforcement guidelines.
- [**Maintainer Operating Workflow**](./MAINTAINER-WORKFLOW.md): Contributor issue triage, PR review checklist, claim management, and release runbook.
- [**Code Review Policy & Maintainer SLA**](./CODE_REVIEW_POLICY.md): First-response targets, review criteria, and merge requirements.
- [**Maintainer Operational Health**](./MAINTAINER-HEALTH.md): Maintainer health metrics, operational governance, triage SLA, and release invariants.
- [**Phase 16 Publication Readiness**](./PHASE-16-PUBLICATION-READINESS.md): Phase 16 publication readiness report, security audits, and deployment verification.
- [**Phase 17 Launch Certification**](./PHASE-17-PUBLIC-LAUNCH-CERTIFICATION.md): Phase 17 final launch certification, quality gate results, and launch readiness.
- [**Security Policy**](../SECURITY.md): Public vulnerability reporting procedure and supported versions.
- [**Support Guide**](../SUPPORT.md): How and where to ask for help, report bugs, or propose features.
- [**Contributors**](../CONTRIBUTORS.md): Recognition of core maintainers and community contributors.
- [**License**](../LICENSE): Official project MIT License.
- [**Changelog**](../CHANGELOG.md): Historical release notes, unreleased progress, and version lineage.
- [**Development Guide**](./DEVELOPMENT.md): Local environment setup, database migrations, package scripts, and development workflows.
- [**Git Workflow & Standards**](./GIT_WORKFLOW.md): Conventional Commit conventions, branch protection rules, and secret prevention hygiene.
- [**Design System & UI Tokens**](./DESIGN_SYSTEM.md): Luxury Obsidian & Gold palette, 3D celestial planetary hero, card geometry, and typography tokens.
- [**Testing & Verification Matrix**](./TESTING.md): 56-suite automated test matrix, execution runbooks, and quality gates.
- [**CI Pipeline & Quality Gates**](./CI_PIPELINE.md): GitHub Actions automated verification, test matrix, secret scans, and build checks.
- [**Dependency Security & Auditing**](./DEPENDENCY_SECURITY.md): Dependency health, CVSS vulnerability gate policy, and Dependabot lifecycle.
- [**Release Management & Versioning**](./RELEASE_MANAGEMENT.md): Semantic Versioning policy, Keep a Changelog governance, and release checklists.
- [**Production Deployment Runbook**](./PRODUCTION_DEPLOYMENT_RUNBOOK.md): Cloud deployment checklist, environment variable matrix, and preflight audit.

### 4. Historical Development Archive
- [**Historical Archive Directory**](./archive/README.md): Preserved completion reports, pre-phase audits, and milestone certification records from Phases 4 through 6.
