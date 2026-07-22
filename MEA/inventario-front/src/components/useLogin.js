import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setSession } from '../utils/session';

const API_URL = import.meta.env.VITE_API_URL;

export const useLogin = ({ setIsAuthenticated, setUsername }) => {
  const navigate = useNavigate();
  const [usernameInput, setUsernameInput] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${API_URL}/accounts/api/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        localStorage.setItem('username', usernameInput);
        localStorage.setItem('isAuthenticated', 'true');

        setSession();

        setUsername(usernameInput);
        setIsAuthenticated(true);
        navigate('/dashboard');
      } else {
        setError(data.detail || 'Credenciales inválidas');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    }
  };

  const handleClickShowPassword = () => setShowPassword((prev) => !prev);

  return {
    usernameInput,
    setUsernameInput,
    password,
    setPassword,
    error,
    showPassword,
    handleClickShowPassword,
    handleSubmit,
  };
};

export default useLogin;
