I need you to act as a Senior Creative Frontend Developer. I want to build a "Z-tunnel" parallax hero section using React, Tailwind CSS, and GSAP (ScrollTrigger).

The Concept: I have a 3D cinematic character (a wolf) that appears to "walk forward" toward the screen as the user scrolls down, and "walks backward" as the user scrolls up. This needs to be a seamless frame-by-frame scrub animation.

Technical Requirements:

Structure: Create a main HeroContainer that is h-screen but pinned (sticky) using ScrollTrigger for a scroll distance of roughly 300vh (to give the scroll interaction weight).

The Wolf (Canvas Sequence):

Use an HTML <canvas> element to render a high-resolution image sequence of the wolf walking.

As the user scrolls down (progress 0 to 1), scrub through the image sequence frames (e.g., frame 0 is far away, frame 100 is close up).

Apply a "Z-Tunnel" scale effect: As the sequence progresses, scale the Canvas element from 1.0 to 3.0 so it feels like the wolf is physically passing the camera.

The UI Layers (Parallax & Opacity):

Layer 1 (Initial Hero UI): A foreground overlay containing the H1 title ("Welcome to the Pack") and CTA buttons. This layer must start at opacity: 1 and fade to opacity: 0 quickly (within the first 25% of the scroll).

Layer 2 (The Next Section): A background or secondary content layer that starts invisible (opacity: 0 and slightly scaled down). As the wolf animation nears the end (75%-100% scroll progress), this layer should fade in (opacity: 1) and scale to neutral, creating a transition effect where the wolf dissolves into the new content.

The "Ping Pong" Logic:

Ensure the animation is strictly tied to the scrollbar (scrub: true). If I scroll down, the wolf walks forward. If I scroll up, the frame sequence reverses instantly, making the wolf walk backward.

Refinement:

Add a subtle blur filter (backdrop-filter) to the text elements as they fade out for a cinematic feel.

Ensure the canvas centers the wolf perfectly at all viewports.

Deliverables:

Please provide the complete React component code.

Include the logic for pre-loading images to prevent flickering.

Use placeholder URLs for the image sequence (e.g., /assets/wolf/frame_001.jpg).

Explain how I should export my video/3D model to work with this (e.g., FPS and file format).