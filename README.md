# Momora

iOS app for the journey to motherhood: trying to conceive, pregnancy, and post delivery. Built with Expo (React Native) and TypeScript.

## Run it

```bash
npm install
```

```bash
npx expo start
```

Press `i` for the iOS simulator (needs a Mac with Xcode), or scan the QR code with Expo Go on an iPhone.

## Checks

```bash
npx tsc --noEmit
```

```bash
npx expo lint
```

## What exists

- Welcome screen, Meet Momo, and the chat-style onboarding for all three stages
- A summary screen per stage that plays back what Momo learned
- Answers saved on the device

Not built yet: accounts, subscription, the home screens, trackers, and the Momo AI chat. `src/app/home.tsx` is a placeholder.

## Where things live

| Path | What it is |
|---|---|
| `src/app/` | Screens (Expo Router: one file per screen) |
| `src/onboarding/flow.ts` | Every onboarding question, in order. Edit here to add, remove or reword questions |
| `src/onboarding/insights.ts` | Fertile window, pregnancy week and baby age calculations |
| `src/components/` | Chat bubbles, chips, calendar, dial, number wheel, country picker |
| `src/theme/` | Colours per stage, fonts, spacing |

## Placeholder artwork

Everything in `assets/images/` was cropped from screen exports and is low resolution. Replace each file with the designer's real export, keeping the same file name.
