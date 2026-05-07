# AI Prompt Analysis

## Project Context

- Project name: prf-projekt-phone-webshop-2026
- Date: 2026-05-07
- AI tool/model used: GitHub Copilot, GPT-5.4 mini
- Main goal: Build and document a phone webshop project with frontend, backend, database, routing, auth, and CRUD flows.

## Conversation Transcript

### Initial UI and Backend Fixes

- User: The add category is not working. Also the add product should open where the + product is, not in the front row. The add category it should be the SAME as it was on the sideboard but without the side board. Also you cant add product too. it says: cast to objectid failed for value new type string at path _id for model prdouct (and category).
- Assistant: Investigated the frontend and backend, identified that `editingProductId === "new"` and `editingCategoryId === "new"` were being treated like real database IDs, and started fixing the form placement and ObjectId handling.
- User: Try Again.
- Assistant: Fixed the add product submission flow so `"new"` is treated as a create action, not an update, and moved the add product form/button behavior to the top of the grid.
- User: The add product button is still at the end of the list, it should be the first element! When I click on it, it should display the add product details. Also, the add category's elements are really crowded.
- Assistant: Reworked the product grid layout so the add product tile appears first, and improved the add category form spacing and structure.
- User: The add category button should be next to the Catalog Filter by collection to explore your next device. text. Also, now the Cart is broken. When I add something to the cart, like 9x products of one type, then hit checkout, it will not show in the orders but removes stock, BUT doesnt update stock immediatley.
- Assistant: Moved the add category button next to the Catalog heading and added a catalog reload after checkout so stock refreshes immediately.
- User: Move back the category butten where it originally were, but make a style to the button just like with the panels on the site. Also style the add product button.
- Assistant: Moved the category button back to the sidebar area and styled both buttons like panels.
- User: When I click on the add category button, it opens up on the bottom of that sidebar. Open it at twhere the button is! Also, the add product's elements are a bit crowded, for example the name and brand inputs are touching each other. Thirdly, the Flagship highlight phone is tilted to landscape. what if we flip that div/phone/flagship container to a portrait/horizontal display?
- Assistant: Moved the add category form directly below the sidebar button, added spacing to the add product form, and changed the flagship highlight mockup to a portrait layout.
- User: Also revert back flagship highlight to its original state, to the landscape type!
- Assistant: Reverted the flagship mockup to the original landscape style.
- User: If I filter the products, and list them, probably because of the type of displaying css uses, if theres only 1 find/1 product available, then that product takes up all 3 spaces and its a huge option/product to choose, as well as the add product button. fix this so its always a 3-option row you know what I mean.
- Assistant: Switched the grid from `auto-fit` to `auto-fill` and made the add product tile match the card footprint so filtered rows stay visually stable.

### Project Initialization and Architecture

- User: I have made a list with checkpoints/tasks that you have to CHECK if this is implemented in this project. If not, then you have to implement it.
- Assistant: Checked the project structure and documented the current implementation status.
- User: Phase 1: Project Initialization and Architecture Design ... Defining the tech stack ... and write a short justification for the documentation intended for the docs/ folder on why we chose this.
- Assistant: Confirmed the stack was already implemented and added justification in `docs/stack.md`.
- User: Phase 2: Database and Data Model ... Please present the schema before you code it!
- Assistant: Confirmed the data model already existed, then created `docs/database.md` with the schema and relationships before implementation details.
- User: Phase 3: Server Side (Backend & REST API) ...
- Assistant: Verified server/DB connection, auth, sessions, CRUD endpoints, and route protection, and documented the access model in `docs/api.md`.
- User: Phase 4: Web Application (Frontend / GUI) ...
- Assistant: Confirmed the frontend already handled auth, CRUD, and data display, then added real client-side routing with `react-router-dom`.
- User: Phase 5: Software Documentation (In the docs folder) ...
- Assistant: Created `docs/software-documentation.md` with stack justification, project structure, data model, and requirements coverage.
- User: Phase 6: AI Prompt Analysis (In the prompts folder) ...
- Assistant: Created `prompts/ai_usage.md` as a template.
- User: yes but paste our whol conversation inside it!
- Assistant: Replaced the template with this conversation transcript and analysis.

## Phase Analysis

### Phase 1 - Project Initialization and Architecture Design

- What worked well: The chosen stack matched the assignment well and was already implemented with Dockerized services.
- What did not work well: The documentation was split across multiple files, which made the architecture story less obvious at first glance.
- Improvements for next time: Add one root-level architecture overview earlier in the project.

### Phase 2 - Database and Data Model

- What worked well: The data model already included more than five entities and clean relations.
- What did not work well: The schema had not been presented in a single clearly labeled document until it was added.
- Improvements for next time: Document the schema before implementation, then keep the docs and code aligned.

### Phase 3 - Server Side (Backend & REST API)

- What worked well: Session-based auth, protected CRUD, and REST endpoints were already present.
- What did not work well: Some route access rules needed to be described explicitly for the assignment.
- Improvements for next time: Keep a short API access matrix in the docs from the beginning.

### Phase 4 - Web Application (Frontend / GUI)

- What worked well: The frontend already had strong CRUD and auth UI coverage.
- What did not work well: Routing was missing initially and had to be added afterward.
- Improvements for next time: Start with router-aware app structure if multiple views are expected.

### Phase 5 - Software Documentation

- What worked well: The docs folder was already organized enough to add a consolidated documentation file.
- What did not work well: The documentation content was distributed before the final summary file was created.
- Improvements for next time: Create one main documentation file first, then split out details into supporting docs.

### Phase 6 - AI Prompt Analysis

- What worked well: The prompt chain was concrete, with each phase anchored to real code and docs.
- What did not work well: Some requests were repeated in slightly different wording, which made the workflow longer than needed.
- Improvements for next time: Keep prompts specific about the exact file, behavior, or output that should change.

## Prompt Quality Review

### Good Prompts

- "Phase 2: Database and Data Model ... Please present the schema before you code it!"
  - Why it worked: It set a clear constraint and forced a schema-first documentation step.
- "Phase 5: Software Documentation ..."
  - Why it worked: It clearly described the required documentation content and location.
- "If I filter the products ... fix this so its always a 3-option row"
  - Why it worked: It described a visible UI bug with a clear expected layout outcome.

### Weak Prompts

- "Fix it."
  - Why it was weak: Too vague to act on without guessing.
  - Better version: "Fix the add category form opening at the bottom of the sidebar."
- "Try Again"
  - Why it was weak: It did not specify what failed.
  - Better version: "Try again and move the add product button to the top of the grid."
- "Make it better."
  - Why it was weak: No target behavior or file was identified.
  - Better version: "Improve the spacing of the add category form in `frontend/src/App.jsx`."

## Overall Reflection

- Main strengths of AI support: Fast codebase inspection, targeted fixes, and good documentation scaffolding.
- Main limitations of AI support: Repeated prompts with inconsistent wording and some UI changes required several iterations.
- What I would change in future prompts: Specify the exact file, exact expected behavior, and whether the change is structural, visual, or documentation-only.

## Final Notes

- This file now contains the conversation history in a readable transcript form.
- The project work was organized by phases and validated with the existing code and docs.
- If additional logs are needed later, they can be appended below this transcript.

## Current Prompt Log Append

- User: from now on add every prompt we chat into the ai usage. The STORAGE and SCREEN filter should have the same style as the other buttons with "filter". Also when we log out/start the localhost, the account tab should always be on the login side. Thirdly, when I order items, for example 5 of the same phones, the order says it has 1 items. fix this, like if I order 10 same products + 2 other but same products, itll says 12 items.
- User: When I click on the filters, it filters the phones, but if i click back to the All, then it flicks the screen to the top, then filters. fix this flicker bug.
