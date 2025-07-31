# Loading System Usage Guide

## How Loading Works Now

The loading system has been optimized to only show when actually needed:

### 1. Automatic Loading (React Suspense)
- **When**: Only when lazy-loaded components are actually being loaded for the first time
- **Where**: Handled automatically by React Suspense + EnhancedPageLoader
- **Appears**: Only during initial page loads when components need to be fetched

### 2. Manual Loading (For API calls, etc.)
Use the `useManualLoading` hook for async operations:

```typescript
import { useManualLoading } from '@/hooks/useManualLoading';

const MyComponent = () => {
  const { showLoading, hideLoading } = useManualLoading();

  const handleSaveData = async () => {
    showLoading('Saving changes...');
    try {
      await api.saveData();
      // Success!
    } catch (error) {
      // Handle error
    } finally {
      hideLoading(); // Always hide loading
    }
  };

  return (
    <button onClick={handleSaveData}>
      Save Data
    </button>
  );
};
```

## What Was Fixed

### ❌ Before (Problematic)
- Loading showed on EVERY route change
- Got stuck on authentication pages  
- Interfered with normal navigation
- Showed loading even when pages were already loaded

### ✅ After (Fixed)
- Loading only shows for actual component loading (Suspense)
- Manual loading for API calls and async operations
- No interference with authentication or navigation
- Smooth, fast experience

## Available Components

- **LoadingCircle**: The fast-progressing circle (0.6s to complete)
- **LoadingOverlay**: Full-screen loading with AURA branding
- **EnhancedPageLoader**: Used by Suspense for lazy component loading
- **useManualLoading**: Hook for triggering loading manually

## Best Practices

1. **Don't trigger loading for navigation** - React Suspense handles this
2. **Do use manual loading for API calls** - Shows user something is happening
3. **Always use try/finally** - Ensure loading is hidden even on errors
4. **Use descriptive messages** - "Saving changes..." instead of "Loading..."