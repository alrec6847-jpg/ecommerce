import React, { createContext, useState, useEffect, useContext } from 'react';
import api, { endpoints } from '../api';

export const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        site_name: 'شركة الريادة المتحدة',
        site_logo: null,
        contact_phone: '07834950300',
        whatsapp_number: '07834950300',
        telegram_username: '07834950300'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get(endpoints.siteSettings);
                if (response.data) {
                    const data = response.data;
                    
                    // Fix logo URL if it's relative
                    if (data.site_logo && typeof data.site_logo === 'string') {
                        if (!data.site_logo.startsWith('http')) {
                            const baseUrl = 'http://167.86.98.95';
                            const path = data.site_logo.startsWith('/') ? data.site_logo : `/${data.site_logo}`;
                            data.site_logo = `${baseUrl}${path}`;
                        }
                    }

                    setSettings(prev => ({
                        ...prev,
                        ...data
                    }));
                }
            } catch (error) {
                console.error('Error fetching site settings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    // Derived helpers
    const formatWhatsApp = (num) => {
        if (!num) return '9647834950300';
        let cleaned = num.replace(/\+/g, '').replace(/\s/g, '');
        if (cleaned.startsWith('0')) {
            cleaned = '964' + cleaned.substring(1);
        } else if (!cleaned.startsWith('964')) {
            cleaned = '964' + cleaned;
        }
        return cleaned;
    };

    const whatsappHref = `https://wa.me/${formatWhatsApp(settings.whatsapp_number)}`;
    const telHref = `tel:${settings.contact_phone || '07834950300'}`;
    const telegramHref = `https://t.me/${settings.telegram_username?.replace('@', '') || '07834950300'}`;

    return (
        <SettingsContext.Provider value={{ 
            settings, 
            loading, 
            whatsappHref, 
            telHref, 
            telegramHref 
        }}>
            {children}
        </SettingsContext.Provider>
    );
};
