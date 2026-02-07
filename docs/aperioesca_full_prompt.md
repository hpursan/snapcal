
# Aperioesca – Full Refactor Prompt (Detailed)

ROLE:
You are a senior mobile engineer and product-minded architect.

STACK CONTEXT (IMPORTANT):
- Platform: iOS
- Framework: React Native
- AI Provider: Google Gemini models

You must inspect the existing repository first and salvage as much of the current implementation as possible.

---
Role: You are a senior mobile engineer + architect. You will refactor my existing food-photo calorie app into an insights-first meal awareness app while salvaging as much of the current code as possible.

Context

I have an existing mobile app repository that currently does (or partially does) this:

capture a food image (camera/gallery)

send it to an AI model for analysis

estimate calories and track against daily/goal calories

We are pivoting.

New product focus (non-negotiable)

This app is not a calorie tracker. It is a food-awareness + meal-pattern insights tool that can be used as an ad-hoc calibration tool (people can use it for a week/month, stop, and return later). It prioritizes:

patterns and insights over totals

trust via transparency (uncertainty ranges + confidence)

no guilt loops (no streaks, no punishment)

local-first privacy

Working name: Aperioesca (placeholder; branding can evolve)

Privacy + identity requirements (non-negotiable)

The app must be privacy-first & local-first:

store meals/photos locally on device

no server accounts / no email / no login

no analytics that uniquely identifies the person

avoid collecting personal data

Billing exception is allowed but must be explicit:

We need a stable way to tie usage to billing / quota for AI requests.

We will use an anonymous install identifier (e.g., random UUID generated on first launch).

Store it in Keychain (iOS) / Keystore or encrypted prefs (Android) so it survives restarts.

The identifier MUST NOT be derived from device identifiers (IMEI/MAC/etc) and must not reveal identity.

The identifier is used ONLY for:

enforcing quotas / rate limiting

associating usage to subscriptions / purchases

If the user deletes the app, the id may reset (acceptable). If you support restore purchases, do it via the platform’s mechanisms (StoreKit/Play Billing), not identity.

The app must clearly communicate:

“Your data stays on your device”

“We use an anonymous identifier only to manage billing and AI usage”

Trust + consistency requirements (non-negotiable)

We rely on AI model calls which may vary over time. To build trust:

Do NOT show a single “exact calories” number as truth.

Primary output should be a stable Energy Band:

very_light, light, moderate, heavy, very_heavy

Optionally store a kcal range in the data model, but UI focuses on band + confidence.

Always show Confidence: high, medium, low.

Cache/freeze analysis results per meal (do not silently recompute old meals).

If “Re-analyze” exists, store a new revision; never overwrite the original.

Insights must be mostly relative to the user’s own baseline (e.g., “heavier than your typical lunch”).

First task: Detect current stack + salvage

Before changing anything:

Inspect repository and identify:

platform: iOS (Swift/SwiftUI/UIKit) / Android (Kotlin/Compose/XML) / React Native / Flutter

navigation approach

camera/gallery implementation

model/API client code (Gemini/OpenAI/etc)

storage (CoreData/Room/SQLite/Files/Prefs)

existing screens & data models

any existing goal tracking logic

Produce a Codebase Salvage Plan:

What stays unchanged (camera, picker, UI theme, networking wrappers, local storage helpers)

What gets removed/retired (daily calories remaining, goal bars, streaks, punitive nudges)

What needs new models and migrations

Required UI screens (match current style)

Keep existing visual style/components. Implement these screens:

Screen A — Capture Meal

Image capture/gallery (reuse)

Image preview

Output:

“Estimated as: Light/Moderate/Heavy meal” (Energy Band label)

“Confidence: High/Medium/Low”

One neutral insight line (relative):

“Heavier than your typical lunch”

“Similar to recent dinners”

Buttons:

Primary: “Add to Insights” (saves the meal)

Secondary: “Adjust Details” (optional)

Screen B — Weekly Insights (Home)

This becomes the primary landing screen.

Cards with neutral pattern insights:

“Dinners were consistently heavier than lunches”

“Weekend meals lighter than weekdays”

“Higher variance midweek”

A simple chart showing energy bands across days (light→heavy)

A short summary line:

“This week was lighter than last week”

No judgment, no warnings.

Screen C — Meal History

List of meals with:

thumbnail

timestamp

meal type (breakfast/lunch/dinner/snack)

energy band

confidence

Meal detail view:

photo

frozen analysis result + reasoning summary

confidence + flags (mixed plate, unclear portions)

user feedback: “Too light / Too heavy / Not sure”

optional “Re-analyze” -> creates a new revision entry

Data model (replace calorie-first tracking)

Implement a new local model:

MealEntry

id (uuid)

created_at timestamp

photo_uri / local_path

meal_type: breakfast/lunch/dinner/snack/unknown

energy_band: very_light/light/moderate/heavy/very_heavy

kcal_range_min / kcal_range_max (optional)

confidence: high/medium/low

reasoning_summary (1–2 lines, user-friendly)

flags: mixed_plate, unclear_portions, shared_dish (booleans)

user_feedback (optional)

model_provider + model_name + model_version (if available)

prompt_version (string)

frozen: true

revisions: optional list (or separate table)

Insights are derived (computed on the fly or cached weekly):

avg band by meal type

weekday vs weekend comparison

variance score by day/time

trend vs previous week

AI integration (must implement structured output)

Create a model prompt that returns strict JSON:
{
"meal_type": "lunch",
"energy_band": "moderate",
"kcal_range": {"min": 500, "max": 750},
"confidence": "medium",
"reasoning_summary": "Mixed plate; portions unclear; likely moderate energy meal.",
"flags": {"mixed_plate": true, "unclear_portions": true, "shared_dish": false}
}

Validate JSON strictly, handle failures gracefully.

Only call AI when user taps “Add to Insights” (not every camera open).

Implement retries/backoff and offline-friendly errors.

Migration (if old data exists)

If existing saved meals have calories/goals:

migrate to energy_band using a configurable mapping rule

mark migrated entries confidence=low and reasoning “Imported from previous version”

do not break existing users’ data

Billing + quotas

Implement AI usage enforcement using anonymous install id:

Generate random UUID on first launch.

Store in secure storage.

Attach this install id to AI requests for quota enforcement + billing reconciliation.

Do NOT store meal photos remotely.

If you have subscription/purchase flows already, reuse them; otherwise stub out.

Deliverables

Codebase audit summary (what exists now)

Salvage/refactor plan (phased)

Implementation (models, storage, screens, AI parsing, caching/freeze, insights engine)

Minimal test plan (model parsing, persistence, migration, offline errors)

Start instructions

Start by scanning the repository and listing:

platform/stack

key folders/files for camera, AI calls, persistence, and screens
Then propose the refactor plan before coding.