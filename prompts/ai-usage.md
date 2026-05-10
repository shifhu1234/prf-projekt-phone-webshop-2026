# AI Prompt Analysis

## Project Context

- **Project name:** `prf-projekt-phone-webshop-2026`
- **Date:** 2026-05-04
- **AI tools/models used:** GitHub Copilot, GPT-5.2 Codex, GPT-5.4 mini, Claude Haiku 4.5, Gemini 3.1 Pro
- **Main goal:** Build and document a full-stack mobile webshop project with frontend, backend, MongoDB database, authentication, CRUD operations, routing, Docker setup, and software documentation.

---

# Prompt Quality Analysis

## What Makes a Good Prompt?

A strong prompt usually:
- clearly describes the issue or task,
- includes the expected behavior,
- explains constraints,
- separates frontend/backend/documentation requirements,
- provides reproducible examples.

A weak prompt usually:
- lacks exact expectations,
- is overly broad,
- mixes unrelated tasks together,
- omits technical context,
- or requires the AI to guess intent.

---

# Excellent / Strong Prompts

## 1. Architecture + Constraints Prompt

### Prompt
> We are going to create a project. I will provide the description, constraints, and tasks. Your job is to generate this project in a way that it can be accessed by running three Dockerfiles. The three Dockerfiles are: the frontend, the backend, and the MongoDB database
>
> Project theme: Mobile webshop.
>
> Requirements: (Projektmunka feladatkiiras 2026_modified.pdf)
>
> Simplified requirements: (the phases I added)
>
> To complete the exercise, a project implementation is required that demonstrates a full web system. The system must consist of a database, a 
> server-side with REST endpoints, a web application, documentation, and a prompt analysis reviewing the use of AI.

### Why this is a strong prompt
- Defines the project scope immediately.
- Defines deployment architecture.
- Defines technical constraints.
- Removes ambiguity about runtime setup.
- Gives a measurable requirement.

### Why the AI responded well
The AI could immediately:
- choose a proper stack,
- structure the repository,
- separate services correctly,
- prepare containerization from the beginning.

---

## 2. Schema-First Development Prompt

### Prompt
> Phase 2: Database and Data Model 
> Database setup: Configure the database (can be local, Docker containerized, or cloud-based, e.g., MongoDB Atlas / Supabase).
> Data model design: Design at least 5 entities/collections and establish the appropriate connections (relations) between them. (Please present the schema before you code it!)
> Seeding (Demo data): Write a seed script that populates the system with default demo data when initializing the database, so there is immediately something to display in the web application.

### Why this is a strong prompt
- Forces documentation-first workflow.
- Clearly separates planning from implementation.
- Prevents silent schema assumptions.
- Improves maintainability.

### Result
The AI created:
- schema documentation,

- entity relationships,
- collection explanations,
- implementation alignment.

---

## 3. UI Bug Reproduction Prompt

### Prompt
> If I filter the products, and list them, probably because of the type of displaying css uses, if theres only 1 find/1 product available, then that product takes up all 3 spaces and its a huge option/product to choose, as well as the add product button. fix this so its always a 3-option row you know what I mean.

### Why this is a strong prompt
- Describes:
  - the trigger,
  - the visual problem,
  - the probable cause,
  - and the expected result.
- Includes contextual reasoning.
- Gives enough UI information for debugging.

### Result
The AI correctly switched:
- `auto-fit`
→ to
- `auto-fill`

and stabilized the grid layout.

---

## 4. Logic Bug Prompt

### Prompt
> Also, now the Cart is broken. When I add something to the cart, like 9x products of one type, then hit checkout, it will not show in the orders but removes stock, BUT doesnt update stock immediatley.

### Why this is a strong prompt
- Includes:
  - reproduction steps,
  - expected behavior,
  - actual behavior,
  - affected systems.
- Makes backend/frontend synchronization issue obvious.

### Result
The AI identified:
- stock refresh issues,
- checkout synchronization problems,
- missing frontend refresh behavior.

---

### Prompt
> The following items are not working correctly; please fix them:
> - "Browse catalog" button: does not scroll/direct to the catalog.
> - "Create account" button: does not scroll/direct to the registration section.
> - "See spec sheet" button: does nothing when clicked.
> - I cannot filter based on specs (e.g., 128GB/256GB/512GB storage).
> - The user lacks a CRUD interface (e.g., changing name/password, deleting account).
> - The Admin Studio interface is slightly buggy; inputs overflow from the admin panel.

### Why this is a strong prompt
This prompt is strong because:
- it clearly lists every issue separately,
- each bug is concrete and reproducible,
- frontend, backend, and UX problems are distinguishable,
- expected behavior is implied naturally,
- the AI can convert each bullet into subtasks.

---

## 5. UX Improvement Prompt

### Prompt
> Can we make the reviews a bit more ,,excluded" from the product? It can stay where it is, but we should make it a bit separated/siolated from the other information, because now it is so crowded and too much text/information there is!

### Why this is a strong prompt
- Clearly describes UX pain.
- Explains visual problem.
- Leaves implementation flexibility.
- Focuses on outcome rather than forcing a solution.

### Result
The AI improved:
- spacing,
- visual grouping,
- review panel separation,
- readability.

---

## 6. Full Context Prompt

### Prompt
> I have made a list with checkpoints/tasks that you have to CHECK if this is implemented in this project. If not, then you have to implement it.

### Why this is a strong prompt
- Defines verification behavior.
- Defines fallback behavior.
- Creates a validation workflow.
- Reduces ambiguity.

### Result
The AI:
- audited the project,
- checked implementation status,
- documented missing features,
- added missing requirements.

---

# Medium Quality Prompts

## 1. Styling Prompt

### Prompt
> Move back the category butten where it originally were, but make a style to the button just like with the panels on the site. Also style the add product button.

### Why it is medium quality
Good:
- clear visual intent,
- references existing UI style.

Weakness:
- lacks exact styling expectations,
- lacks spacing/layout details.

### What improved it later
Later prompts clarified:
- positioning,
- spacing,
- form behavior.

---

## 2. Review Stretching Prompt

### Prompt
> It is better, but now if I open down/show a review on a product, then it will stretch the other products next to it too.

### Why it is medium quality
Good:
- clearly explains visible issue.

Weakness:
- does not define preferred UX direction immediately.

### Result
The AI proposed multiple solutions:
- sidebar,
- collapsible content,
- drawer panel.

---

# Weak / Bad Prompts

## 1. Overly Broad Prompt

### Prompt
> Phase 4: Web Application (Frontend / GUI) ...
> Client initialization: Create the frontend framework and routing.
> Auth GUI: Create forms for user registration and login.
> CRUD GUI: Create interfaces (tables, cards, forms) through which the user can visually execute CRUD operations from the browser (initiating HTTP requests to the REST API).
> Displaying data: Display the demo data coming from the database and handle responses/error messages from the server on the interface.

### Why this is weak
- Extremely broad.
- No acceptance criteria.
- No feature list.
- No constraints.
- Requires heavy assumption.

### Why it still worked
The AI relied on:
- earlier context,
- existing project structure,
- assignment phases.

### Better version
> Verify whether the frontend already supports authentication, CRUD operations, and routing. If routing is missing, implement client-side routing using react-router-dom and document it inside docs/frontend.md.

---

## 2. Minimal Context Prompt

### Prompt
> Phase 5: Software Documentation (In the docs folder) ...
> Writing documentation: Generate a comprehensive markdown file in the docs folder.
> Content elements: Cover the justification for the chosen tech stack.
> Requirements: List and explain how the project meets the required functional (CRUD, Auth, etc.) and non-functional (security, REST principles, database structure) requirements.

### Why this is weak
- No documentation structure.
- No expected files.
- No required sections.
- No formatting expectations.

### Better version
> Create a consolidated software-documentation.md file containing:
> - architecture overview,
> - stack justification,
> - API overview,
> - routing,
> - authentication,
> - database entities,
> - Docker setup,
> - requirement coverage.

---

### Prompt 
> Try Again

### Why it is weak
- No context.
- No explanation of what failed.
- No expected outcome.
- No technical direction.

### The AI has to guess:
- what failed,
- what should change,
- what was incorrect.

---

## 3. Ambiguous Prompt

### Prompt
> yes but paste our whol conversation inside it!

### Why this is weak
- Informal wording.
- No formatting instructions.
- No transcript structure.
- No filtering instructions.
- No markdown expectations.

### Why the AI still succeeded
The earlier context already established:
- transcript logging,
- markdown usage,
- AI usage documentation.

---

## 4. Multi-Issue Mixed Prompt

### Prompt
> from now on add every prompt we chat into the ai usage. The STORAGE and SCREEN filter should have the same style as the other buttons with "filter". Also when we log out/start the localhost, the account tab should always be on the login side. Thirdly, when I order items, for example 5 of the same phones, the order says it has 1 items.

### Why this is weak
The prompt mixes:
- documentation,
- styling,
- session state,
- business logic.

### Problems caused
- harder task prioritization,
- higher risk of incomplete fixes,
- harder debugging.

### Better version
Split into:
1. documentation update,
2. filter styling,
3. auth persistence,
4. order quantity logic.

---

# Patterns Observed During the Project

## Strong Prompt Patterns
The best prompts usually included:
- exact bug description,
- expected behavior,
- reproduction steps,
- UI context,
- technical constraints,
- architectural expectations.

---

## Weak Prompt Patterns
The weakest prompts usually:
- were phase titles only,
- assumed context implicitly,
- mixed unrelated tasks,
- omitted acceptance criteria.