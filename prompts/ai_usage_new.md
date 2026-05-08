# AI Prompt Analysis

## Project Context

* **Project name:** prf-projekt-phone-webshop-2026
* **Date:** 2026-05-04
* **AI tool/model used:** GitHub Copilot, GPT-5.2 Codex, GPT-5.4 mini, Claude Haiku 4.5, Gemini 3.1 Pro
* **Main goal:** Build and document a phone webshop project with frontend, backend, database, routing, auth, and CRUD flows.

---

## Conversation Transcript

**User:**
> We are going to create a project. I will provide the description, constraints, and tasks. Your job is to generate this project in a way that it can be accessed by running three Dockerfiles. The three Dockerfiles are: the frontend, the backend, and the MongoDB database.
>
> Project theme: Mobile webshop.
>
> Requirements: (Projektmunka feladatkiiras 2026_modified.pdf)
>
> Simplified requirements: (the phases I added)
>
> To complete the exercise, a project implementation is required that demonstrates a full web system. The system must consist of a database, a server-side with REST endpoints, a web application, documentation, and a prompt analysis reviewing the use of AI.

**Assistant:**
> - I began designing the project as a full-stack mobile web store.
> - As a starting point, Node.js + Express + MongoDB were chosen for the backend, React + Vite for the frontend, and separate Dockerfiles were prepared for containerization.
> - The initial response included the main data models, the REST API, session-based authentication, seed data, and documentation structures.

**User:**
> You have generated the project so that the frontend, backend, and MongoDB can be run separately.

**Assistant:**
> - I created the contents for the backend, frontend, and db folders.
> - The main backend files were completed: server entry point, models, middleware, routes, and seed script.
> - The basic frontend files were completed: App, CSS, API wrapper, Vite config, and index.html.
> - The README and the docs folder were also created at this stage.

**User:**
> The following items are not working correctly; please fix them:
> - "Browse catalog" button: does not scroll/direct to the catalog.
> - "Create account" button: does not scroll/direct to the registration section.
> - "See spec sheet" button: does nothing when clicked.
> - I cannot filter based on specs (e.g., 128GB/256GB/512GB storage).
> - The user lacks a CRUD interface (e.g., changing name/password, deleting account).
> - The Admin Studio interface is slightly buggy; inputs overflow from the admin panel.

**Assistant:**
> - I reviewed the changes and began making fixes in both the frontend and backend.
> - During the conversation, it became clear that several files had already been modified, so I first coordinated on how to proceed.
> - The direction of the fixes: centering buttons, spec-based filtering, profile CRUD, and fixing the admin panel overflow.

**User:**
> I would like to make the chat export more readable and in UTF-8 format.

**Assistant:**
> - I converted the conversation export into a readable UTF-8 output.
> - I examined the chat JSON structure to identify where the actual assistant responses were located.
> - It turned out that the top-level response did not just return simple text fields but also contained structured metadata.

**User:**
> File template generation: Create a file named chat.md that contains a template for documenting the prompts.

**Assistant:**
> - At this point, I prepared the replacement for the chat.md template.
> - The file was initially a fillable prompt documentation template, but it later turned out that this was not the final intent.

**User:**
> Where are we uploading the database with demo data and also where are the at leasdt 5 entities/collections?

**Assistant:**
> - I’m locating the exact files and line ranges that implement the demo data seed and the required collections so I can point you to the precise places in the project.
> - I’ve got the collection definitions and the Docker seed flag. I’m checking the exact startup call that runs the seeding so I can tell you precisely where the demo data is loaded.
> - The demo data is not uploaded manually. It is seeded automatically when the backend starts:
> - MongoDB runs as the db service in docker-compose.yml
> - The backend connects to it in backend/src/server.js
> - Demo seeding is triggered right after the DB connection in backend/src/server.js
> - The actual demo records are created in backend/src/seed/seed.js and backend/src/seed/seed.js
> - That seed file inserts: 2 users, 5 categories, 8 products, 2 reviews
> - The “at least 5 entities/collections” requirement is satisfied by these model files: User, Category, Product, Cart, Order, Review
> - So the required structure is already there, and the demo data is loaded into MongoDB on startup. The frontend then displays that data from the API.

**User:**
> Do not upload a template; instead, upload the content of this conversation starting from the very first prompt!

**Assistant:**
> - I understood that instead of a template, a shortened, clear log of the entire conversation's content was needed.
> - Therefore, this file is no longer a fillable form, but a chronological conversation log.

**User:** 
> from now on add every prompt we chat into the ai usage. The STORAGE and SCREEN filter should have the same style as the other buttons with "filter". Also when we log out/start the localhost, the account tab should always be on the login side. Thirdly, when I order items, for example 5 of the same phones, the order says it has 1 items. fix this, like if I order 10 same products + 2 other but same products, itll says 12 items.

**Assistant:**
> - I’m checking the current frontend state for the three behavior fixes and the AI usage log structure, then I’ll patch the UI and order-count logic and append this prompt to the log.
> - I’ve finished the three UI/data fixes and appended this latest prompt to the AI usage log. Next I’m closing the loop with a short summary and marking the task complete.

**User:** 
> When I click on the filters, it filters the phones, but if i click back to the All, then it flicks the screen to the top, then filters. fix this flicker bug.

**Assistant:**
> The filter change now preserves the current scroll position, so clicking back to All no longer jumps the screen to the top before filtering. I also appended this prompt to prompts/ai_usage.md.

**User:** 
> The add category is not working. Also the add product should open where the + product is, not in the front row. The add category it should be the SAME as it was on the sideboard but without the side board. Also you cant add product too. it says: cast to objectid failed for value new type string at path _id for model prdouct (and category).

**Assistant:** 
> Investigated the frontend and backend, identified that `editingProductId === "new"` and `editingCategoryId === "new"` were being treated like real database IDs, and started fixing the form placement and ObjectId handling.
> - Fixed the add product submission flow so `"new"` is treated as a create action, not an update, and moved the add product form/button behavior to the top of the grid.

**User:** 
> The add product button is still at the end of the list, it should be the first element! When I click on it, it should display the add product details. Also, the add category's elements are really crowded.

**Assistant:** 
> Reworked the product grid layout so the add product tile appears first, and improved the add category form spacing and structure.

**User:** 
> The add category button should be next to the Catalog Filter by collection to explore your next device. text. Also, now the Cart is broken. When I add something to the cart, like 9x products of one type, then hit checkout, it will not show in the orders but removes stock, BUT doesnt update stock immediatley.

**Assistant:** 
> Moved the add category button next to the Catalog heading and added a catalog reload after checkout so stock refreshes immediately.

**User:** 
> Move back the category butten where it originally were, but make a style to the button just like with the panels on the site. Also style the add product button.

**Assistant:** 
> Moved the category button back to the sidebar area and styled both buttons like panels.

**User:** 
> When I click on the add category button, it opens up on the bottom of that sidebar. Open it at twhere the button is! Also, the add product's elements are a bit crowded, for example the name and brand inputs are touching each other. Thirdly, the Flagship highlight phone is tilted to landscape. what if we flip that div/phone/flagship container to a portrait/horizontal display?

**Assistant:** 
> Moved the add category form directly below the sidebar button, added spacing to the add product form, and changed the flagship highlight mockup to a portrait layout.

**User:** 
> Also revert back flagship highlight to its original state, to the landscape type!

**Assistant:** 
> Reverted the flagship mockup to the original landscape style.

**User:** 
> If I filter the products, and list them, probably because of the type of displaying css uses, if theres only 1 find/1 product available, then that product takes up all 3 spaces and its a huge option/product to choose, as well as the add product button. fix this so its always a 3-option row you know what I mean.

**Assistant:**
> Switched the grid from `auto-fit` to `auto-fill` and made the add product tile match the card footprint so filtered rows stay visually stable.

**User:** 
> I can see that there are reviews in to code, but where is this review function in the project? I cant seem to find it. If there is no feature exists, then implement it but do not make it complicated!

**Assistant:**
> The review feature was already in the backend at backend/src/routes/reviews.js, backend/src/routes/reviews.js, and backend/src/routes/reviews.js, but the frontend didn’t expose it. I added a minimal inline review UI on the product cards in frontend/src/App.jsx, frontend/src/App.jsx, and frontend/src/App.jsx, plus matching styles in frontend/src/styles.css.

**User:**
> Can we make the reviews a bit more ,,excluded" from the product? It can stay where it is, but we should make it a bit separated/siolated from the other information, because now it is so crowded and too much text/information there is!

**Assistant:**
> The reviews now stand out more as their own section inside the product card instead of blending into the product details. I changed the styling in frontend/src/styles.css so the review area has its own panel-like background, more spacing, and smaller internal text.

**User:** 
> Great! But now, if there is more reviews, then the products next to them stretch down so far too, without a single review. Now, how can we fix this? Should we take out the reviews to a sidebar that opens when we click on a product, or just make the reviews folding/collapsable?

**Assistant:** 
> I fixed the crowding by making reviews collapsed by default inside each product card, with a per-product toggle that reveals the review list and form only when needed. That keeps the grid height stable and avoids the sidebar detour. Collapsed reviews are the better fit here. I implemented them as a per-product toggle inside the card so the list and form only open when needed, which keeps the product grid from stretching and avoids adding a separate sidebar flow. The toggle is in frontend/src/App.jsx, frontend/src/App.jsx, and frontend/src/App.jsx, with the compact panel styling in frontend/src/styles.css.

**User:**  
> It is better, but now if I open down/show a review on a product, then it will stretch the other products next to it too. Any fixes for this? If we only fix the stretch, then one product will show the reviews yes, and the other ones next to it will not stretch, but still there will be a lot of blank spaces because of the display/grid/flex.

**Assistant:** 
> The layout issue is resolved by moving review content into a separate panel, which avoids the grid-row stretching altogether. I’m closing out with the exact locations in case you want to adjust the drawer behavior later. The clean fix was to move the review content out of the product card flow and into a dedicated side panel. That keeps the product grid stable, so opening reviews no longer stretches neighboring tiles or leaves big blank gaps. The implementation is in frontend/src/App.jsx, frontend/src/App.jsx, and frontend/src/App.jsx, with the layout/styling in frontend/src/styles.css and frontend/src/styles.css. Validation passed on the updated frontend files.

**User:** 
> I have made a list with checkpoints/tasks that you have to CHECK if this is implemented in this project. If not, then you have to implement it.

**Assistant:** 
> Checked the project structure and documented the current implementation status.

**User:** 
> Phase 1: Project Initialization and Architecture Design ... Defining the tech stack ... and write a short justification for the documentation intended for the docs/ folder on why we chose this.

**Assistant:** 
> Confirmed the stack was already implemented and added justification in `docs/stack.md`.

**User:** 
> Phase 2: Database and Data Model ... Please present the schema before you code it!

**Assistant:** 
> Confirmed the data model already existed, then created `docs/database.md` with the schema and relationships before implementation details.

**User:** 
> Phase 3: Server Side (Backend & REST API) ...

**Assistant:** 
> Verified server/DB connection, auth, sessions, CRUD endpoints, and route protection, and documented the access model in `docs/api.md`.

**User:** 
> Phase 4: Web Application (Frontend / GUI) ...

**Assistant:** 
> Confirmed the frontend already handled auth, CRUD, and data display, then added real client-side routing with `react-router-dom`.

**User:** 
> Phase 5: Software Documentation (In the docs folder) ...

**Assistant:** 
> Created `docs/software-documentation.md` with stack justification, project structure, data model, and requirements coverage.

**User:** 
> Phase 6: AI Prompt Analysis (In the prompts folder) ...

**Assistant:** 
> Created `prompts/ai_usage.md` as a template.

**User:** 
> yes but paste our whol conversation inside it!

**Assistant:** 
> Replaced the template with this conversation transcript and analysis.


### 6. Short Summary of the Entire Work

* The full-stack skeleton of the mobile web store project has been completed.
* The backend received session-based auth, CRUD endpoints, seed data, and a MongoDB connection.
* The frontend was built as a React + Vite interface, where Guest, Customer, and Admin roles behave differently.
* The `docs` folder contains descriptions of the stack, requirements, and API.
* The `prompts` folder recorded the use of AI and the conversation log.

---

## Phase Analysis

### Phase 1 - Project Initialization and Architecture Design
* **What worked well:** The chosen stack matched the assignment well and was already implemented with Dockerized services.
* **What did not work well:** The documentation was split across multiple files, which made the architecture story less obvious at first glance.
* **Improvements for next time:** Add one root-level architecture overview earlier in the project.

### Phase 2 - Database and Data Model
* **What worked well:** The data model already included more than five entities and clean relations.
* **What did not work well:** The schema had not been presented in a single clearly labeled document until it was added.
* **Improvements for next time:** Document the schema before implementation, then keep the docs and code aligned.

### Phase 3 - Server Side (Backend & REST API)
* **What worked well:** Session-based auth, protected CRUD, and REST endpoints were already present.
* **What did not work well:** Some route access rules needed to be described explicitly for the assignment.
* **Improvements for next time:** Keep a short API access matrix in the docs from the beginning.

### Phase 4 - Web Application (Frontend / GUI)
* **What worked well:** The frontend already had strong CRUD and auth UI coverage.
* **What did not work well:** Routing was missing initially and had to be added afterward.
* **Improvements for next time:** Start with router-aware app structure if multiple views are expected.

### Phase 5 - Software Documentation
* **What worked well:** The docs folder was already organized enough to add a consolidated documentation file.
* **What did not work well:** The documentation content was distributed before the final summary file was created.
* **Improvements for next time:** Create one main documentation file first, then split out details into supporting docs.

### Phase 6 - AI Prompt Analysis
* **What worked well:** The prompt chain was concrete, with each phase anchored to real code and docs.
* **What did not work well:** Some requests were repeated in slightly different wording, which made the workflow longer than needed.# AI Prompt Analysis

---

## Prompt Quality Review

### Good Prompts
* **"Phase 2: Database and Data Model ... Please present the schema before you code it!"**
  * *Why it worked:* It set a clear constraint and forced a schema-first documentation step.
* **"Phase 5: Software Documentation ..."**
  * *Why it worked:* It clearly described the required documentation content and location.
* **"If I filter the products ... fix this so its always a 3-option row"**
  * *Why it worked:* It described a visible UI bug with a clear expected layout outcome.

---

## Overall Reflection

* **Main strengths of AI support:** Fast codebase inspection, targeted fixes, and good documentation scaffolding.
* **Main limitations of AI support:** Repeated prompts with inconsistent wording and some UI changes required several iterations.
* **What I would change in future prompts:** Specify the exact file, exact expected behavior, and whether the change is structural, visual, or documentation-only.

---

## Final Notes

* This file now contains the conversation history in a readable transcript form.
* The project work was organized by phases and validated with the existing code and docs.
* If additional logs are needed later, they can be appended below this transcript.

---