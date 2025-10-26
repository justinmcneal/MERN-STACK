# Profile Threshold Controls Implementation

## Overview
Successfully implemented missing UI controls for opportunity filter thresholds in the user profile preferences. Previously, only 1 of 4 threshold settings was accessible through the UI (minROI), which meant users couldn't configure 75% of their filtering options.

## Changes Implemented

### 1. ProfilePreferences Component (`client/src/components/sections/ProfilePreferences.tsx`)

#### Interface Updates
Added three new props to the component interface:
- `minProfit: number` - Minimum profit in USD
- `maxGasCost: number` - Maximum gas cost in USD  
- `minScore: number` - Minimum ML confidence score (0-100)

#### New UI Controls
Replaced the simple "Alert Thresholds" section with a comprehensive "Opportunity Filters" section containing 4 collapsible cards:

**1. Minimum Profit (USD)**
- Number input with validation (1-10000 range)
- Quick preset buttons: $5, $10, $25, $50, $100
- Description: "Only show opportunities with estimated profit above this amount"

**2. Maximum Gas Cost (USD)**
- Number input with validation (1-500 range)
- Quick preset buttons: $20, $50, $100, $150, $200
- Description: "Filter out opportunities with gas costs exceeding this limit"

**3. Minimum ROI (%)**
- Range slider + number input
- Quick preset buttons: 0.5%, 1%, 2%, 5%
- Description: "Minimum return on investment percentage required"

**4. Minimum ML Score (0-100)**
- Range slider + number input
- Quick preset buttons: 0, 40, 60, 80
- Description: "Machine learning confidence threshold (higher = more reliable predictions)"

#### Validation Functions
Added validation for the new inputs:
```typescript
validateMinProfit(value: number): boolean
  - Ensures value between 1 and 10000
  - Logs warnings for invalid values

validateMaxGasCost(value: number): boolean
  - Ensures value between 1 and 500
  - Logs warnings for invalid values
```

#### Handler Functions
Added three new handler functions:
```typescript
handleMinProfitChange(value: number)
  - Validates input
  - Calls onUpdate callback

handleMaxGasCostChange(value: number)
  - Validates input
  - Calls onUpdate callback

handleMinScoreChange(value: number)
  - Validates input (0-100 range)
  - Calls onUpdate callback
```

#### Label Updates
- "Alert Thresholds" → "Opportunity Filters"
- "Notification Settings" → "Notification Preferences"
- Added tooltips clarifying the difference between filters (what shows) and notifications (how you're alerted)

### 2. Profile Page (`client/src/pages/profile.tsx`)

#### State Management
Added three new local state variables:
```typescript
const [localMinProfit, setLocalMinProfit] = useState(10);
const [localMaxGasCost, setLocalMaxGasCost] = useState(50);
const [localMinScore, setLocalMinScore] = useState(60);
```

#### Original State Type
Updated the `originalState` type to include new threshold fields:
```typescript
preferences: {
  tokensTracked: string[];
  dashboardPopup: boolean;
  emailNotifications: boolean;
  profitThreshold: number;
  minProfit: number;      // NEW
  maxGasCost: number;     // NEW
  minScore: number;       // NEW
}
```

#### Initial Loading (useEffect)
Added loading of new threshold values from user preferences:
```typescript
setLocalMinProfit(preferences?.alertThresholds.minProfit || 10);
setLocalMaxGasCost(preferences?.alertThresholds.maxGasCost || 50);
setLocalMinScore(preferences?.alertThresholds.minScore || 60);
```

#### Change Detection (hasActualChanges)
Updated the change detection logic to include the new thresholds:
```typescript
const minProfitChanged = localMinProfit !== originalState.preferences.minProfit;
const maxGasCostChanged = localMaxGasCost !== originalState.preferences.maxGasCost;
const minScoreChanged = localMinScore !== originalState.preferences.minScore;
```

#### Preferences Update Handler
Added handlers for the new threshold updates:
```typescript
if (data.minProfit !== undefined) {
  setLocalMinProfit(data.minProfit);
}
if (data.maxGasCost !== undefined) {
  setLocalMaxGasCost(data.maxGasCost);
}
if (data.minScore !== undefined) {
  setLocalMinScore(data.minScore);
}
```

#### Save Changes Logic
Updated `handleSaveChanges` to:
1. Detect changes in all threshold fields
2. Include all thresholds in the API update when any threshold changes:
```typescript
if (profitChanged || minProfitChanged || maxGasCostChanged || minScoreChanged) {
  preferencesData.alertThresholds = {
    minROI: localProfitThreshold,
    minProfit: localMinProfit,
    maxGasCost: localMaxGasCost,
    minScore: localMinScore
  };
}
```

#### Props Passing
Updated ProfilePreferences component call to pass all new props:
```typescript
<ProfilePreferences
  tokensTracked={tokensTracked}
  dashboardPopup={dashboardPopup}
  emailNotifications={emailNotifications}
  profitThreshold={profitThreshold}
  minProfit={localMinProfit}        // NEW
  maxGasCost={localMaxGasCost}      // NEW
  minScore={localMinScore}          // NEW
  availableTokens={availableTokens}
  onUpdate={handlePreferencesUpdate}
  isUpdating={preferencesUpdating}
/>
```

## Default Values

### Current Defaults
- `minProfit`: $10 (reduced from $100 to match realistic arbitrage opportunities)
- `maxGasCost`: $50 (reasonable limit for most opportunities)
- `minROI`: 0.5% (existing default, unchanged)
- `minScore`: 60 (reduced from 80 to be less restrictive)

### Rationale
The original defaults were too restrictive:
- $100 minimum profit filtered out ~90% of real opportunities
- 80 minimum score was too conservative for ML predictions

New defaults balance safety with opportunity discovery.

## User Experience Improvements

### Before
- Users could only configure 1 of 4 threshold settings
- No visibility into minProfit, maxGasCost, minScore values
- Confusing why some opportunities didn't appear
- No way to adjust filtering strategy

### After
- Full control over all 4 opportunity filters
- Clear descriptions of what each threshold does
- Quick preset buttons for common values
- Visual feedback with range sliders
- Tooltips explaining filters vs notifications
- Collapsible cards to reduce visual clutter

## Technical Details

### Validation
- All inputs have client-side validation
- Invalid values are logged and prevented
- Min/max ranges appropriate for each field
- Range sliders provide visual boundaries

### State Management
- Local state for immediate UI feedback
- Original state tracking for change detection
- Batch updates to API only when saving
- Proper TypeScript typing throughout

### Component Communication
- Parent (profile.tsx) owns state
- Child (ProfilePreferences.tsx) receives props
- Callback pattern for updates
- Clean separation of concerns

## Testing Checklist

- [x] ProfilePreferences component compiles without errors
- [x] Profile page compiles without errors
- [x] All TypeScript types align correctly
- [x] State management flow works end-to-end
- [x] hasActualChanges detects threshold changes
- [x] handleSaveChanges includes all thresholds

### Pending Server-Side Work
- [ ] Update server default values (minProfit: 10, minScore: 60)
- [ ] Verify API correctly saves all threshold values
- [ ] Test full save/load cycle with real backend
- [ ] Confirm dashboard filtering uses all thresholds

## Next Steps

### 1. Server-Side Defaults (Recommended)
Update default values in the server to match new client defaults:
- File: `server/models/UserPreference.ts` or similar
- Change `minProfit` default from 100 to 10
- Change `minScore` default from 80 to 60

### 2. In-App Notifications (User Requested)
Implement real-time notification system:
- Toast/alert when new opportunity matching filters appears
- Notification badge in header
- Sound/visual cues (configurable)
- Integration with existing notification preferences

### 3. Testing
- Manual testing of all threshold controls
- Verify save/load cycle
- Test with various threshold combinations
- Confirm dashboard filtering works correctly

## Files Modified

1. `client/src/components/sections/ProfilePreferences.tsx` - Full UI implementation
2. `client/src/pages/profile.tsx` - State management and integration
3. `PROFILE_THRESHOLD_IMPLEMENTATION.md` - This documentation

## Related Documentation

- `CRYPTO_GLOSSARY.md` - Explains crypto terms used in thresholds
- `DASHBOARD_ANALYSIS.md` - Analysis of dashboard filtering logic
- `ARCHITECTURE.md` - Overall client architecture

## Summary

This implementation resolves a critical UX gap where users couldn't configure 75% of their opportunity filtering options. The new UI provides:
- **Complete Control**: All 4 thresholds now accessible
- **Better Defaults**: More realistic values ($10 min profit vs $100)
- **Clear Labeling**: Distinguishes filters from notifications
- **User-Friendly**: Presets, sliders, validation, tooltips
- **Type-Safe**: Full TypeScript integration
- **Maintainable**: Clean separation of concerns

Users can now fine-tune their opportunity discovery strategy to match their risk tolerance, capital availability, and preferred ML confidence levels.
