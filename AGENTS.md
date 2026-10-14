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
- Keep the reference experience as one scrolling home page with section anchors, since its navigation selects sections rather than separate content pages.
- Isolate AI calls in server functions and server-only helpers; use the Lovable AI Gateway and never expose credentials to the browser.
- Keep scheme and help-center reference data in a shared browser-safe module, so discovery and eligibility use the same catalog.
- Keep the reference assistant as one session-only conversation with no account or history sidebar, to preserve its public lightweight workflow.
- Label reference weather and help-center distances as sample information rather than implying live location or forecast data.
