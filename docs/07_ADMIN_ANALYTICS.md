# Phase 7 — Admin + Funnel Analytics

## Goal

Operators can run the business without direct database edits and can evaluate field-marketing effectiveness.

## Admin MVP Pages

```text
/admin/products
/admin/bundles
/admin/orders
/admin/leads
/admin/campaigns
```

Minimum functionality:
- edit product inventory;
- activate/deactivate product;
- inspect bundle composition;
- view orders and details;
- view lead source/campaign;
- view campaign counts.

Avoid spending excessive MVP time on a polished admin UI.

## Analytics Events

Suggested:

```text
CAMPAIGN_PAGE_VIEW
LEAD_CREATED
PASS_CREATED
PASS_REDEEMED
FINDER_COMPLETED
BUNDLE_VIEWED
ADD_TO_CART
CHECKOUT_STARTED
ORDER_PAID
```

Possible table:

```text
AnalyticsEvent
- id
- sessionId
- campaignId (nullable)
- leadId (nullable)
- eventType
- metadataJson
- createdAt
```

Do not put sensitive personal data unnecessarily in `metadataJson`.

## Campaign Dashboard

Useful metrics:

```text
QR/landing visits
unique leads
passes issued
passes redeemed
Gift Finder completions
bundle views
add-to-cart count
checkout starts
paid orders
revenue
```

## AI Can Write

- CRUD admin pages;
- admin APIs;
- event-capture endpoint;
- aggregate SQL/repository queries;
- campaign dashboard;
- CSV export if time permits;
- tests.

## Human Must Do

- decide who receives admin access;
- inspect whether metrics match reality;
- define what counts as a unique visit/lead/order;
- review access control;
- use the data to make product/business decisions.

## Acceptance Criteria

- public customer cannot access admin APIs;
- inventory edit persists;
- order detail displays final item selections;
- leads do not expose more data than needed;
- campaign totals reconcile with raw rows;
- refreshing page does not create bogus duplicate business events where avoidable.

## How I Should Check

Take 5 synthetic customers through distinct paths:
1. scan only;
2. scan + lead;
3. scan + lead + redemption;
4. browse + cart;
5. purchase.

Then verify dashboard counts match expected values exactly.

## Common AI Mistakes to Catch

- admin protected only by hiding navigation;
- analytics events containing full request bodies;
- revenue calculated from client events rather than paid orders;
- double-counting refreshes as conversions.
