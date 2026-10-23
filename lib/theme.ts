// Design tokens. Default/primary/secondary/success/warning/danger scales,
// same structure as a standard design-system kit, filled with the
// TryEntitle brand hues instead of generic blue/purple.
export const colors = {
  layout: {
    background: '#f6f5f3',
    surface: '#ffffff',
    divider: '#ececea',
    focus: '#e16e38',
    overlay: 'rgba(41, 41, 40, 0.45)',
  },
  content: {
    primary: '#292928',
    secondary: '#6a6a67',
    muted: '#8a8a87',
    inverse: '#f6f5f3',
  },
  default: {
    50: '#f6f5f3',
    100: '#ececea',
    200: '#d8d7d4',
    300: '#b8b7b3',
    400: '#8a8a87',
    500: '#6a6a67',
    600: '#4a4a47',
    700: '#3a3a37',
    800: '#292928',
    900: '#1c1c1b',
  },
  primary: {
    // teal
    50: '#eef5f5',
    100: '#d7e8e9',
    200: '#b0d1d3',
    300: '#85b8bc',
    400: '#5a9ba0',
    500: '#2f6b72',
    600: '#255459',
    700: '#1d4247',
    800: '#163237',
    900: '#0f2225',
  },
  secondary: {
    // orange — the brand accent
    50: '#fdf1ea',
    100: '#fbdcc7',
    200: '#f6b98e',
    300: '#f09660',
    400: '#e8813f',
    500: '#e16e38',
    600: '#b9541f',
    700: '#943f17',
    800: '#6e2e10',
    900: '#4a1f0b',
  },
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    500: '#10b981',
    600: '#047857',
    700: '#065f46',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#d97706',
    600: '#b45309',
    700: '#92400e',
  },
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#dc2626',
    600: '#b91c1c',
    700: '#991b1b',
  },
  // order status -> semantic color, reused by StatusBadge, DonutChart and
  // anywhere else that renders an order's status. Customer-activity
  // statuses (active/inactive) share the same map — distinct keys, so no
  // collision with the order-status ones above.
  status: {
    new: '#4338ca',
    'in progress': '#c2410c',
    completed: '#047857',
    cancelled: '#b91c1c',
    active: '#b9541f',
    inactive: '#4a4a47',
    live: '#047857',
    draft: '#4a4a47',
    paid: '#047857',
    'in transit': '#b9541f',
  } as Record<string, string>,
}

// Below this width AppShell collapses the sidebar into an off-canvas drawer.
export const breakpoints = {
  mobile: 860,
}
