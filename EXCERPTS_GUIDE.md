# Blog & Project Excerpts Guide

Your site now supports displaying excerpts from blog posts and projects on the homepage, similar to the tabi theme!

## What Was Added

### 1. Enhanced Homepage Template
The homepage (`themes/duckquill/templates/index.html`) now displays:
- Your existing intro content
- Recent blog posts with excerpts (enabled by default)
- Recent projects section (enabled by default)

**Key feature:** Uses the exact same article block structure as your blog page, so styling is automatically consistent!

### 2. Configuration
Edit `content/_index.md` to control what appears on the homepage:

```toml
[extra]
# Show recent blog posts on homepage (default: true)
show_recent_posts = true
# Maximum number of recent posts to display (default: 5)
max_recent_posts = 5

# Show recent projects on homepage (default: false)
show_recent_projects = true
max_recent_projects = 3
```

### 3. Styling
Minimal styles in `themes/duckquill/sass/_homepage.scss` - the article blocks reuse existing styles from `_article-list.scss` for consistency.

## How to Add Excerpts to Blog Posts

There are two ways excerpts work:

### Option 1: Custom Description (Recommended)
Add a `description` field to your blog post frontmatter. This gives you full control over what appears as the excerpt:

```toml
+++
title = "Bash with no letters"
date = 2024-10-10
description = "Exploring bash trickery through a PicoCTF challenge that only allows numbers and special characters."

[taxonomies]
tags = ["bash"]
[extra]
+++
```

### Option 2: Auto-Generated Summary (Fallback)
If you don't add a `description`, Zola will automatically generate a `summary` from the first ~200 characters of your post content. This happens automatically - no configuration needed!

## Example: Adding Description to an Existing Post

**Before:**
```toml
+++
title = "Bash with no letters"
date = 2024-10-10
[taxonomies]
tags = ["bash"]
[extra]
+++
```

**After:**
```toml
+++
title = "Bash with no letters"
date = 2024-10-10
description = "Exploring bash trickery through a PicoCTF challenge that only allows numbers and special characters."
[taxonomies]
tags = ["bash"]
[extra]
+++
```

## Setting Up Projects as a Collection

Currently, your projects are static markdown content. To display project excerpts on the homepage:

### Step 1: Convert Projects to Individual Pages
Create individual markdown files in `content/projects/`:

```
content/
  projects/
    _index.md          # Section config
    radio-canada.md    # Individual project
    centris-scraper.md # Individual project
    etc.
```

### Step 2: Configure Projects Section
Edit `content/projects/_index.md`:

```toml
+++
title = "Projects"
sort_by = "date"           # Or "title", "weight", etc.
template = "article_list.html"
page_template = "article.html"
+++

Optional intro content about your projects...
```

### Step 3: Create Individual Project Pages
Create `content/projects/radio-canada.md`:

```toml
+++
title = "Radio-Canada Lite"
date = 2024-01-15
description = "A lightweight frontend for Radio-Canada's streaming content."

[extra]
# Optional: add custom fields
github_url = "https://github.com/..."
live_url = "https://..."
+++

Full project details here...
```

### Step 4: Enable Projects on Homepage
Uncomment in `content/_index.md`:

```toml
[extra]
show_recent_posts = true
max_recent_posts = 5

show_recent_projects = true  # Enable this
max_recent_projects = 3      # And this
```

## Features

### Recent Posts Section Shows:
- Post title (linked)
- Excerpt (description or auto-summary)
- Publication date
- Tags
- "View all posts →" link (if more posts exist)

### What Gets Displayed:
1. **If `description` exists**: Renders as inline markdown
2. **Else if auto-summary exists**: Truncated to 200 chars with ellipsis
3. **Neither**: No excerpt shown, just title and meta

## Customization

### Change Number of Posts
```toml
[extra]
max_recent_posts = 3  # Show only 3 posts
```

### Disable Recent Posts
```toml
[extra]
show_recent_posts = false
```

### Customize Styling
Edit `themes/duckquill/sass/_homepage.scss` to adjust:
- Spacing and layout
- Typography
- Colors
- Hover effects

## Testing

Build your site to see the changes:
```bash
zola build
# or
zola serve
```

Visit your homepage to see recent posts with excerpts!

## Tips

1. **Write good descriptions**: 1-2 sentences that capture the essence of your post
2. **Keep them concise**: Aim for 150-250 characters
3. **Use markdown sparingly**: Descriptions support inline markdown (bold, italic, links)
4. **Be consistent**: Add descriptions to all posts for a polished look

## Example Description Styles

**Technical post:**
```
description = "A deep dive into Docker networking on Raspberry Pi, covering bridge modes, port forwarding, and common pitfalls."
```

**Tutorial:**
```
description = "Learn how to deploy an Eleventy site to AWS S3 with automatic builds and CloudFront CDN."
```

**Project showcase:**
```
description = "Building a privacy-focused web scraper for Montreal real estate listings with Python and Playwright."
```

---

Based on the [tabi theme](https://github.com/welpo/tabi) approach, implemented for duckquill.
