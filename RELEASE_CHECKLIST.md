# Google Play Release Checklist: Smart Teacher Schedule AI

## 1. App Identity & Configuration
- [x] **App Name**: Smart Teacher Schedule AI
- [x] **Tagline**: Dạy đúng giờ – Làm đúng việc – Không bỏ sót
- [x] **Application ID / Package Name**: `com.smartteacher.schedule`
- [x] **Version Name**: `1.0.0`
- [x] **Version Code**: `1`
- [x] **Target SDK**: `36` (Android 16 - exceeds Google Play requirements)
- [x] **Min SDK**: `26` (Android 8.0 Oreo - modern, clean, desugaring/native java.time)
- [x] **Adaptive Launcher Icon**: Defined with foreground, background, and mipmap XMLs

## 2. Permissions Compliance (Google Play Policies)
- [x] `POST_NOTIFICATIONS`: Requested at runtime with pedagogical in-context explanation.
- [x] `SCHEDULE_EXACT_ALARM`: Declared and checked with `AlarmManager.canScheduleExactAlarms()`. Graceful fallback to `setAndAllowWhileIdle()` if ungranted.
- [x] `RECEIVE_BOOT_COMPLETED`: Handled by `BootCompletedReceiver` to restore alarms upon restart.
- [x] `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`: Documented in Notification Reliability Center; does NOT force user indiscriminately.
- [x] No unauthorized SMS, call log, or personal message scraping permissions.

## 3. Background Reliability & Architecture
- [x] Dual-reminder logic (60-minute and 15-minute alerts before each class).
- [x] Lock-screen visibility & Heads-up notification channels configured.
- [x] Auto-reschedule on reboot, timezone shift, and system time changes.
- [x] OEM Battery Optimization Center with direct intents for Samsung, Xiaomi, OPPO, Vivo, Huawei.

## 4. Third-Party Integrations
- [x] **Google Calendar**: Minimal scopes, conflict resolution dialog, two-way sync architecture.
- [x] **Telegram**: Official Bot API via HTTP POST, token secured via Keystore/preferences.
- [x] **Zalo**: 100% compliant with Zalo Official Account OpenAPI (no private chat scraping).
- [x] **Gemini AI**: Grounded in real Room database events to eliminate hallucinations.

## 5. Artifacts
- [x] Debug APK (`assembleDebug`)
- [x] Release Android App Bundle (`bundleRelease`)
- [x] Proguard/R8 rules verified for Room, Gson, and Coroutines.
