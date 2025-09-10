// Accessibility utilities for better focus management

export const accessibilityProps = {
  // Common accessibility props for buttons
  button: {
    accessibilityRole: 'button' as const,
    accessibilityHint: 'Double tap to activate',
  },
  
  // Common accessibility props for scrollable content
  scrollView: {
    accessibilityRole: 'scrollbar' as const,
    accessibilityLabel: 'Scrollable content',
  },
  
  // Common accessibility props for cards
  card: {
    accessibilityRole: 'button' as const,
    accessibilityHint: 'Double tap to select',
  },
  
  // Common accessibility props for text inputs
  textInput: {
    accessibilityRole: 'text' as const,
    accessibilityLabel: 'Text input',
  },
  
  // Common accessibility props for images
  image: {
    accessibilityRole: 'image' as const,
    accessibilityLabel: 'Image',
  },
}

// Helper function to create accessible button props
export const createAccessibleButton = (label: string, hint?: string) => ({
  ...accessibilityProps.button,
  accessibilityLabel: label,
  accessibilityHint: hint || accessibilityProps.button.accessibilityHint,
})

// Helper function to create accessible card props
export const createAccessibleCard = (label: string, hint?: string) => ({
  ...accessibilityProps.card,
  accessibilityLabel: label,
  accessibilityHint: hint || accessibilityProps.card.accessibilityHint,
})

// Focus management utilities
export const focusManagement = {
  // Prevent focus on hidden elements
  preventFocusOnHidden: {
    pointerEvents: 'none' as const,
    accessibilityElementsHidden: true,
  },
  
  // Ensure proper focus management
  ensureFocusable: {
    accessibilityElementsHidden: false,
    importantForAccessibility: 'yes' as const,
  },
}
