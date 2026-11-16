# Security Specification & Red-Team Verification

## 1. Data Invariants
1. **Owner-Only Admin Boundary**: Only a verified Google account matching `mee3955@gmail.com` (`request.auth.token.email_verified == true`) may mutate `site_settings`, `dispatches`, `resumes`, or `public_resume`, or read/manage `inquiries` and private `resumes`.
2. **PII Isolation**: Visitor emails/messages in `inquiries` and private drafts/memos in `resumes` are never readable by non-admin users.
3. **Public Resume Gate**: `public_resume/{docId}` is readable by visitors only when `resource.data.isVisible == true`; `list` is explicitly disabled.
4. **Draft Dispatch Gate**: `dispatches/{dispatchId}` can only be read or listed by non-admins when `resource.data.isPublished == true`.
5. **Sender Integrity**: `inquiries/{inquiryId}` requires `request.auth.uid == incoming().senderUid`, `email_verified == true`, initial `status == 'unread'`, and `createdAt == request.time`.
6. **Strict Schema & Size Limits**: Every write checks exact allowed keys (`hasAll` + `hasOnly`), string `.size()` bounds, regex-validated document IDs (`isValidId`), and `request.time` timestamp integrity.

## 2. Adversarial Test Vectors ("Dirty Dozen")
1. **Unverified Admin Email Spoof**: Token with `email: 'mee3955@gmail.com'` and `email_verified: false` attempts to read `/resumes` -> `PERMISSION_DENIED`.
2. **Non-Admin Reads Private Resumes**: Signed-in user `other@gmail.com` attempts `get` or `list` on `/resumes` -> `PERMISSION_DENIED`.
3. **Non-Admin Reads Inquiries**: Signed-in user `other@gmail.com` attempts `list` on `/inquiries` -> `PERMISSION_DENIED`.
4. **Non-Admin Reads Unpublished Dispatch**: Visitor queries `/dispatches` without `where('isPublished', '==', true)` or reads a draft doc -> `PERMISSION_DENIED`.
5. **Non-Admin Reads Hidden Public Resume**: Visitor fetches `/public_resume/current` when `isVisible == false` -> `PERMISSION_DENIED`.
6. **Visitor Lists Public Resume**: Visitor attempts `list` on `/public_resume` -> `PERMISSION_DENIED`.
7. **Shadow Field Injection on Inquiry**: Signed-in user sends extra field `isAdmin: true` to `/inquiries/{id}` -> `PERMISSION_DENIED`.
8. **Spoofed Inquiry Sender UID**: Signed-in user A sends `senderUid: 'user_B'` -> `PERMISSION_DENIED`.
9. **Inquiry Status Tampering on Create**: Signed-in user creates inquiry with `status: 'read'` -> `PERMISSION_DENIED`.
10. **Forged Timestamp on Create**: Client sends custom past timestamp instead of `serverTimestamp()` -> `PERMISSION_DENIED`.
11. **Oversized Document ID Poisoning**: Client writes to `/dispatches/<200-char-invalid-id>` -> `PERMISSION_DENIED`.
12. **Visitor Mutating Site Settings**: Non-admin user attempts `update` on `/site_settings/main` -> `PERMISSION_DENIED`.
