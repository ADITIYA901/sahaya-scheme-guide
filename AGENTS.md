<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Application rules
- Keep Sahaya Bot Guide focused on discovering Indian government schemes, checking eligibility, and explaining scheme documents.
- Keep the experience on one scrolling home page with section anchors for scheme discovery, eligibility, voice questions, and PDF help.
- Keep scheme and audience reference data in the shared browser-safe schemes module, so discovery and eligibility use the same catalog.
- Preserve the scheme-focused chat, voice assistant, eligibility helper, and PDF analysis components as active features.
- Keep AI calls in server functions and server-only helpers; never expose API credentials to the browser.
- Preserve the OpenRouter model configuration through server-only environment variables; never commit local environment files.
- Label sample weather or help-center details clearly and do not imply live information unless connected to a live data source.
