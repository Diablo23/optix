# Guide to Composing Prompts for Imagine 1.0

Imagine 1.0 is xAI's multimodal model for image and video generation, accessible via API as `grok-imagine-image` (images) and `grok-imagine-video` (videos). It supports text-to-image/video, image-to-video animation, and natural language editing of images/videos. Outputs are high-quality, context-aware, and subject to content moderation. Based on official xAI documentation from image and video generation guides, this section provides a detailed, separated guide for image and video prompting.

## Image Prompting Guide
Imagine 1.0 generates or edits images from natural language prompts, supporting styles, compositions, and multi-turn refinements.

### 1. Core Principles
- **Natural Language Descriptions**: Use plain English to describe subjects, scenes, actions, and styles.
- **Explicit Style and Medium**: Always specify artistic styles (e.g., "oil painting", "anime") for better control.
- **Imperative Language for Edits**: Use commands like "Render as...", "Add...", or "Modify..." for transformations.
- **Composition Details**: List elements clearly for complex scenes (e.g., subjects, backgrounds, layouts).

### 2. Prompt Structure
1. **Subject/Scene**: Main focus (e.g., "A serene Japanese garden").
2. **Action/Transformation**: Verbs for dynamics (e.g., "with blooming flowers").
3. **Style/Aesthetic**: Medium and look (e.g., "in watercolor with soft edges").
4. **Parameters**: Integrate API params like aspect ratio (e.g., "in 16:9 format").

### 3. Best Practices
- **Be Explicit**: Avoid ambiguity; describe lighting, colors, and angles.
- **Multi-Turn Refinement**: Start broad, then iterate (e.g., base prompt → add details).
- **Batch Variations**: Use `n` parameter for multiple outputs from one prompt.
- **Source Images**: For edits, provide up to 3 URLs or base64 images.
- **Aspect Ratio & Resolution**: Specify "1:1", "16:9", etc., and "1k" or "2k" for quality.
- **Output Format**: Request base64 for embedding.
- **Moderation**: Avoid violating content; check `respect_moderation` flag.

### 4. Examples
| Use Case | Prompt Example |
|----------|----------------|
| Basic Generation | "A collage of London landmarks in a stenciled street-art style" |
| Style Transfer | "Render this image as an oil painting in the style of impressionism" |
| Multi-Image Edit | "Add the cat from the first image to the second one" |
| Refinement | "A modern living room with large windows overlooking the city" (base); "Add cozy furniture and warm lighting" (follow-up) |

### 5. Limitations
- Max 10 images per request.
- URLs expire quickly; download immediately.
- Aspect ratio inherits from input for single edits.

## Video Prompting Guide
Imagine 1.0 generates or edits short videos (1-15 seconds) from text, images, or existing videos, focusing on motion and transformations.

### 1. Core Principles
- **Descriptive & Action-Oriented**: Use vivid verbs for motion (e.g., "launching", "blooming").
- **Cinematic Details**: Include timing, mood, and camera moves (e.g., "slow time-lapse", "drone shot").
- **Direct Commands for Edits**: Specify changes like "Change the color to red" or "Add a necklace".
- **Tailor to Input Type**: Text for new videos, image+text for animation, video+text for edits.

### 2. Prompt Structure
1. **Subject**: Main element (e.g., "rocket").
2. **Action/Motion**: Dynamics (e.g., "launching from dunes").
3. **Setting/Atmosphere**: Environment (e.g., "Mars sky with constellations").
4. **Temporal/Style**: Pace and look (e.g., "epic cinematic").

### 3. Best Practices
- **Vivid Motion Descriptions**: Emphasize verbs and transitions.
- **Object-Focused Edits**: Target specific elements (e.g., "Give the woman a hat").
- **Avoid Unsupported Params in Edits**: No duration/aspect/resolution changes.
- **Input Constraints**: Videos ≤8.7s, MP4 format.
- **Resolution**: Default 480p; max 720p.
- **Moderation**: All outputs are filtered; ensure compliance.

### 4. Examples
| Use Case | Prompt Example |
|----------|----------------|
| Text-to-Video | "A glowing crystal-powered rocket launching from the red dunes of Mars, ancient alien ruins lighting up in the background as it soars into a sky full of unfamiliar constellations" |
| Image-to-Video | "Generate a slow and serene time-lapse" (applied to a Milky Way image) |
| Video Edit | "Give the woman a silver necklace" |
| Cinematic | "Epic cinematic drone shot flying through mountain peaks" |

### 5. Limitations
- Max duration: 15s (generation), 8.7s (edit input).
- Preserves input properties in edits.
- Ephemeral URLs; no audio in some modes.

These guides ensure optimal results by aligning with Imagine 1.0's natural language interpretation and parameter controls.