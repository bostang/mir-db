import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // Panggil API auth yang sudah kita buat di server.js langkah 5
            const response = await axios.post('http://localhost:5000/api/auth/login', credentials);
            
            // Simpan token dan info user
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('role', response.data.role);
            
            navigate('/'); // Redirect ke Dashboard/Landing Page
        } catch (err) {
            setError('Username atau Password salah!');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
            <form onSubmit={handleLogin} style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
                <h2>MIM-DB</h2>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <div>
                    <label>Username:</label><br/>
                    <input type="text" onChange={(e) => setCredentials({...credentials, username: e.target.value})} required />
                </div>
                <br/>
                <div>
                    <label>Password:</label><br/>
                    <input type="password" onChange={(e) => setCredentials({...credentials, password: e.target.value})} required />
                </div>
                <br/>
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default LoginPage;