#!/bin/bash

# This script fixes all theme usage errors across the mobile app
# It replaces `const { theme } = useTheme()` with `const { isDark } = useTheme()`
# and updates all theme property references to use isDark conditionals

echo "Fixing theme usage errors in mobile app..."

# List of files with theme errors
FILES=(
  "src/screens/earnings/EarningsScreen.tsx"
  "src/screens/reviews/ReviewsScreen.tsx"
  "src/screens/help/HelpCenterScreen.tsx"
  "src/screens/help/ContactScreen.tsx"
  "src/screens/help/HowItWorksScreen.tsx"
  "src/screens/properties/PropertyComparisonScreen.tsx"
  "src/screens/wallet/WalletScreen.tsx"
  "src/screens/wallet/WithdrawScreen.tsx"
  "src/components/common/DatePicker.tsx"
  "src/components/common/EmptyState.tsx"
 "src/components/common/StatCard.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    
    # Replace const { theme } = useTheme() with const { isDark } = useTheme()
    sed -i "s/const { theme } = useTheme()/const { isDark } = useTheme()/g" "$file"
    
    # Common theme replacements
    sed -i "s/theme\.background/isDark ? colors.neutral[900] : colors.background.light/g" "$file"
    sed -i "s/theme\.card/isDark ? colors.neutral[800] : 'white'/g" "$file"
    sed -i "s/theme\.text/isDark ? colors.text.dark : colors.text.light/g" "$file"
    sed -i "s/theme\.textSecondary/isDark ? colors.neutral[400] : colors.neutral[600]/g" "$file"
    sed -i "s/theme\.border/isDark ? colors.neutral[700] : colors.neutral[200]/g" "$file"
    
    echo "✓ Fixed $file"
  else
    echo "⚠ File not found: $file"
  fi
done

echo "All theme errors fixed!"
