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
- Accounts: Sign in with Apple and email with password, including email-code confirmation and password reset
- Answers saved on the device and synced to the user's Supabase profile

- A home screen per stage: cycle and fertile window, pregnancy week and appointments, baby age and a feed/sleep/diaper log
- A daily mood check-in and an account screen with sign-out

Not built yet: subscription, the Momo AI chat, editing answers after onboarding, and in-app account deletion.

Sign in with Apple does not work in Expo Go; it needs a development or TestFlight build.

## Where things live

| Path | What it is |
|---|---|
| `src/app/` | Screens (Expo Router: one file per screen) |
| `src/onboarding/flow.ts` | Every onboarding question, in order. Edit here to add, remove or reword questions |
| `src/onboarding/insights.ts` | Fertile window, pregnancy week and baby age calculations |
| `src/auth/` | Session, Apple sign-in, and syncing the profile to the account |
| `supabase/migrations/` | Database schema, in order |
| `src/home/` | The home screen content for each stage |
| `src/data/` | Reading and writing check-ins and baby logs |
| `src/components/` | Chat bubbles, chips, calendar, dial, number wheel, country picker |
| `src/theme/` | Colours per stage, fonts, spacing |

## Placeholder artwork

Everything in `assets/images/` was cropped from screen exports and is low resolution. Replace each file with the designer's real export, keeping the same file name.
