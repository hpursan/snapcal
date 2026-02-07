
# Aperioesca – Compact Refactor Prompt (Antigravity-Friendly)

STACK:
- React Native (iOS)
- Gemini models

NOTE:
This prompt has a longer companion document: `aperioesca_full_prompt.md`.
Reference it for deeper context, principles, and edge cases if supported.

---
You are a senior mobile engineer. Refactor this existing repo. First read code, then salvage, then implement.

Goal

Pivot from “calorie tracker” to food-awareness + meal pattern insights app (ad-hoc calibration tool). Working name: Aperioesca.

Non-negotiables

Not a calorie tracker. No daily totals, no “calories remaining”, no streaks, no punishment.

Show Energy Band (very_light/light/moderate/heavy/very_heavy) + Confidence (high/medium/low).

Optional store kcal range, but UI focuses on band + confidence + neutral insight.

Trust strategy:

freeze/cached analysis per meal (don’t recompute old meals)

“Re-analyze” creates a new revision, never overwrites

insights are relative to user baseline (“heavier than your typical lunch”)

Privacy-first:

device-only storage for meals/photos

no login, no email, no personal identity

EXCEPTION: billing/quota needs anonymous install id

generate random UUID on first launch

store in Keychain/Keystore (secure)

attach to AI requests ONLY for quota/billing

not derived from device identifiers

Required screens (keep existing visual style)

A) Capture Meal

camera/gallery reuse

show preview

output: energy band + confidence + one neutral insight line

buttons: “Add to Insights” (save meal), optional “Adjust Details”

B) Weekly Insights (Home)

cards: dinner vs lunch patterns, weekend vs weekday, variance, trend vs last week

simple band chart across days

neutral language

C) Meal History

list with thumbnails + meal type + band + confidence

detail view: frozen analysis + reasoning summary + flags

user feedback: too light/too heavy/not sure

optional re-analyze -> new revision

Data model (local)

MealEntry: id, timestamp, local photo path, meal type, energy band, optional kcal range, confidence, short reasoning, flags, user feedback, model/prompt version, frozen=true, revisions.

AI output (strict JSON)

Return: meal_type, energy_band, kcal_range(min/max optional), confidence, reasoning_summary, flags(mixed_plate, unclear_portions, shared_dish).
Validate strictly. Call AI only when user taps “Add to Insights”.

First steps

Detect stack from repo (SwiftUI/UIKit/Kotlin/Compose/Flutter/RN) and summarize current screens, models, persistence, AI client.

List what can be reused unchanged.

Provide a phased refactor plan.

Implement minimum viable version of A/B/C screens + storage + insights engine + AI parsing + freeze behavior.
