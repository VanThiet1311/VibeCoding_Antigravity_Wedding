import type { ThemeConfig } from 'antd';

/**
 * Centralized styling tokens for Ant Design
 * Follows the wedding elegant palette rules:
 * - Primary: rose/pink (#E11D48)
 * - Secondary: champagne (#F7E7CE)
 * - Accent: gold (#C9A227)
 * - Neutral: warm gray
 */
export const weddingTheme: ThemeConfig = {
    token: {
        colorPrimary: '#E11D48',
        colorInfo: '#C9A227',
        colorSuccess: '#A1B59C', // muted sage green
        colorTextBase: '#4b5563', // warm gray 600
        colorBgBase: '#FDFBF7', // slight champagne off-white
        borderRadius: 8,
        fontFamily: 'var(--font-inter), sans-serif',
    },
    components: {
        Button: {
            colorPrimary: '#E11D48',
            colorPrimaryHover: '#BE123C',
            colorPrimaryActive: '#9F1239',
            borderRadius: 8,
            controlHeight: 40,
        },
        Card: {
            colorBgContainer: '#ffffff',
            borderRadiusLG: 16,
            boxShadowTertiary: '0 10px 40px -10px rgba(0,0,0,0.06)', // soft shadow rule
        },
        Input: {
            controlHeight: 40,
            borderRadius: 8,
            colorBorder: '#e5e7eb',
            activeBorderColor: '#C9A227', // gold focus
            hoverBorderColor: '#dfc059',
        }
    }
};
