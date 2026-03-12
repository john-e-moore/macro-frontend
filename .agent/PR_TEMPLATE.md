# Pull Request Template

Use this template for feature and substantial refactor PRs.
Keep it concise, product-aware, and evidence-based.

## Summary

- What changed for end users?
- Why was this needed now?

## Links

- Branch: `<feature-branch-name>`
- Feature brief: `.agent/features/<YYYY-MM-DD>-<feature-name>/SPEC.md` or `N/A`
- ExecPlan entry: `.agent/PLANS.md` (`<plan title>`)
- `.cursor` plan: `.cursor/plans/<plan-file>.md` or `N/A`

## Scope and Non-Goals

- In scope:
- Not in scope:

## User Workflow Impact

- Entry point:
- Happy path:
- Empty/error states:
- Backward compatibility notes:

## Acceptance Criteria Mapping

- [ ] Criterion 1:
- [ ] Criterion 2:
- [ ] Criterion 3:

## Validation Evidence

- [ ] Lint passed
- [ ] Typecheck passed
- [ ] Tests passed
- [ ] Manual UX verification completed or explicitly documented

Commands and key outputs:

```text
# Example:
npm run lint
npm run typecheck
npm test
```

## API and Data Contract Impact

- New or changed endpoints:
- Query parameter changes:
- Response shape changes:
- Metric/catalog implications:

## Visual and UX Notes

- Screens changed:
- Accessibility considerations:
- Mobile/responsive considerations:
- Chart or export behavior:

## Operational Notes

- Environment variable changes:
- Caching or freshness impact:
- Monitoring/logging impact:
- Rollback plan:

## Security and Privacy Checks

- [ ] No secrets committed
- [ ] No unsafe client-side data access added
- [ ] User input is validated server-side
- [ ] Any new third-party dependency was justified

## Risks and Follow-Ups

- Known risks:
- Follow-up tasks:
