# WP01 follow-up validation checklist

Complete this checklist before merging the associated corrective pull request.

- [ ] `npm install`
- [ ] `npm run type-check`
- [ ] `npm run test`
- [ ] `npm run build`
- [ ] Production preview starts successfully.
- [ ] Direct `/dev` navigation reports `Registering` before completion when applicable.
- [ ] `/dev` updates to `Registered` after successful Service Worker registration.
- [ ] Registration rejection does not prevent application startup.
- [ ] No Cache Storage or offline fallback was introduced.
- [ ] No Firebase or authentication behavior was introduced.
