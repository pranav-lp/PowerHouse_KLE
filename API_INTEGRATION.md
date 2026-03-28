# API Integration Documentation

## Webhook Endpoint
```
POST https://ljk-cp.app.n8n.cloud/webhook-test/health-intelligence
```

## JSON Payload Structure

The application sends a JSON payload in the following exact format when the user completes the health questionnaire:

```json
{
  "userId": "user_1234567890",
  "age": 35,
  "gender": "male",
  "weight": 75,
  "height": 175,
  "waist": 85,
  "sleep": 7,
  "steps": 8000,
  "exercise": "3+_per_week",
  "diet_quality": "moderate",
  "diet_pattern": "mixed",
  "alcohol": "occasional",
  "smoking_type": "non_smoker",
  "cigarettes_per_day": null,
  "years_smoked": null,
  "job": "desk_job",
  "stress": "medium",
  "screen_time": 8,
  "family_history": [
    "diabetes",
    "heart_disease"
  ],
  "medical_history": [
    "hypertension"
  ]
}
```

## Field Specifications

### Basic Info
- **userId**: `string` - Auto-generated unique identifier
- **age**: `number` - User's age (18-100)
- **gender**: `"male" | "female"` - User's gender

### Body Metrics
- **weight**: `number` - Weight in kilograms (40-200)
- **height**: `number` - Height in centimeters (140-220)
- **waist**: `number` - Waist circumference in centimeters (50-150)

### Lifestyle
- **sleep**: `number` - Average hours of sleep per night (3-12)
- **steps**: `number` - Average daily steps (1000-20000)

### Exercise
- **exercise**: `"none" | "1-2_per_week" | "3+_per_week"` - Exercise frequency

### Diet
- **diet_quality**: `"healthy" | "moderate" | "unhealthy"` - Overall diet quality
- **diet_pattern**: `"vegetarian" | "mixed" | "processed"` - Diet pattern type

### Habits
- **alcohol**: `"none" | "occasional" | "moderate" | "heavy"` - Alcohol consumption
- **smoking_type**: `"non_smoker" | "smoker" | "ex_smoker"` - Smoking status
- **cigarettes_per_day**: `number | null` - Cigarettes per day (only if smoker)
- **years_smoked**: `number | null` - Years smoked (only if ex_smoker)

### Work & Mental Health
- **job**: `"student" | "desk_job" | "driver" | "construction" | "physical_labor"` - Job type
- **stress**: `"low" | "medium" | "high"` - Stress level
- **screen_time**: `number` - Daily screen time in hours (1-16)

### Medical History
- **family_history**: `Array<"diabetes" | "heart_disease" | "hypertension" | "lung_disease">` - Family health conditions (can be empty array)
- **medical_history**: `Array<"diabetes" | "hypertension" | "heart_condition" | "lung_condition" | "mental_health_condition">` - Personal health conditions (can be empty array)

## Implementation Details

### When Data is Sent
Data is automatically POSTed to the webhook when the user clicks "Generate Analysis" on the final step (Medical History page).

### Request Headers
```javascript
{
  "Content-Type": "application/json"
}
```

### Error Handling
- If the webhook returns an error, the user sees an error message but can still proceed to view their dashboard
- All submissions are logged to the browser console for debugging
- The app displays a loading spinner during submission

### Console Logging
Check the browser console to see:
- 📤 The exact JSON payload being sent
- ✅ Success confirmation
- 📥 Webhook response data
- ❌ Any errors that occur

## Testing

To test the integration:

1. Complete the 8-step questionnaire
2. Click "Generate Analysis" on the final step
3. Open browser DevTools (F12) → Console tab
4. Look for the logged JSON payload
5. Verify the data matches the structure above

## Notes

- The `userId` is auto-generated using a timestamp: `user_${Date.now()}`
- Conditional fields (`cigarettes_per_day`, `years_smoked`) are set to `null` when not applicable
- Arrays (`family_history`, `medical_history`) can be empty arrays `[]`
- All numeric fields are actual numbers, not strings
- All enum values are exactly as specified (case-sensitive)
