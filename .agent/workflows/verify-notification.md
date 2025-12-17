---
description: Verify Notification Workflow via CLI
---

1. Create a checklist for verification.
2. Ensure you have a Manager user (role=MANAGER) and an Employee user (role=EMPLOYEE).
3. Ensure the Employee has `managerId` set to the Manager's ID.
4. Ensure the Employee has an Onboarding plan.
5. Manually complete all tasks for the employee using `prisma.userTask.update`.
6. Trigger the `PATCH` logic (or simulate it) to see if `prisma.notification.create` is called.
