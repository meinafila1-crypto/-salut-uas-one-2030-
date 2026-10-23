# Security Specification: SALUT UAS ONE 2030

## 1. Data Invariants
- Admin collection (`/admins/{adminId}`) defines administrative privileges. Bootstrap admin: `meinafila1@gmail.com`.
- Public students can inspect `/settings/registrationPeriod` to know operational status and announcements.
- Public students can read `/examSlots/{slotId}` to view available official dates, sessions, locations, and capacity.
- Public students can create registrations in `/registrations/{registrationId}` only with valid fields, proper string lengths, and initial status "Terdaftar".
- Public students CANNOT list the `/registrations` collection. Only authenticated admins can list and export registrations.
- Only admins can modify `/settings` and delete/update registrations (e.g., mark verified or canceled).
- Slot capacity can only be incremented during registration.

## 2. The Dirty Dozen Payloads (Blocked by Rules)
1. Ghost field injection in registration (e.g., `isAdmin: true` or `bypassedQuota: true`).
2. Public attempting to `list` all student registrations.
3. Non-admin attempting to alter registration status to "Dibatalkan" or change another student's record.
4. Non-admin attempting to delete or alter `/settings/registrationPeriod`.
5. Non-admin attempting to grant themselves an `/admins/{uid}` document.
6. Registration payload with missing required fields (e.g. missing `nim` or `slotId`).
7. Registration payload with oversized strings (e.g. 50KB string in `fullName` or `nim`).
8. Spoofed unverified email claiming admin privileges.
9. Attempting to set an initial status other than "Terdaftar".
10. Decrementing slot registeredCount without admin authorization.
11. Exceeding slot capacity beyond max.
12. Attempting arbitrary field updates on exam slots by unauthenticated users.
