# Marketing component attribution

The marketing site adapts these MIT-licensed Motion Primitives components by Julien Thibeaut (ibelick), discovered on 21st.dev:

- [Animated Tabs / Animated Background](https://21st.dev/@ibelick/components/animated-tabs), [author source](https://github.com/ibelick/motion-primitives/blob/main/components/core/animated-background.tsx): `src/components/marketing/animated-background.tsx`. Used by product-tour tabs and the desktop navigation. The adaptation adds controlled state, strict button types, preserved event handlers, shared navigation highlights, and reduced-motion support.
- [Transition Panel](https://21st.dev/@ibelick/components/transition-panel/with-tabs), [author source](https://github.com/ibelick/motion-primitives/blob/main/components/core/transition-panel.tsx): `src/components/marketing/transition-panel.tsx`. Used by the product tour. The adaptation adds inert/hidden outgoing content and reduced-motion support.

- [Tilt](https://21st.dev/@ibelick/components/tilt), [author source](https://github.com/ibelick/motion-primitives/blob/main/components/core/tilt.tsx): `src/components/marketing/marketing-tilt.tsx`. Used by the homepage testimonials. The adaptation limits rotation to 1.8 degrees, uses the existing LazyMotion provider, disables tilt for touch and reduced-motion preferences, and resets on pointer cancellation.

21st.dev's install registry required authentication. The source was retrieved from the author's public repository instead. Existing Framer Motion dependencies are reused; no registry credentials, package additions, or modifications to shadcn primitives were needed.

## Upstream license

MIT License

Copyright (c) 2024 ibelick

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
