#!/bin/bash
# Script to remove unnecessary documentation files

echo "🧹 Removing unnecessary .md files..."

# Keep these important files
# README.md - usually needed
# SETUP_INSTRUCTIONS.md - might be useful
# BACKEND_CONFIGURATION.md - might be useful

# Remove fix summaries and temporary docs
rm -f 6_SLIDES_CONTENT.md
rm -f ACTUAL_FIX_APPLIED.md
rm -f AI_CHAT_FIX_SUMMARY.md
rm -f AI_INTEGRATION_SUMMARY.md
rm -f ANALYTICS_INTEGRATION_SUMMARY.md
rm -f CHAT_API_FIX_SUMMARY.md
rm -f COMPONENT_VERIFICATION_SUMMARY.md
rm -f DYNAMIC_RECOMMENDATIONS_FIX.md
rm -f GEMINI_API_SETUP_GUIDE.md
rm -f GEMINI_CHAT_400_FIX.md
rm -f GEMINI_INTEGRATION_SUMMARY.md
rm -f GEMINI_MIGRATION_GUIDE.md
rm -f GEMINI_MODEL_404_FIX.md
rm -f GEMINI_SETUP_INSTRUCTIONS.md
rm -f GRACEFUL_FALLBACK_IMPLEMENTATION.md
rm -f POWERPOINT_SLIDES.md
rm -f PRESENTATION_FEATURES.md
rm -f QUICK_FIX_SUMMARY.md
rm -f RUNTIME_ERROR_FIX.md
rm -f SINGLE_RECOMMENDATION_FIX_COMPLETE.md
rm -f SINGLE_RECOMMENDATION_IMPLEMENTATION.md
rm -f TESTING_ANALYTICS_INTEGRATION.md

echo "✅ Cleanup complete!"

