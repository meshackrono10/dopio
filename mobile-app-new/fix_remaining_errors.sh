#!/bin/bash

# Fix remaining errors
echo "=== Fixing Remaining Errors ==="

# 1. Fix colors.background.dark/light -> use neutral colors
echo "Fixing colors.background.dark and colors.background.light..."
find src -name "*.tsx" -type f -exec sed -i 's/colors\.background\.dark/colors.neutral[900]/g' {} \;
find src -name "*.tsx" -type f -exec sed -i 's/colors\.background\.light/colors.neutral[50]/g' {} \;

# 2. Fix isDarkMode -> isDark
echo "Fixing isDarkMode -> isDark..."
find src -name "*.tsx" -type f -exec sed -i 's/isDarkMode/isDark/g' {} \;

echo "=== All fixes completed! ==="
