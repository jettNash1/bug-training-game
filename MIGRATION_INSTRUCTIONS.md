# Interview Account Migration Instructions

## Overview
This migration converts all `interview_candidate` accounts to `regular` accounts and removes all interview account logic from the system.

## What the Migration Does

1. **Database Changes:**
   - Finds all users with `userType: 'interview_candidate'`
   - Converts their `userType` to `'regular'`
   - Converts their `allowedQuizzes` to `hiddenQuizzes` (inverted logic)
   - Preserves all quiz progress and user data

2. **Code Changes:**
   - Removes interview account logic from frontend and backend
   - Simplifies all quiz visibility to use `hiddenQuizzes` only
   - Removes timer functionality (was interview-only)
   - Updates admin interface to show only regular/admin account types

## How to Run the Migration

### Option 1: Direct Node.js
```bash
cd backend
node migrate-interview-to-regular.js
```

### Option 2: Using npm script (if you add it to package.json)
```bash
npm run migrate-interviews
```

## Before Running Migration

1. **Backup your database** - this is important!
2. Make sure your MongoDB connection string is correct in your environment
3. Test on a development environment first if possible

## After Migration

1. All former interview accounts will work as regular accounts
2. Their quiz visibility will be preserved (what was allowed becomes visible)
3. The admin interface will be simpler and more consistent
4. No more interview account creation options

## Example Migration Output

```
🔄 Starting migration of interview accounts to regular accounts...

📊 Found 3 interview accounts to migrate:
  - JustinHewess (allowed: 6 quizzes)
  - TestUser1 (allowed: 4 quizzes)
  - TestUser2 (allowed: 8 quizzes)

🔄 Migrating JustinHewess...
  - Allowed quizzes (6): tester-mindset, communication, initiative, standard-script-testing, fully-scripted, exploratory
  - Will hide quizzes (19): automation-interview, build-verification, cms-testing, email-testing, content-copy, locale-testing, script-metrics-troubleshooting, test-types-tricks, sanity-smoke, functional-interview, risk-analysis, risk-management, non-functional, test-support, issue-verification, issue-tracking-tools, raising-tickets, reports, time-management
  ✅ JustinHewess migrated successfully

🎉 All interview accounts successfully migrated to regular accounts!

📋 Migration Summary:
  - Converted 3 interview accounts to regular accounts
  - Each account's visible quizzes are now controlled by hiddenQuizzes array
  - allowedQuizzes arrays are preserved but no longer used
```

## Rollback

If you need to rollback:
1. Restore from database backup
2. Revert the code changes using git

The migration script preserves the original `allowedQuizzes` data, so you could theoretically write a reverse migration script if needed. 