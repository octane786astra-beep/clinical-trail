"""
CLINICAL TRIAL DSL COMPILER
Stages: Lexer → Parser → AST → Semantic Analysis → FDA Compliance Check
"""

import re
from dataclasses import dataclass, field
from typing import Any

# ─────────────────────────────────────────────────────────────────────────────
# TOKEN DEFINITIONS
# ─────────────────────────────────────────────────────────────────────────────
TOKEN_PATTERNS = [
    ("KEYWORD",   r"\b(TRIAL|PATIENT|EXCLUDE|INCLUDE|DURATION|ARMS|SITES|BUDGET|MONITOR)\b"),
    ("OPERATOR",  r"(>=|<=|!=|=|>|<|IN|NOT IN|AND|OR)"),
    ("RANGE",     r"\[\s*\d+\s*,\s*\d+\s*\]"),
    ("NUMBER",    r"\d+(\.\d+)?"),
    ("STRING",    r'"[^"]*"'),
    ("IDENT",     r"[a-zA-Z_][a-zA-Z0-9_]*"),
    ("LBRACE",    r"\{"),
    ("RBRACE",    r"\}"),
    ("COLON",     r":"),
    ("COMMA",     r","),
    ("NEWLINE",   r"\n"),
    ("SKIP",      r"[ \t]+"),
    ("COMMENT",   r"#[^\n]*"),
]

@dataclass
class Token:
    type: str
    value: str
    line: int


# ─────────────────────────────────────────────────────────────────────────────
# LEXER
# ─────────────────────────────────────────────────────────────────────────────
class Lexer:
    def __init__(self, source: str):
        self.source = source
        self.tokens = []
        self.errors = []

    def tokenize(self):
        line = 1
        pos = 0
        master = re.compile("|".join(f"(?P<{name}>{pat})" for name, pat in TOKEN_PATTERNS))
        for m in master.finditer(self.source):
            kind = m.lastgroup
            value = m.group()
            if kind == "NEWLINE":
                line += 1
            elif kind in ("SKIP", "COMMENT"):
                pass
            else:
                self.tokens.append(Token(kind, value, line))
        return self.tokens


# ─────────────────────────────────────────────────────────────────────────────
# AST NODES
# ─────────────────────────────────────────────────────────────────────────────
@dataclass
class TrialNode:
    name: str
    sections: dict = field(default_factory=dict)

@dataclass
class RuleNode:
    field: str
    operator: str
    value: Any

@dataclass
class SectionNode:
    name: str
    rules: list = field(default_factory=list)


# ─────────────────────────────────────────────────────────────────────────────
# PARSER — builds AST from tokens
# ─────────────────────────────────────────────────────────────────────────────
class Parser:
    def __init__(self, tokens):
        self.tokens = tokens
        self.pos = 0
        self.errors = []

    def peek(self):
        if self.pos < len(self.tokens):
            return self.tokens[self.pos]
        return None

    def consume(self, expected_type=None):
        tok = self.peek()
        if tok is None:
            return None
        if expected_type and tok.type != expected_type:
            self.errors.append(f"Line {tok.line}: Expected {expected_type}, got {tok.type} ('{tok.value}')")
            return None
        self.pos += 1
        return tok

    def parse(self):
        """Parse: TRIAL <name> { <sections> }"""
        self.consume("KEYWORD")   # TRIAL
        name_tok = self.consume("IDENT")
        trial_name = name_tok.value if name_tok else "unnamed"
        self.consume("LBRACE")

        sections = {}
        while self.peek() and self.peek().type != "RBRACE":
            section = self.parse_section()
            if section:
                sections[section.name] = section

        self.consume("RBRACE")
        return TrialNode(name=trial_name, sections=sections)

    def parse_section(self):
        """Parse: KEYWORD: rule, rule, ..."""
        kw = self.consume("KEYWORD")
        if not kw:
            self.pos += 1
            return None
        self.consume("COLON")
        rules = self.parse_rules()
        return SectionNode(name=kw.value, rules=rules)

    def parse_rules(self):
        rules = []
        while self.peek() and self.peek().type not in ("KEYWORD", "RBRACE"):
            rule = self.parse_single_rule()
            if rule:
                rules.append(rule)
            if self.peek() and self.peek().type == "COMMA":
                self.consume("COMMA")
        return rules

    def parse_single_rule(self):
        field_tok = self.consume("IDENT")
        if not field_tok:
            return None
        op_tok = self.consume("OPERATOR")
        if not op_tok:
            return None
        val_tok = self.peek()
        if val_tok and val_tok.type in ("NUMBER", "STRING", "RANGE", "IDENT"):
            self.pos += 1
            return RuleNode(field=field_tok.value, operator=op_tok.value, value=val_tok.value)
        return None


# ─────────────────────────────────────────────────────────────────────────────
# SEMANTIC ANALYSIS — logical consistency checks
# ─────────────────────────────────────────────────────────────────────────────
class SemanticAnalyzer:
    def __init__(self, ast: TrialNode):
        self.ast = ast
        self.warnings = []
        self.errors = []

    def analyze(self):
        self._check_required_sections()
        self._check_duration()
        self._check_arms()
        self._check_age_conflict()
        return {"errors": self.errors, "warnings": self.warnings}

    def _check_required_sections(self):
        required = ["PATIENT", "DURATION", "ARMS"]
        for r in required:
            if r not in self.ast.sections:
                self.errors.append(f"MISSING SECTION: '{r}' is required in every trial protocol.")

    def _check_duration(self):
        dur = self.ast.sections.get("DURATION")
        if dur:
            for rule in dur.rules:
                try:
                    months = int(str(rule.value).replace('"','').split()[0])
                    if months > 12:
                        self.warnings.append(
                            f"DURATION WARNING: Trial > 12 months requires interim safety analysis (ICH E6).")
                    if months <= 0:
                        self.errors.append("DURATION ERROR: Duration must be a positive number of months.")
                except:
                    pass

    def _check_arms(self):
        arms = self.ast.sections.get("ARMS")
        if arms and len(arms.rules) == 0:
            self.errors.append("ARMS ERROR: At least 2 arms (e.g. medicine, placebo) must be defined.")

    def _check_age_conflict(self):
        patient = self.ast.sections.get("PATIENT")
        exclude = self.ast.sections.get("EXCLUDE")
        if not patient or not exclude:
            return
        patient_ages = [r for r in patient.rules if r.field == "age"]
        exclude_ages = [r for r in exclude.rules if r.field == "age"]
        if patient_ages and exclude_ages:
            self.warnings.append(
                "AGE CONFLICT WARNING: Age rules exist in both PATIENT and EXCLUDE — verify there is no contradiction.")


# ─────────────────────────────────────────────────────────────────────────────
# FDA COMPLIANCE CHECKER — regulatory rule engine
# ─────────────────────────────────────────────────────────────────────────────
FDA_RULES = [
    {
        "id": "FDA-001",
        "description": "Every trial must have a safety monitoring plan (ICH E6 Section 5.1).",
        "check": lambda ast: "MONITOR" in ast.sections,
        "severity": "ERROR",
    },
    {
        "id": "FDA-002",
        "description": "Trial must define at least one site (ICH E6 Section 4.1).",
        "check": lambda ast: "SITES" in ast.sections,
        "severity": "WARNING",
    },
    {
        "id": "FDA-003",
        "description": "Budget must be declared for regulatory cost accountability (FDA 21 CFR Part 312).",
        "check": lambda ast: "BUDGET" in ast.sections,
        "severity": "WARNING",
    },
    {
        "id": "FDA-004",
        "description": "Trial name must not be empty (FDA 21 CFR Part 312.23).",
        "check": lambda ast: bool(ast.name and ast.name != "unnamed"),
        "severity": "ERROR",
    },
]

class ComplianceChecker:
    def __init__(self, ast: TrialNode):
        self.ast = ast
        self.violations = []
        self.passed = []

    def check(self):
        for rule in FDA_RULES:
            try:
                passed = rule["check"](self.ast)
            except:
                passed = False
            entry = {
                "id": rule["id"],
                "description": rule["description"],
                "severity": rule["severity"],
                "status": "PASS" if passed else "FAIL",
            }
            if passed:
                self.passed.append(entry)
            else:
                self.violations.append(entry)
        return {"violations": self.violations, "passed": self.passed}


# ─────────────────────────────────────────────────────────────────────────────
# MASTER COMPILER — runs all stages
# ─────────────────────────────────────────────────────────────────────────────
def compile_trial(source: str) -> dict:
    # Stage 1: Lex
    lexer = Lexer(source)
    tokens = lexer.tokenize()

    # Stage 2: Parse
    parser = Parser(tokens)
    ast = parser.parse()

    # Stage 3: Semantic Analysis
    semantic = SemanticAnalyzer(ast)
    semantic_result = semantic.analyze()

    # Stage 4: Compliance Check
    compliance = ComplianceChecker(ast)
    compliance_result = compliance.check()

    # Build IR (Intermediate Representation)
    ir = {
        "trial_name": ast.name,
        "sections": {
            name: [{"field": r.field, "operator": r.operator, "value": r.value}
                   for r in sec.rules]
            for name, sec in ast.sections.items()
        }
    }

    all_errors = parser.errors + semantic_result["errors"]
    all_warnings = semantic_result["warnings"]

    return {
        "success": len(all_errors) == 0,
        "trial_name": ast.name,
        "ir": ir,
        "tokens_count": len(tokens),
        "errors": all_errors,
        "warnings": all_warnings,
        "compliance": compliance_result,
        "stages_completed": ["LEXER", "PARSER", "AST", "SEMANTIC_ANALYSIS", "COMPLIANCE_CHECK"],
    }


# ─────────────────────────────────────────────────────────────────────────────
# TEST
# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    sample_dsl = """
    TRIAL diabetes_trial_v1 {
        PATIENT: age IN [40,60], diagnosis = "T2DM"
        EXCLUDE: cardiac_history = true, insulin_dose > 40
        DURATION: months = 18
        ARMS: medicine = "DrugX", placebo = "control"
        MONITOR: safety = true
        BUDGET: amount = 5000000
        SITES: count = 3
    }
    """
    import json
    result = compile_trial(sample_dsl)
    print(json.dumps(result, indent=2))
