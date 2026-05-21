---
name: research-pipeline-packager
description: Package a completed research pipeline for future reuse. Use when the user has finished building or running a research pipeline, data processing workflow, or scientific computing task and wants to extract reusable components. Triggers on phrases like "package this project", "extract reusable functions", "save for later", "create spec docs", "prepare for reuse", or when a pipeline task reaches completion and the user wants to preserve the work. Also triggers when the user asks to analyze a project's code for reusable patterns or wants to build a knowledge base from completed work.
---

# Research Pipeline Packager

After completing a research pipeline (web scraper, data processor, ML workflow, etc.), this skill packages it for future reuse by:

1. **Extracting pure functions** into the project's `lib/research_utils/` package
2. **Generating spec docs** (SPEC.md + PROMPTS.md) in the project's `specs/` and `prompts/` directories
3. **Creating a private GitHub repo** to store all workflow assets
4. **Updating MEMORY.md** so future sessions know what's available

## When to use

Use this skill when:
- A research pipeline task is **complete** and the user wants to preserve it
- The user says things like "package this", "extract reusable parts", "save for later"
- You've just finished building a crawler, scraper, data pipeline, or analysis tool
- The user wants to prepare a project so an agent can quickly pick it up next time

Do NOT use for:
- Simple scripts with no reusable logic
- Projects that are still actively being developed (wait until stable)
- Non-Python projects (the extraction target is always a Python package)

## The packaging workflow

### Phase 1: Analyze the project

Read the project's code to build a complete picture:

1. **Identify the project structure** — list all source files, read `pyproject.toml` or `requirements.txt` for dependencies
2. **Map the pipeline flow** — find the entry point, trace execution through the main stages
3. **Catalog LLM prompts** — find all system prompts, user prompt templates, and their parameters (temperature, max tokens, etc.)
4. **Identify pure functions** — scan all utility/helper functions for extraction candidates

### Phase 2: Create the project repo

Each workflow gets its own private GitHub repo. Structure:

```
{project-name}/
├── README.md           # Overview, import reference, quick start
├── docs/               # General documentation
├── specs/              # Pipeline specification (SPEC.md)
├── prompts/            # LLM prompt templates (PROMPTS.md)
└── lib/                # Reusable Python functions
    ├── pyproject.toml
    └── research_utils/
        ├── __init__.py
        ├── url/__init__.py
        ├── text/__init__.py
        ├── markdown/__init__.py
        ├── llm/__init__.py
        └── cli/__init__.py
```

Steps:
1. Ask user for the repo name (default: project name)
2. Create private repo: `gh repo create {name} --private --description "..."`
3. Clone and populate the structure above
4. Push to GitHub

### Phase 3: Extract pure functions

A function is **pure** (eligible for extraction) if:
- Same inputs always produce the same output (deterministic)
- No side effects (no file I/O, no network, no global state mutation)
- No dependency on class instance state (no `self`)
- Dependencies are limited to standard library or commonly-available packages

A function is **NOT pure** (skip it) if:
- It reads/writes files, databases, or network resources
- It depends on `self` or mutable class state
- It uses `print()` or `logging` for side effects
- It calls external APIs or services

**Where to put extracted functions** — `lib/research_utils/` in the project repo:

| Module | Purpose | Examples |
|--------|---------|----------|
| `url` | URL manipulation | normalize_url, extract_domain, should_skip_url |
| `text` | String processing | sanitize_filename, truncate_content, mask_key |
| `markdown` | Markdown generation | build_frontmatter, build_filename_from_url |
| `llm` | LLM response handling | parse_json_response, clamp_score |
| `cli` | CLI utilities | resolve_env_var |
| `converters` | Format conversion | html_to_markdown, pdf_to_markdown |
| `network` | HTTP utilities | fetch_with_retry, detect_content_type |

If no existing module fits, create a new one. Each module is a directory with `__init__.py`.

**Steps for each extracted function:**

1. Read the source function
2. Adapt it: remove `self`, remove side effects, simplify imports
3. Add it to `lib/research_utils/{module}/__init__.py`
4. Update `lib/pyproject.toml` if new dependencies are needed

### Phase 4: Generate spec docs

**specs/SPEC.md** — The project specification:
```markdown
# {Project Name} — {One-line description}

## Overview
{2-3 sentence description}

## Core Pipeline
{ASCII flow diagram}

## Input/Output
| Item | Description |
|------|-------------|
| Input | {what the pipeline takes} |
| Output | {what the pipeline produces} |

## Python Dependencies
| Package | Purpose |
|---------|---------|
| {package} | {what it's used for} |

## Reusable Functions
```python
from research_utils.{module} import {function1}, {function2}
```

## LLM Prompts
See `../prompts/PROMPTS.md` for complete prompt templates.

## Project Structure
{tree of source files}
```

**prompts/PROMPTS.md** — All LLM prompts (verbatim, not summarized)

### Phase 5: Update MEMORY.md

Read `~/.claude/projects/-home-lulu444/memory/MEMORY.md`, then add or update:

1. A **project** memory for the packaged project
2. A **reference** memory pointing to the GitHub repo URL

## Common pitfalls

- **Don't extract functions that are too specific.** Focus on general-purpose utilities.
- **Don't lose the import path.** Specs store `from research_utils.X import Y`, not source code.
- **Don't forget dependencies.** Update `lib/pyproject.toml` for new external deps.
- **Keep prompts verbatim.** Copy LLM prompts exactly — the next agent needs them to replicate results.
- **Each project gets its own repo.** Don't mix multiple projects in one repo.
