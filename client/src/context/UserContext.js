import React, { createContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState({
        profileImage: '',
        role: '',
        userId: '',
        name: '',
        token: ''
    });
    
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize user state from cookies on app load
    useEffect(() => {
        const loadUserFromCookies = async () => {
            const userId = Cookies.get('userId');
            const profileImage = Cookies.get('profileImage');
            const role = Cookies.get('role');
            const token = Cookies.get('token');
            const name = Cookies.get('name');
            
            if (userId && token) {
                // Set initial user state from cookies
                setUser({
                    profileImage,
                    role,
                    userId,
                    name: name || '',
                    token
                });
                
                // Verify token with server if possible
                if (navigator.onLine) {
                    try {
                        // Set up headers with token
                        const config = {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        };
                        
                        // Call verify-token endpoint
                        await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/auth/verify-token`, config);
                        // If we get here, token is valid
                    } catch (error) {
                        console.warn('Token validation failed, logging out', error);
                        clearUserData();
                    }
                }
            }
            
            setIsInitialized(true);
        };
        
        loadUserFromCookies();
    }, []);

    // Clear all user data from cookies and state
    const clearUserData = () => {
        Cookies.remove('userId');
        Cookies.remove('profileImage');
        Cookies.remove('role');
        Cookies.remove('token');
        Cookies.remove('name');
        
        // Reset user state
        setUser({
            profileImage: '',
            role: '',
            userId: '',
            name: '',
            token: ''
        });
    };
    
    // Logout function that can be called from anywhere
    const logout = async () => {
        const token = Cookies.get('token');
        
        // Try to call logout API if we have a token
        if (token) {
            try {
                await axios.post(
                    `${process.env.REACT_APP_BACKEND_URL}/api/auth/logout`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
            } catch (error) {
                console.error('Error during logout:', error);
                // Continue with client-side logout regardless of API error
            }
        }
        
        // Clear all user data
        clearUserData();
    };

    return (
        <UserContext.Provider value={{ 
            user, 
            setUser, 
            logout, 
            isAuthenticated: !!user.userId && !!user.token,
            isInitialized
        }}>
            {children}
        </UserContext.Provider>
    );
};