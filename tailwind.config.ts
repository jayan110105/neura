import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
import tailwindcssAnimate from "tailwindcss-animate";
import typography from "@tailwindcss/typography";

export default {
    darkMode: ["class"],
    content: ["./src/**/*.tsx"],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: [
  				'var(--font-geist-sans)',
                    ...fontFamily.sans
                ]
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
		  keyframes: {
			'grow-shrink': {
			  '0%, 100%': { transform: 'scale(1)', opacity: '1' },
			  '50%': { transform: 'scale(1.2)', opacity: '0.7' },
			},
		  },
		  animation: {
			'grow-shrink': 'grow-shrink 1.4s ease-in-out infinite',
		  },
		  typography: (theme: (path: string) => string) => ({
			DEFAULT: {
			  css: {
				"--tw-prose-links": "#d1d1d1",
				"--tw-prose-bold": "#d1d1d1",
				"--tw-prose-body": "#d1d1d1",
				h1: {
				  fontSize: theme('fontSize.2xl'),
				  fontWeight: theme('fontWeight.bold'),
				  marginBottom: theme('spacing.4'),
				  marginTop: theme('spacing.0'),
				},
				h2: {
				  fontSize: theme('fontSize.xl'),
				  fontWeight: theme('fontWeight.semibold'),
				  marginBottom: theme('spacing.2'),
				  marginTop: theme('spacing.0'),
				},
				h3: {
				  fontSize: theme('fontSize.lg'),
				  fontWeight: theme('fontWeight.medium'),
				  marginBottom: theme('spacing.1'),
				  marginTop: theme('spacing.0'),
				},
				hr: {
				  marginBottom: theme('spacing.2'),
				  marginTop: theme('spacing.2'),
				},
				ul:{
					marginBottom: theme('spacing.2'),
				},
			  },
			},
		}),
  	}
  },
  plugins: [tailwindcssAnimate, typography],
} satisfies Config;
