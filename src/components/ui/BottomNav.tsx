import { NavLink } from "react-router-dom";
import { IconInbox, IconNow, IconProgress, IconRoutine } from "./icons";

const TABS = [
  { to: "/agora", label: "Agora", Icon: IconNow },
  { to: "/inbox", label: "Caixa de entrada", Icon: IconInbox },
  { to: "/rotinas", label: "Rotinas", Icon: IconRoutine },
  { to: "/progresso", label: "Progresso", Icon: IconProgress }
];

export function BottomNav() {
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface-raised pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {TABS.map(({ to, label, Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              className={({ isActive }) =>
                [
                  "flex flex-col items-center gap-1 px-2 py-2.5 text-xs font-medium transition-colors",
                  isActive ? "text-brand-600" : "text-ink-faint hover:text-ink-muted"
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  <Icon aria-hidden="true" className={isActive ? "opacity-100" : "opacity-70"} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
