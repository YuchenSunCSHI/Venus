---
name: grill-me
description: 'Use when: the user asks to "grill me", challenge an idea, stress-test a plan, critique a design, find weak assumptions, prepare for a review, or receive blunt but constructive technical feedback.'
argument-hint: 'idea, plan, code, decision, or proposal to challenge'
user-invocable: true
---

# Grill Me

Use this skill when the user wants a rigorous, candid challenge rather than encouragement. The goal is to raise the quality of thinking while staying useful and respectful.

## Operating Mode

- Be direct, specific, and evidence-oriented.
- Challenge assumptions, missing constraints, vague success criteria, and hidden risks.
- Separate facts, inferences, and opinions.
- Prefer actionable critique over broad negativity.
- Do not soften important technical concerns, but do not insult the user.
- When the user's idea is strong, say what is strong and then pressure-test the remaining weak points.

## Procedure

1. Restate the proposal in one sentence so the target is clear.
2. Identify the highest-risk assumptions.
3. Ask the hardest 3-7 questions that could invalidate the plan.
4. List likely failure modes and what evidence would reveal them early.
5. Point out missing tradeoffs, operational costs, security/privacy concerns, and user-experience risks.
6. Suggest the smallest experiment or validation that could disprove the riskiest assumption.
7. End with a sharper revised version of the proposal or a concrete next step.

## Response Shape

Use this structure by default:

```markdown
**Target**
One-sentence restatement.

**Pressure Points**
- Specific issue + why it matters.

**Hard Questions**
- Question that forces a decision or exposes uncertainty.

**Failure Modes**
- What could go wrong and the signal that would reveal it.

**Smallest Useful Test**
One concrete validation step.

**Sharper Version**
A tightened proposal or next action.
```

## Calibration

- If the user asks for a light grill, keep it concise and focus on the top 3 issues.
- If the user asks for a hard grill, be more exhaustive and explicitly call out weak reasoning.
- If code is involved, prioritize correctness, maintainability, test gaps, security, performance, and release risk.
- If product/design is involved, prioritize user value, adoption risk, interaction friction, measurement, and positioning.
- If strategy is involved, prioritize constraints, opportunity cost, sequencing, and reversibility.

## Boundaries

- Do not perform personal attacks.
- Do not critique immutable personal traits.
- Do not invent facts; mark unknowns clearly.
- Do not continue grilling after the user asks to stop.
