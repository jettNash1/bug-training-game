# Quiz Timer Settings Migration

This document explains the standardization of quiz timer settings naming throughout the application.

## Background

Previously, the application had inconsistent naming for quiz timer settings:

- In the admin routes (`backend/routes/admin.js`), timer settings were stored with the key `quizTimer` and used the property `secondsPerQuestion` for the default timer value.
- In the user routes (`backend/routes/users.js`), timer settings were retrieved with the key `quizTimerSettings` and used the property `defaultSeconds`.
- The frontend expected the property names to be in the format from the user routes.

This inconsistency led to issues where quiz timers might be set to 60 seconds in the admin interface but appear as 30 seconds in the actual quizzes due to the naming mismatch.

## Standardization

We have standardized the naming throughout the application:

1. All settings now use the database key `quizTimerSettings` (instead of `quizTimer`).
2. Default timer values use the property name `defaultSeconds` (instead of `secondsPerQuestion`).
3. All API endpoints and frontend code have been updated to use these consistent names.

## Migration

A migration script has been created to update existing database records to the new format:

1. It looks for settings with the old key `quizTimer`
2. Converts them to use the new key `quizTimerSettings` and property name `defaultSeconds`
3. Creates a backup of the old settings
4. Removes the old settings to prevent confusion

### Running the Migration

To run the migration script:

1. Ensure MongoDB is running and properly configured in your `.env` file
2. Navigate to the backend directory: `cd backend`
3. Run the script: `node migrate-timer-settings.js`

Example output:
```
Connecting to MongoDB...
Connected to MongoDB
Found legacy timer settings:
{
  "secondsPerQuestion": 60,
  "quizTimers": {
    "communication": 45,
    "tester-mindset": 90
  }
}
Creating new settings with migrated data...
New settings created successfully
Creating backup of old settings...
Backup created successfully
Deleting old settings...
Old settings deleted successfully
Migration completed successfully!
Migration process completed
```

## Testing

After migration, verify that:
1. The admin dashboard correctly displays timer settings
2. Quiz timers work correctly on quiz pages, with the expected default value of 60 seconds (or whatever was configured)
3. Quiz-specific timer settings override the default timer correctly

## Reverting (if needed)

If issues arise, restore from the backup:
1. Use MongoDB Compass or a similar tool to:
   - Copy values from the `quizTimer_backup` document
   - Create a new document with the key `quizTimer` 
   - Paste the backup values

## Files Changed

The following files were updated to ensure consistent naming:

1. `backend/routes/admin.js`: Updated API endpoints to use `quizTimerSettings` and `defaultSeconds`
2. `frontend/api-service.js`: Updated API calls to use consistent property names
3. `frontend/admin2.js`: Updated admin UI to use standardized naming
4. New files:
   - `backend/migrate-timer-settings.js`: Migration script
   - `backend/TIMER_MIGRATION.md`: This documentation

---

For questions or issues, contact the development team. 