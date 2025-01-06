import { useNavigate } from 'react-router-dom';

function Logout() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.ok) {
                
               
                localStorage.removeItem('token'); 
                
                navigate('/login');
            } else {
                console.error('Failed to log out');
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    return (
        <button onClick={handleLogout}>
            Logout
        </button>
    );
}

export default Logout;
