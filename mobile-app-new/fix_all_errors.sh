#!/bin/bash

# Comprehensive TypeScript Error Fix Script
echo "=== Fixing All TypeScript Errors ==="

# 1. Fix colors.text.lightSecondary -> colors.neutral[500]
echo "Fixing colors.text.lightSecondary references..."
find src -name "*.tsx" -type f -exec sed -i 's/colors\.text\.lightSecondary/colors.neutral[500]/g' {} \;

# 2. Fix @react-navigation/native-stack imports -> @react-navigation/stack
echo "Fixing navigation stack imports..."
find src -name "*.tsx" -type f -exec sed -i "s/@react-navigation\/native-stack/@react-navigation\/stack/g" {} \;

# 3. Fix navigation.navigate type issues by using 'as any' temporarily
echo "Note: Navigation type issues will need manual review"

echo "=== Basic fixes completed! ==="
