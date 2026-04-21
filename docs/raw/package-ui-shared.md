# @packages/ui-shared

Reusable React UI components for AniMemoria front-end apps, built on HeroUI and Tailwind CSS. Consumed by `apps/admin`, `apps/web`, and `apps/storybook`.

---

## `@packages/ui-shared/hero-ui`

HeroUI context provider. Must wrap the application root so all HeroUI components receive their theme context.

Exports: `UIProvider`

### Usage

```tsx
import { UIProvider } from '@packages/ui-shared/hero-ui';
import '@packages/ui-shared/hero-ui/styles.css';

export default function App({ children }: { children: React.ReactNode }) {
  return <UIProvider>{children}</UIProvider>;
}
```

> Also import `@packages/ui-shared/hero-ui/styles.css` once at your app entry point.

---

## `@packages/ui-shared/buttons`

Thin wrapper around `@heroui/button` that forwards all `ButtonProps`.

Exports: `Button`

### Usage

```tsx
import { Button } from '@packages/ui-shared/buttons';

<Button color="primary" onPress={handleSubmit}>
  Sign in
</Button>;
```

All `ButtonProps` from HeroUI are supported (`color`, `variant`, `size`, `isLoading`, `isDisabled`, etc.).

---

## `@packages/ui-shared/inputs`

Form inputs pre-configured for common field types. `PasswordInput` includes built-in show/hide toggle. Both components accept all `InputProps` from HeroUI.

Exports: `EmailInput`, `PasswordInput`

### Usage

```tsx
import { EmailInput, PasswordInput } from '@packages/ui-shared/inputs';

<EmailInput label="Email" placeholder="you@example.com" value={email} onValueChange={setEmail} />

<PasswordInput label="Password" placeholder="••••••••" value={password} onValueChange={setPassword} />
```

---

## `@packages/ui-shared/dropdowns`

Controlled single-selection dropdown built on `@heroui/dropdown`. Supports custom trigger and item renderers.

Exports: `SingleSelect`

| Prop             | Type                                        | Description                   |
| ---------------- | ------------------------------------------- | ----------------------------- |
| `items`          | `{ key: string; element: ReactElement }[]`  | Options to display            |
| `selectedValue`  | `string`                                    | Currently selected key        |
| `onChange`       | `(value: string) => void`                   | Called when selection changes |
| `renderTrigger`  | `(el: ReactElement \| string) => ReactNode` | Custom trigger renderer       |
| `TriggerWrapper` | `ComponentType<{ children: ReactNode }>`    | Wrapper component for trigger |
| `renderItem`     | `(item: SelectItem) => ReactNode`           | Custom item renderer          |
| `ItemWrapper`    | `ComponentType<{ children: ReactNode }>`    | Wrapper component for items   |
| `data-testid`    | `string`                                    | Test ID on the root element   |

### Usage

```tsx
import { SingleSelect } from '@packages/ui-shared/dropdowns';

const items = [
  { key: 'en', element: <span>English</span> },
  { key: 'uk', element: <span>Ukrainian</span> },
];

<SingleSelect items={items} selectedValue={locale} onChange={setLocale} />;
```

---

## `@packages/ui-shared/icons`

SVG icon components. All icons accept `IconProps` which extends `React.SVGProps<SVGSVGElement>` with an optional `size` prop (defaults to `24`). Color is controlled via Tailwind `text-*` classes.

Exports: `DownArrow`, `EyeFilledIcon`, `EyeSlashFilledIcon`, `SpinnerIcon`

### Usage

```tsx
import { SpinnerIcon, DownArrow } from '@packages/ui-shared/icons';

<SpinnerIcon size={20} className="text-primary animate-spin" />
<DownArrow size={16} className="ml-2" />
```
