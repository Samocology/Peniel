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

- App state (cart, vendor accounts/plans, storefront choice, orders, chats) lives in `src/lib/vendra-store.ts`, persisted to localStorage and synced across tabs via the `storage` event — no backend yet; swap this module for Lovable Cloud later.
- Chat text always passes through `src/lib/chat-guard.ts` so contact details can't be exchanged.
